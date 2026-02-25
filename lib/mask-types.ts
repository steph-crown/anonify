export type MaskCategory =
  | "PERSON"
  | "ORG"
  | "LOC"
  | "EMAIL"
  | "IP"
  | "CREDIT_CARD"
  | "API_KEY"
  | "PASSWORD"
  | "ID"
  | "VALUE"
  | "CUSTOM";

export type MaskToken = `[${MaskCategory}_${number}]`;

export interface MaskMappingEntry {
  original: string;
  mask: MaskToken;
  category: MaskCategory;
}

// Keyed by original text. For stable behavior, always treat keys as case-sensitive.
export type MaskMapping = Record<string, MaskMappingEntry>;

export interface DetectionSpan {
  start: number;
  end: number;
  value: string;
  category: MaskCategory;
}

export interface ProcessResult {
  maskedText: string;
  mapping: MaskMapping;
  detections: DetectionSpan[];
}

