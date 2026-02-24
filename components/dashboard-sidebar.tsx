"use client";

import { useState } from "react";
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
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-stone-200 bg-white/40 transition-[width] duration-200 ${
        collapsed ? "w-18" : "w-64"
      }`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-4 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && <Logo />}

        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-stone-700"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.5 4C17.3284 4 18 4.67157 18 5.5V14.5C18 15.3284 17.3284 16 16.5 16H3.5C2.67157 16 2 15.3284 2 14.5V5.5C2 4.67157 2.67157 4 3.5 4H16.5ZM7 15H16.5C16.7761 15 17 14.7761 17 14.5V5.5C17 5.22386 16.7761 5 16.5 5H7V15ZM3.5 5C3.22386 5 3 5.22386 3 5.5V14.5C3 14.7761 3.22386 15 3.5 15H6V5H3.5Z"
              fill="black"
            />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-0.5 p-3">
        <Link
          href="/sessions"
          className={`flex items-center rounded-lg py-2.5 text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-900 ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
          title="New session"
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
          {!collapsed && (
            <span className="text-sm font-medium">New session</span>
          )}
        </Link>
        <button
          type="button"
          title="Search"
          className={`flex w-full items-center rounded-lg py-2.5 text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-900 cursor-pointer ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
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
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          {!collapsed && <span className="text-sm font-medium">Search</span>}
        </button>
        <Link
          href="/sessions"
          title="Sessions"
          className={`flex items-center rounded-lg py-2.5 transition-colors ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          } ${
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
          {!collapsed && <span className="text-sm font-medium">Sessions</span>}
        </Link>
      </nav>

      {!collapsed && (
        <div className="mt-4 flex flex-1 flex-col overflow-hidden border-t border-stone-200 pt-4">
          <h3 className="px-5 pb-2 text-xs font-medium text-stone-500">
            Recents
          </h3>

          <ul className="flex-1 space-y-0.5 overflow-y-auto px-2">
            {recents.map((title) => (
              <li key={title}>
                <Link
                  href="/sessions"
                  className="block truncate rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-stone-900 font-medium"
                >
                  {title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
