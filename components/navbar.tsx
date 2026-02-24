import Link from "next/link";
import { Logo } from "./icons/logo";

export function Navbar() {
  return (
    <header className="w-full">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-10">
        <Logo />

        <div className="flex items-center gap-7">
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
      </nav>
    </header>
  );
}
