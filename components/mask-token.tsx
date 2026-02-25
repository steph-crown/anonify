import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type MaskTokenProps = Readonly<{
  children: ReactNode;
  /**
   * Enable hover eye icon + unmask menu.
   * Only passed where we have unmask callbacks (session page output).
   */
  interactive?: boolean;
  /** Full mask token including brackets, e.g. "[PERSON_1]". */
  fullToken?: string;
  /** Index of this token in the masked string (for unmask-one). */
  index?: number;
  onUnmaskOne?: (maskToken: string, index: number) => void;
  onUnmaskAll?: (maskToken: string) => void;
}>;

export function MaskToken({
  children,
  interactive,
  fullToken,
  index,
  onUnmaskOne,
  onUnmaskAll,
}: MaskTokenProps) {
  const label =
    typeof children === "string" || typeof children === "number"
      ? String(children)
      : "";
  const mask = fullToken ?? `[${label}]`;
  const canUnmask = interactive && onUnmaskOne && onUnmaskAll;

  return (
    <span className="relative inline-flex items-center align-baseline group">
      <span className="inline rounded-sm bg-green-100 px-1 py-0.5 font-mono text-[0.8em] font-semibold text-green-800">
        [{label}]
      </span>
      {canUnmask && typeof index === "number" && (
        <Popover>
          <PopoverTrigger className="absolute bg-white right-1 cursor-pointer top-1/2 inline-flex h-4 w-4  -translate-y-1/2 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
            <svg
              className="size-3"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 3C4.667 3 2.333 5 1.333 8C2.333 11 4.667 13 8 13C11.333 13 13.667 11 14.667 8C13.667 5 11.333 3 8 3Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 10.333C9.28866 10.333 10.3333 9.28835 10.3333 7.99967C10.3333 6.711 9.28866 5.66634 8 5.66634C6.71133 5.66634 5.66667 6.711 5.66667 7.99967C5.66667 9.28835 6.71133 10.333 8 10.333Z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="w-44 p-1.5 text-xs gap-0!"
          >
            <button
              type="button"
              className="flex w-full items-center rounded px-2 py-1.5 text-left text-stone-700 hover:bg-stone-100 font-medium"
              onClick={() => onUnmaskOne?.(mask, index)}
            >
              Unmask this instance
            </button>
            <button
              type="button"
              className="mt-0.5 flex w-full items-center rounded px-2 py-1.5 text-left text-stone-700 hover:bg-stone-100 font-medium"
              onClick={() => onUnmaskAll?.(mask)}
            >
              Unmask all {mask}
            </button>
          </PopoverContent>
        </Popover>
      )}
    </span>
  );
}
