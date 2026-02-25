import type {
  DetectionSpan,
  MaskCategory,
  MaskMapping,
  MaskMappingEntry,
  MaskToken,
  ProcessResult,
} from "./mask-types";

import nlp from "compromise";

type CategoryCounters = Record<MaskCategory, number>;

function cloneMapping(mapping: MaskMapping | undefined): MaskMapping {
  if (!mapping) return {};
  return { ...mapping };
}

function buildCounters(mapping: MaskMapping): CategoryCounters {
  const counters = {
    PERSON: 0,
    ORG: 0,
    LOC: 0,
    EMAIL: 0,
    IP: 0,
    CREDIT_CARD: 0,
    API_KEY: 0,
    PASSWORD: 0,
    ID: 0,
    VALUE: 0,
    CUSTOM: 0,
  } as CategoryCounters;

  Object.values(mapping).forEach((entry) => {
    const match = entry.mask.match(/_(\d+)]$/);
    const index = match ? Number(match[1]) : 0;
    counters[entry.category] = Math.max(counters[entry.category], index);
  });

  return counters;
}

function nextMaskToken(
  mapping: MaskMapping,
  counters: CategoryCounters,
  category: MaskCategory,
  value: string
): MaskMappingEntry {
  const existing = mapping[value];
  if (existing) return existing;

  counters[category] += 1;
  const token = `[${category}_${counters[category]}]` as MaskToken;
  const entry: MaskMappingEntry = { original: value, mask: token, category };
  mapping[value] = entry;

  // For PERSON entities, also index individual capitalised tokens so that
  // later single-word mentions (e.g. "Priya" after "Priya Desai") map to
  // the same placeholder. This is a generic synonym expansion, not a
  // hardcoded name list.
  if (category === "PERSON") {
    const parts = value.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      for (const part of parts) {
        const key = part.trim();
        if (!key) continue;
        if (!mapping[key]) {
          mapping[key] = entry;
        }
      }
    }
  }

  return entry;
}

function addSpan(spans: DetectionSpan[], span: DetectionSpan) {
  // Prevent exact duplicates; later workers run after earlier ones.
  const exists = spans.some(
    (s) => s.start === span.start && s.end === span.end
  );
  if (exists) return;
  spans.push(span);
}

// Step 0: apply any existing mapping / custom secrets
function detectFromMapping(text: string, mapping: MaskMapping): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  for (const entry of Object.values(mapping)) {
    const category =
      entry.category === "CUSTOM" ? entry.category : (entry.category as MaskCategory);
    const needle = entry.original;
    if (!needle) continue;

    let idx = text.indexOf(needle);
    while (idx !== -1) {
      addSpan(spans, {
        start: idx,
        end: idx + needle.length,
        value: needle,
        category,
      });
      idx = text.indexOf(needle, idx + needle.length);
    }
  }

  return spans;
}

// Step 1a: regex-based deterministic detection
function detectRegex(text: string): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  // Emails
  const emailRe =
    /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
  for (const match of text.matchAll(emailRe)) {
    if (!match[0]) continue;
    addSpan(spans, {
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      value: match[0],
      category: "EMAIL",
    });
  }

  // IPv4
  const ipv4Re =
    /\b((25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3})\b/g;
  for (const match of text.matchAll(ipv4Re)) {
    if (!match[1]) continue;
    const value = match[1];
    const idx = match.index ?? 0;
    addSpan(spans, {
      start: idx,
      end: idx + value.length,
      value,
      category: "IP",
    });
  }

  // IPv6 (very permissive)
  const ipv6Re =
    /\b([0-9A-Fa-f]{1,4}:){2,7}[0-9A-Fa-f]{1,4}\b/g;
  for (const match of text.matchAll(ipv6Re)) {
    if (!match[0]) continue;
    addSpan(spans, {
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
      value: match[0],
      category: "IP",
    });
  }

  return spans;
}

