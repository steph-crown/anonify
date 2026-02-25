"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { MaskToken } from "./mask-token";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SessionActionsMenuContent } from "@/components/session-actions-menu";
import { processText } from "@/lib/mask-engine";
import type { MaskMapping, MaskMappingEntry } from "@/lib/mask-types";
import {
  addAnonymization,
  createSession,
  deleteAnonymizationsBySessionId,
  deleteSession,
  getSession,
  listAnonymizations,
  renameSession,
  type StoredAnonymization,
} from "@/lib/db";

type SessionPageProps = Readonly<{
  sessionId?: string;
  mode: "new" | "existing";
}>;

type MaskTokenActions = {
  interactive?: boolean;
  onUnmaskOne?: (maskToken: string, index: number) => void;
  onUnmaskAll?: (maskToken: string) => void;
  getOriginal?: (maskToken: string) => string | null;
};

function renderMaskedText(masked: string, actions?: MaskTokenActions) {
  if (!masked) return null;
  const nodes: React.ReactNode[] = [];
  const re = /\[([A-Z]+_\d+)]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(masked)) !== null) {
    const full = match[0]; // e.g. [PERSON_1]
    const inner = match[1]; // e.g. PERSON_1
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push(masked.slice(lastIndex, index));

    const key = `${index}-${inner}`;

    if (actions?.interactive && actions.onUnmaskOne && actions.onUnmaskAll) {
      const originalValue = actions.getOriginal
        ? actions.getOriginal(full)
        : null;
      nodes.push(
        <MaskToken
          key={key}
          interactive
          fullToken={full}
          index={index}
          originalValue={originalValue}
          onUnmaskOne={actions.onUnmaskOne}
          onUnmaskAll={actions.onUnmaskAll}
        >
          {inner}
        </MaskToken>,
      );
    } else {
      nodes.push(<MaskToken key={key}>{inner}</MaskToken>);
    }

    lastIndex = index + full.length;
  }
  if (lastIndex < masked.length) nodes.push(masked.slice(lastIndex));
  return nodes;
}

/** Derive a short session title from the first anonymization's masked text (first line, ~60 chars). */
function sessionTitleFromMasked(masked: string): string {
  const firstLine = masked.split(/\r?\n/)[0]?.trim() ?? "";
  const short = firstLine.slice(0, 60).trim();
  if (!short) return "Anonymization";
  return firstLine.length > 60 ? `${short}…` : short;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins === 1 ? "" : "s"} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffWeeks < 4)
    return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

