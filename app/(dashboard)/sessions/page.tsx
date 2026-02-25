"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteSessions,
  listSessions,
  renameSession,
  type StoredSession,
} from "@/lib/db";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SessionActionsMenuContent } from "@/components/session-actions-menu";

function formatLastAnonymization(iso: string): string {
  const date = new Date(iso);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "Last anonymization just now";
  if (diffMins < 60) return `Last anonymization ${diffMins} min ago`;
  if (diffHours < 24) return `Last anonymization ${diffHours} hr ago`;
  if (diffDays < 7)
    return `Last anonymization ${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  if (diffWeeks < 4)
    return `Last anonymization ${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
  return `Last anonymization ${date.toLocaleDateString()}`;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    listSessions().then(setSessions);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        (s.title ?? "").toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q),
    );
  }, [sessions, search]);

  const allSelected =
    filtered.length > 0 && filtered.every((s) => selectedIds.has(s.id));
  const anySelected = selectedIds.size > 0;

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((s) => s.id)));
    }
  }

  async function handleConfirmDeleteSelected() {
    if (!anySelected) return;
    await deleteSessions(Array.from(selectedIds));
    const updated = await listSessions();
    setSessions(updated);
    setSelectedIds(new Set());
    setDeleteDialogOpen(false);
  }

  function startRename(session: StoredSession) {
    setEditingId(session.id);
    setEditingTitle(session.title ?? "Anonymization");
  }

  async function handleSaveRename() {
    if (!editingId) return;
    const title = editingTitle.trim() || "Anonymization";
    await renameSession(editingId, title);
    const updated = await listSessions();
    setSessions(updated);
    setEditingId(null);
    setEditingTitle("");
  }

  function handleCancelRename() {
    setEditingId(null);
    setEditingTitle("");
  }

  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between pb-0 pt-4 sm:pt-12">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Sessions
        </h1>
        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New session
        </Link>
      </header>

      <div className="py-6">
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search your sessions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-300"
          />
        </div>

        <p className="mb-2 text-sm text-stone-500">
          {filtered.length} session{filtered.length === 1 ? "" : "s"}
        </p>

        <ul className="divide-y divide-stone-100">
          {filtered.map((session) => (
            <li key={session.id} className="group">
              <div className="relative flex items-center py-4 px-4 transition-colors hover:bg-stone-50">
                <Checkbox
                  checked={selectedIds.has(session.id)}
                  onCheckedChange={() => toggleSelected(session.id)}
                  className={
                    "absolute -left-6 top-1/2 -translate-y-1/2 border-stone-300 data-checked:bg-green-700 data-checked:border-green-700 text-white transition-opacity " +
                    (anySelected
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto")
                  }
                />
                <div className="flex-1 min-w-0">
                  {editingId === session.id ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="w-full rounded-md border border-stone-300 bg-white px-2 py-1 text-sm text-stone-900 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
                      />
                      <div className="flex gap-2 text-xs">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSaveRename}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={handleCancelRename}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Link href={`/sessions/${session.id}`} className="block">
                      <p className="truncate font-medium text-stone-900">
                        {session.title ?? "Anonymization"}
                      </p>
                      <p className="mt-0.5 text-sm text-stone-500">
                        {formatLastAnonymization(session.updatedAt)}
                      </p>
                    </Link>
                  )}
                </div>
                <div className="pr-4 pl-2 opacity-0 group-hover:opacity-100">
                  <Popover>
                    <PopoverTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-400 hover:bg-stone-100 hover:text-stone-700">
                      <svg
                        className="size-4"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="3" cy="8" r="1.25" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.25" fill="currentColor" />
                        <circle cx="13" cy="8" r="1.25" fill="currentColor" />
                      </svg>
                    </PopoverTrigger>
                    <PopoverContent
                      side="left"
                      align="end"
                      className="w-40 p-1.5 text-sm gap-0!"
                    >
                      <SessionActionsMenuContent
                        onRename={() => startRename(session)}
                        onDelete={() => {
                          setSelectedIds(new Set([session.id]));
                          setDeleteDialogOpen(true);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-3 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleSelectAll}
                className=" border-stone-300 data-checked:bg-green-700 data-checked:border-green-700 text-white"
              />
              <button
                type="button"
                onClick={toggleSelectAll}
                className="cursor-pointer text-stone-700 hover:text-stone-900"
              >
                Select all
              </button>
            </div>
            <div className="flex items-center gap-3">
              {anySelected && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete selected ({selectedIds.size})
                </Button>
              )}
            </div>
          </div>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete sessions?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                {selectedIds.size === 1
                  ? "the selected session"
                  : "the selected sessions"}
                . This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleConfirmDeleteSelected}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