// Luhn checksum for credit card detection
function isValidLuhn(candidate: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  for (let i = candidate.length - 1; i >= 0; i--) {
    let digit = parseInt(candidate[i], 10);
    if (Number.isNaN(digit)) return false;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

// Step 1b: checksum worker for credit cards
function detectCreditCards(text: string): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  // sequences of 13-19 digits, spaces, or hyphens
  const ccCandidateRe = /\b(?:\d[ -]?){13,19}\b/g;

  for (const match of text.matchAll(ccCandidateRe)) {
    if (!match[0]) continue;
    const raw = match[0];
    const digits = raw.replace(/[^\d]/g, "");
    if (digits.length < 13 || digits.length > 19) continue;
    if (!isValidLuhn(digits)) continue;

    addSpan(spans, {
      start: match.index ?? 0,
      end: (match.index ?? 0) + raw.length,
      value: raw,
      category: "CREDIT_CARD",
    });
  }

  return spans;
}

// Simple entropy estimate: count of unique chars vs length
function estimateEntropy(token: string): number {
  const unique = new Set(token).size;
  return (unique / token.length) * Math.log2(unique || 1);
}

// Step 1c: entropy worker for API keys / passwords
function detectHighEntropy(text: string): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  // Rough tokens: long contiguous non-space strings
  const tokenRe = /\S{20,}/g;
  const hostnameRe = /\b(?:[a-z0-9-]+\.)+[a-z]{2,}\b/i;
  for (const match of text.matchAll(tokenRe)) {
    const value = match[0];
    const idx = match.index ?? 0;

    // Skip obvious hostnames; those are handled by a dedicated worker.
    if (hostnameRe.test(value)) continue;

    const entropy = estimateEntropy(value);
    if (entropy < 2.5) continue; // heuristic threshold

    let category: MaskCategory = "PASSWORD";
    if (/^sk_|^pk_|^rk_/i.test(value) || /api[_-]?key/i.test(value)) {
      category = "API_KEY";
    }

    addSpan(spans, {
      start: idx,
      end: idx + value.length,
      value,
      category,
    });
  }

  return spans;
}

// Step 1d: hostnames and internal resources
function detectHostnames(text: string): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  // Very permissive hostname / FQDN detection, including internal domains.
  const hostRe = /\b(?:[a-z0-9-]+\.)+(?:[a-z]{2,}|internal|local)\b/gi;
  for (const match of text.matchAll(hostRe)) {
    const value = match[0];
    if (!value) continue;
    const idx = match.index ?? 0;

    addSpan(spans, {
      start: idx,
      end: idx + value.length,
      value,
      category: "CUSTOM", // treat infra identifiers as custom secrets
    });
  }

  return spans;
}

// Step 1e: contextual numeric identifiers (routing numbers, account tails, incident IDs)
function detectContextualNumbers(text: string): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  const routingRe = /routing number\s+(\d{5,12})/gi;
  for (const match of text.matchAll(routingRe)) {
    const value = match[1];
    if (!value) continue;
    const full = match[0];
    const idx = match.index ?? 0;
    const start = text.indexOf(value, idx);
    if (start === -1) continue;
    addSpan(spans, {
      start,
      end: start + value.length,
      value,
      category: "VALUE",
    });
  }

  const accountTailRe = /account (?:ending|number)[^0-9]*?(\d{3,10})/gi;
  for (const match of text.matchAll(accountTailRe)) {
    const value = match[1];
    if (!value) continue;
    const idx = match.index ?? 0;
    const start = text.indexOf(value, idx);
    if (start === -1) continue;
    addSpan(spans, {
      start,
      end: start + value.length,
      value,
      category: "VALUE",
    });
  }

  const incidentIdRe = /\b(INC|TKT|CASE|SEC|BUG)[-_]?\d+\b/gi;
  for (const match of text.matchAll(incidentIdRe)) {
    const value = match[0];
    if (!value) continue;
    const idx = match.index ?? 0;
    addSpan(spans, {
      start: idx,
      end: idx + value.length,
      value,
      category: "ID",
    });
  }

  return spans;
}

