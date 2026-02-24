import Link from "next/link";
import { Logo } from "./icons/logo";

export function Footer() {
  return (
    <footer className="border-t border-stone-300 bg-stone-100/80">
      <div className="wrapper py-12 sm:py-14">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link
              href="#"
              className="text-stone-500 transition-colors hover:text-stone-900"
            >
              GitHub
            </Link>
            <Link
              href="/sessions"
              className="text-stone-500 transition-colors hover:text-stone-900"
            >
              My sessions
            </Link>
            <Link
              href="#"
              className="text-stone-500 transition-colors hover:text-stone-900"
            >
              Anonymize now
            </Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-stone-200 pt-8 text-center text-xs text-stone-400 sm:text-left">
          © {new Date().getFullYear()} Anonify. Your data never leaves your
          browser.
        </p>
      </div>
    </footer>
  );
}
