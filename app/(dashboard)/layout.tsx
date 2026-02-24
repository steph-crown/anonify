"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Logo } from "@/components/icons/logo";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen bg-[#F5F0E5]">
      {/* Mobile top bar: collapse icon + centered logo */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex size-8 items-center justify-center rounded-md text-stone-600 hover:bg-stone-200/70"
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
              fill="currentColor"
            />
          </svg>
        </button>

        <div className="flex flex-1 justify-center">
          <Logo />
        </div>

        {/* spacer to balance the left icon */}
        <div className="w-8" />
      </header>

      {/* Desktop layout: unchanged */}
      <div className="flex h-full">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 overflow-auto bg-white ">
          <div className="max-w-[900px] mx-auto px-4">{children}</div>
        </main>
      </div>

      {/* Mobile slide-in overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-full transform bg-white shadow-xl transition-transform duration-200 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            variant="overlay"
            onOverlayClose={() => setMobileOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