export function SessionPage({ sessionId: initialId, mode }: SessionPageProps) {
  const router = useRouter();
  const [sessionId] = useState<string | undefined>(initialId);
  const [raw, setRaw] = useState("");
  const [masked, setMasked] = useState("");
  const [mapping, setMapping] = useState<MaskMapping>({});
  const [history, setHistory] = useState<StoredAnonymization[]>([]);
  const [loading, setLoading] = useState(mode === "existing");
  const [mappingsOpen, setMappingsOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState<string | undefined>(
    undefined,
  );
  const [renamingTitle, setRenamingTitle] = useState(false);
  const [renameTitleInput, setRenameTitleInput] = useState("");
  const [deleteSessionOpen, setDeleteSessionOpen] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const hasHistory = history.length > 0;
  const isNew = mode === "new";
  const lastRaw = (history[0]?.raw ?? "").trim();
  const currentRaw = raw.trim();
  const isDuplicateInput = !!lastRaw && lastRaw === currentRaw;

  useEffect(() => {
    if (mode !== "existing") {
      setLoading(false);
      return;
    }
    if (!initialId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const items = await listAnonymizations(initialId);
        const session = await getSession(initialId);
        if (cancelled) return;
        setHistory(items);
        if (session) {
          setSessionTitle(session.title ?? "Anonymization");
        }
        if (items.length > 0) {
          const latest = items[0];
          setRaw(latest.raw);
          setMasked(latest.masked);
          setMapping(latest.mapping ?? {});
        }
      } catch {
        if (!cancelled) setLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialId, mode]);

  useEffect(() => {
    if (!isNew) return;
    if (loading) return;
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [isNew, loading]);

  const mappingEntries = useMemo(() => {
    const byOriginal = new Map<string, MaskMappingEntry>();
    Object.values(mapping ?? {}).forEach((entry) => {
      const key = entry.original.trim().toLowerCase();
      if (!byOriginal.has(key)) {
        byOriginal.set(key, entry);
      }
    });
    return Array.from(byOriginal.values());
  }, [mapping]);

  function loadAnonymization(item: StoredAnonymization) {
    setRaw(item.raw);
    setMasked(item.masked);
    setMapping(item.mapping ?? {});
  }

  async function copyOutput() {
    if (!masked) return;
    await navigator.clipboard.writeText(masked);
    toast.success("Copied to clipboard");
  }

  async function handleClearSession() {
    if (!sessionId) return;
    await deleteAnonymizationsBySessionId(sessionId);
    setHistory([]);
    setRaw("");
    setMasked("");
    setMapping({});
    setClearConfirmOpen(false);
  }

  function startRenameTitle() {
    setRenamingTitle(true);
    setRenameTitleInput(sessionTitle ?? "Anonymization");
  }

  async function handleSaveTitle() {
    if (!sessionId) return;
    const title = renameTitleInput.trim() || "Anonymization";
    await renameSession(sessionId, title);
    setSessionTitle(title);
    setRenamingTitle(false);
    setRenameTitleInput("");
  }

  function handleCancelTitle() {
    setRenamingTitle(false);
    setRenameTitleInput("");
  }

  async function handleDeleteSessionConfirm() {
    if (!sessionId) return;
    await deleteSession(sessionId);
    setDeleteSessionOpen(false);
    router.replace("/sessions");
  }

  function getOriginalForMask(maskToken: string): string | null {
    for (const entry of Object.values(mapping ?? {})) {
      if (entry.mask === maskToken) return entry.original;
    }
    return null;
  }

  function handleUnmaskInstance(maskToken: string, index: number) {
    const original = getOriginalForMask(maskToken);
    if (!original) return;

    setMasked((prev) => {
      if (!prev) return prev;
      return (
        prev.slice(0, index) +
        original +
        prev.slice(index + maskToken.length)
      );
    });

    setHistory((prev) => {
      if (!prev.length) return prev;
      const [latest, ...rest] = prev;
      const newMasked =
        latest.masked.slice(0, index) +
        original +
        latest.masked.slice(index + maskToken.length);
      return [{ ...latest, masked: newMasked }, ...rest];
    });
  }

  function handleUnmaskAll(maskToken: string) {
    const original = getOriginalForMask(maskToken);
    if (!original) return;

    setMasked((prev) =>
      prev ? prev.split(maskToken).join(original) : prev,
    );

    setHistory((prev) =>
      prev.map((item) => {
        if (!item.masked.includes(maskToken)) return item;
        const newMasked = item.masked.split(maskToken).join(original);
        const newMapping = { ...item.mapping };
        for (const [key, entry] of Object.entries(newMapping)) {
          if (entry.mask === maskToken) {
            // remove this mapping for this anonymization
            // so it no longer appears in its mapping table
            delete newMapping[key];
          }
        }
        return { ...item, masked: newMasked, mapping: newMapping };
      }),
    );

    setMapping((prev) => {
      const next = { ...prev };
      for (const [key, entry] of Object.entries(next)) {
        if (entry.mask === maskToken) {
          delete next[key];
        }
      }
      return next;
    });
  }

  async function handleAnonymize() {
    if (!currentRaw) return;
    if (isDuplicateInput) return;
    if (!sessionId && mode === "new") {
      const result = processText(raw, {});
      const title = sessionTitleFromMasked(result.maskedText);
      const session = await createSession(title);
      await addAnonymization({
        sessionId: session.id,
        raw,
        masked: result.maskedText,
        mapping: result.mapping,
      });
      router.replace(`/sessions/${session.id}`);
      return;
    }
    if (!sessionId) return;
    const result = processText(raw, mapping);
    const stored = await addAnonymization({
      sessionId,
      raw,
      masked: result.maskedText,
      mapping: result.mapping,
    });
    setMapping(result.mapping);
    setMasked(result.maskedText);
    setHistory((prev) => [stored, ...prev]);
  }

  return (
    <div className="flex flex-col gap-8 ">
      <header className="flex items-center justify-between pb-0 pt-4 sm:pt-12">
        <div className="w-max">
          {isNew || !sessionId ? (
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">
              New session
            </h1>
          ) : (
            <>
              {renamingTitle ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={renameTitleInput}
                    onChange={(e) => setRenameTitleInput(e.target.value)}
                    className="w-full max-w-xs rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                    placeholder="Session title"
                  />
                  <div className="flex gap-2 text-xs">
                    <Button type="button" size="sm" onClick={handleSaveTitle}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelTitle}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Popover>
                  <PopoverTrigger className="inline-flex max-w-xs items-center gap-1 rounded-md px-1.5 py-1 text-left text-xl font-semibold tracking-tight text-stone-900 hover:bg-stone-100 sm:max-w-sm">
                    <span className="truncate">
                      {sessionTitle ?? "Session"}
                    </span>
                    <svg
                      className="size-4 text-stone-500"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </PopoverTrigger>
                  <PopoverContent
                    side="bottom"
                    align="start"
                    className="w-40 p-1.5 text-sm gap-0!"
                  >
                    <SessionActionsMenuContent
                      onRename={startRenameTitle}
                      onDelete={() => setDeleteSessionOpen(true)}
                    />
                  </PopoverContent>
                </Popover>
              )}
              <p className="mt-1 text-sm text-stone-500">ID: {sessionId}</p>
            </>
          )}
        </div>

        <Dialog open={mappingsOpen} onOpenChange={setMappingsOpen}>
          <DialogTrigger
            disabled={mappingEntries.length === 0}
            render={
              <Button
                type="button"
                disabled={mappingEntries.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800 disabled:opacity-60 h-10"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-4"
                >
                  <path
                    d="M22 15H20V12C20 11.7348 19.8946 11.4804 19.7071 11.2929C19.5196 11.1054 19.2652 11 19 11H13V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8V2C16 1.73478 15.8946 1.48043 15.7071 1.29289C15.5196 1.10536 15.2652 1 15 1H9C8.73478 1 8.48043 1.10536 8.29289 1.29289C8.10536 1.48043 8 1.73478 8 2V8C8 8.26522 8.10536 8.51957 8.29289 8.70711C8.48043 8.89464 8.73478 9 9 9H11V11H5C4.73478 11 4.48043 11.1054 4.29289 11.2929C4.10536 11.4804 4 11.7348 4 12V15H2C1.73478 15 1.48043 15.1054 1.29289 15.2929C1.10536 15.4804 1 15.7348 1 16V22C1 22.2652 1.10536 22.5196 1.29289 22.7071C1.48043 22.8946 1.73478 23 2 23H8C8.26522 23 8.51957 22.8946 8.70711 22.7071C8.89464 22.5196 9 22.2652 9 22V16C9 15.7348 8.89464 15.4804 8.70711 15.2929C8.51957 15.1054 8.26522 15 8 15H6V13H18V15H16C15.7348 15 15.4804 15.1054 15.2929 15.2929C15.1054 15.4804 15 15.7348 15 16V22C15 22.2652 15.1054 22.5196 15.2929 22.7071C15.4804 22.8946 15.7348 23 16 23H22C22.2652 23 22.5196 22.8946 22.7071 22.7071C22.8946 22.5196 23 22.2652 23 22V16C23 15.7348 22.8946 15.4804 22.7071 15.2929C22.5196 15.1054 22.2652 15 22 15ZM7 17V21H3V17H7ZM10 7V3H14V7H10ZM21 21H17V17H21V21Z"
                    fill="#F5F0E5"
                  />
                </svg>
                View mappings
              </Button>
            }
          />
          <DialogContent className="max-h-[500px] max-w-6xl overflow-hidden flex flex-col sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-semibold">Mask mapping</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto -mx-1 px-1">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-left sticky top-0 bg-white">
                    <th className="py-2 pr-4 font-semibold text-stone-500">
                      Mask
                    </th>
                    <th className="py-2 pr-4 font-semibold text-stone-500">
                      Category
                    </th>
                    <th className="py-2 font-semibold text-stone-500">
                      Original
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mappingEntries.map((entry) => (
                    <tr key={entry.mask} className="border-b border-stone-100">
                      <td className="py-1.5 pr-4 font-mono text-[0.75rem]">
                        {entry.mask}
                      </td>
                      <td className="py-1.5 pr-4">{entry.category}</td>
                      <td className="py-1.5 wrap-break-word">
                        {entry.original}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Editors row */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 h-8">
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="ml-2">Input</span>
            </div>
            <textarea
              ref={inputRef}
              rows={10}
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              className="block h-[300px] w-full resize-none bg-transparent px-5 py-4 text-sm leading-relaxed text-stone-800 placeholder:text-stone-300 focus:outline-none"
              placeholder="Paste or type the text you want to anonymize..."
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center justify-between gap-2 border-b border-stone-200 bg-stone-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-500 h-8">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#FE5F57]" />
                <span className="size-2.5 rounded-full bg-[#FEBB2F]" />
                <span className="size-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2">Output</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={copyOutput}
                disabled={!masked}
                className="h-7 shrink-0 text-xs font-semibold uppercase tracking-wide text-stone-500 hover:text-stone-800 disabled:opacity-50"
              >
                Copy
              </Button>
            </div>
            <div className="h-[300px] overflow-y-auto px-5 py-4 text-sm leading-relaxed text-stone-800">
              {masked ? (
                renderMaskedText(masked, {
                  interactive: true,
                  onUnmaskOne: handleUnmaskInstance,
                  onUnmaskAll: handleUnmaskAll,
                  getOriginal: getOriginalForMask,
                })
              ) : (
                <span className="text-stone-300">
                  Anonymized text will appear here after you run this session.
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Anonymize button — centered below editors */}
      <div className="flex justify-center">
        <Button
          type="button"
          disabled={loading || !currentRaw || isDuplicateInput}
          onClick={handleAnonymize}
          className="rounded-full bg-stone-900 px-6 py-2.5 text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800 disabled:opacity-60 h-10"
        >
          Anonymize
        </Button>
      </div>

      {/* History list */}
      <section className="mt-2 space-y-3">
        {hasHistory && (
          <div className="flex flex-col">
            {history.map((item) => (
              <article
                key={item.id}
                className="border-t last:border-b border-stone-200 bg-white text-left"
              >
                <button
                  type="button"
                  onClick={() => loadAnonymization(item)}
                  className="w-full cursor-pointer px-4 py-3 text-sm text-stone-700 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400"
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl bg-stone-50 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500 text-left">
                        Original
                      </p>
                      <p className="line-clamp-2 overflow-hidden whitespace-pre-wrap text-sm text-stone-700 text-left">
                        {item.raw}
                      </p>
                    </div>
                    <div className="rounded-xl bg-green-50/60 p-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-600 text-left">
                        Protected
                      </p>
                      <p className="line-clamp-2 overflow-hidden text-sm text-stone-800 whitespace-pre-wrap text-left">
                        {renderMaskedText(item.masked)}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-stone-500 text-left">
                    {(() => {
                      const sensitiveCount =
                        item.masked.match(/\[[A-Z]+_\d+]/g)?.length ?? 0;
                      const totalTokens = item.raw
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean).length;
                      return `${sensitiveCount}/${
                        totalTokens || 0
                      } sensitive tokens found · ${formatRelativeTime(
                        item.createdAt,
                      )}`;
                    })()}
                  </p>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      {mode === "existing" && sessionId && (
        <>
          <div className="flex justify-center pt-4">
            <AlertDialog
              open={clearConfirmOpen}
              onOpenChange={setClearConfirmOpen}
            >
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setClearConfirmOpen(true)}
              >
                Clear session
              </Button>
              <AlertDialogContent className="max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear session?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove all anonymizations in this session. The session
                    itself will be kept.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 text-white hover:bg-red-700"
                    onClick={handleClearSession}
                  >
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <AlertDialog
            open={deleteSessionOpen}
            onOpenChange={setDeleteSessionOpen}
          >
            <AlertDialogContent className="max-w-sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this session and all of its
                  anonymizations. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 text-white hover:bg-red-700"
                  onClick={handleDeleteSessionConfirm}
                >
                  Delete session
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
