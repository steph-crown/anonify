"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./icons/logo";

const recents = [
  "Prompt with API keys and names",
  "Support ticket with PII",
  "Financial summary anonymization",
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const isSessions = pathname === "/sessions";

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-stone-200 bg-[#EFE6D8]">
      <div className="flex items-center justify-between gap-2 border-b border-stone-200 px-4 py-4">
        <Logo />
      </div>

      <nav className="flex flex-col gap-0.5 p-3">
        <Link
          href="/sessions"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
        >
          <svg
            className="size-5 shrink-0 text-stone-500"
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
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
        >
          <svg
            className="size-5 shrink-0 text-stone-500"
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
          Search
        </button>
        <Link
          href="/sessions"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isSessions
              ? "bg-stone-200/80 text-stone-900"
              : "text-stone-700 hover:bg-stone-200/60 hover:text-stone-900"
          }`}
        >
          <svg
            className="size-5 shrink-0 text-stone-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Sessions
        </Link>
      </nav>

      <div className="mt-4 flex flex-1 flex-col overflow-hidden border-t border-stone-200 pt-4">
        <h3 className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
          Recents
        </h3>
        <ul className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {recents.map((title) => (
            <li key={title}>
              <Link
                href="/sessions"
                className="block truncate rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
              >
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