// Step 2: context worker using compromise.js plus heuristic capitalised sequences
function detectNamedEntities(text: string): DetectionSpan[] {
  const spans: DetectionSpan[] = [];

  const doc = nlp(text);

  const addAll = (values: string[], category: MaskCategory) => {
    for (const value of values) {
      if (!value) continue;

      let searchFrom = 0;
      while (searchFrom < text.length) {
        const idx = text.indexOf(value, searchFrom);
        if (idx === -1) break;

        addSpan(spans, {
          start: idx,
          end: idx + value.length,
          value,
          category,
        });

        searchFrom = idx + value.length;
      }
    }
  };

  addAll(doc.people().out("array") as string[], "PERSON");
  addAll(doc.organizations().out("array") as string[], "ORG");
  addAll(doc.places().out("array") as string[], "LOC");

  // Heuristic: multi-word capitalised sequences that look like names/orgs/locs.
  const capSeqRe = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
  for (const match of text.matchAll(capSeqRe)) {
    const value = match[1];
    if (!value) continue;
    const idx = match.index ?? 0;

    // crude stop-list: skip sentence starters and generic words
    if (/^(The|This|That|When|While|If|We|You|I)\b/.test(value)) continue;

    let category: MaskCategory = "PERSON";

    if (/\b(Hospital|Medical Center|Center|Clinic|Bank|Labs?|LLP|Inc|Corp|LLC|University|College)\b/.test(value)) {
      category = "ORG";
    } else if (/\b(City|Park|County|State)\b/.test(value)) {
      category = "LOC";
    }

    addSpan(spans, {
      start: idx,
      end: idx + value.length,
      value,
      category,
    });
  }

  return spans;
}

function mergeAndSortSpans(spans: DetectionSpan[]): DetectionSpan[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const result: DetectionSpan[] = [];

  for (const span of sorted) {
    const last = result[result.length - 1];
    if (!last) {
      result.push(span);
      continue;
    }

    // If overlapping, keep the earlier (already in result) and skip new one
    if (span.start < last.end) continue;

    result.push(span);
  }

  return result;
}

function applyReplacement(
  text: string,
  spans: DetectionSpan[],
  mapping: MaskMapping,
  counters: CategoryCounters
): { maskedText: string; mapping: MaskMapping } {
  const parts: string[] = [];
  let cursor = 0;

  for (const span of spans) {
    if (span.start > cursor) {
      parts.push(text.slice(cursor, span.start));
    }

    const entry = nextMaskToken(mapping, counters, span.category, span.value);
    parts.push(entry.mask);
    cursor = span.end;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return { maskedText: parts.join(""), mapping };
}

export function processText(
  text: string,
  existingMapping?: MaskMapping
): ProcessResult {
  const mapping = cloneMapping(existingMapping);
  const counters = buildCounters(mapping);
  const spans: DetectionSpan[] = [];

  // Step 0: mapping-based
  spans.push(...detectFromMapping(text, mapping));

  // Step 1: deterministic workers
  spans.push(...detectRegex(text));
  spans.push(...detectCreditCards(text));
  spans.push(...detectHostnames(text));
  spans.push(...detectContextualNumbers(text));
  spans.push(...detectHighEntropy(text));

  // Step 2: lightweight context worker
  spans.push(...detectNamedEntities(text));

  const merged = mergeAndSortSpans(spans);
  const { maskedText, mapping: newMapping } = applyReplacement(
    text,
    merged,
    mapping,
    counters
  );

  return {
    maskedText,
    mapping: newMapping,
    detections: merged,
  };
}

// Rehydrate: convert masks like [PERSON_1] back into original strings from mapping
export function rehydrateText(masked: string, mapping: MaskMapping): string {
  if (!masked) return masked;
  if (!mapping || Object.keys(mapping).length === 0) return masked;

  const byMask = new Map<string, string>();
  for (const entry of Object.values(mapping)) {
    byMask.set(entry.mask, entry.original);
  }

  const tokenRe = /\[([A-Z_]+_\d+)]/g;
  let lastIndex = 0;
  const parts: string[] = [];

  for (const match of masked.matchAll(tokenRe)) {
    const full = match[0];
    const idx = match.index ?? 0;
    if (!full) continue;

    if (idx > lastIndex) {
      parts.push(masked.slice(lastIndex, idx));
    }

    const original = byMask.get(full) ?? full;
    parts.push(original);
    lastIndex = idx + full.length;
  }

  if (lastIndex < masked.length) {
    parts.push(masked.slice(lastIndex));
  }

  return parts.join("");
}

