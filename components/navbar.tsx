"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./icons/logo";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 md:flex">
          <Link
            href="#"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            GitHub
          </Link>
          <Link
            href="#"
            className="text-sm text-stone-500 transition-colors hover:text-stone-900"
          >
            My sessions
          </Link>
          <Link
            href="#"
            className="rounded-full border border-stone-900 px-5 py-2 text-sm font-medium text-stone-900 transition-all hover:bg-stone-900 hover:text-[#F5F0E5]"
          >
            Anonymize now
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-5 bg-stone-900" />
          <span className="block h-0.5 w-5 bg-stone-900" />
          <span className="block h-0.5 w-5 bg-stone-900" />
        </button>
      </nav>

      {/* Mobile menu backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 md:hidden ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile slide-out menu */}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-72 flex-col bg-[#F5F0E5] shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <span className="text-sm font-medium text-stone-400">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-1 text-stone-500 transition-colors hover:text-stone-900"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col px-6">
          <Link
            href="#"
            className="border-b border-stone-200 py-4 text-base font-medium text-stone-700 transition-colors hover:text-stone-900"
            onClick={() => setMenuOpen(false)}
          >
            GitHub
          </Link>
          <Link
            href="#"
            className="border-b border-stone-200 py-4 text-base font-medium text-stone-700 transition-colors hover:text-stone-900"
            onClick={() => setMenuOpen(false)}
          >
            My sessions
          </Link>
        </div>

        <div className="mt-auto px-6 pb-8">
          <Link
            href="#"
            className="block w-full rounded-full bg-stone-900 py-3.5 text-center text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800"
            onClick={() => setMenuOpen(false)}
          >
            Anonymize now
          </Link>
        </div>
      </div>
    </header>
  );
}
