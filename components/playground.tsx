"use client";

import { useState, type ReactNode } from "react";

type EditorShellProps = {
  dotVariant?: "neutral" | "traffic";
  children: ReactNode;
};

function EditorShell({
  dotVariant = "neutral",
  children,
}: Readonly<EditorShellProps>) {
  const dotColors =
    dotVariant === "traffic"
      ? ["#FE5F57", "#FEBB2F", "#28C840"]
      : ["#D6D3D1", "#D6D3D1", "#D6D3D1"];

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50 shadow-sm">
      <div className="flex items-center gap-1.5 border-b border-stone-300/50 bg-stone-100 px-4 py-3.5">
        {dotColors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="size-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <div className="min-h-[284px] sm:min-h-[404px] px-5 py-4 text-sm leading-relaxed text-stone-700">
        {children}
      </div>
    </div>
  );
}

export function Playground() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleCopy = async () => {
    if (output) await navigator.clipboard.writeText(output);
  };

  return (
    <section className="border-y border-stone-300 bg-white/40">
      <div className="wrapper flex flex-col items-center py-16 sm:py-28">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-600/20 bg-green-700 px-4 py-1.5 text-xs font-medium text-green-50">
          <span className="size-1.5 rounded-full bg-green-50" /> No data will
          leave your browser
        </div>

        {/* Heading */}
        <h2 className="text-center text-3xl font-black tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
          Try it out now
        </h2>

        {/* Subtitle */}
        <p className="mt-4 max-w-xl text-center text-sm sm:text-base leading-normal text-stone-500">
          Drop your raw text into the box on the left, then click Anonymize to
          instantly mask your secrets. No data leaves your browser&mdash;we
          handle everything locally with context-aware placeholders.
        </p>

        {/* Editor panels */}
        <div className="mt-12 grid w-full max-w-6xl gap-10 md:grid-cols-2">
          {/* Input panel */}
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[0.65rem] font-semibold uppercase  text-stone-500">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
              >
                <g clipPath="url(#clip0_41_113)">
                  <path
                    d="M13.7662 7.11378L3.66748 9.49128C2.73748 9.70878 2.02873 10.3875 1.76623 11.3063C1.50373 12.225 1.75123 13.1738 2.42623 13.8488L3.22873 14.6513L1.39498 16.485C0.903728 16.9763 0.633728 17.625 0.633728 18.3188C0.633728 19.0125 0.903728 19.665 1.39498 20.1525L3.83998 22.5975C4.33123 23.0888 4.97998 23.3588 5.67373 23.3588C6.36748 23.3588 7.01998 23.0888 7.50748 22.5975L9.34123 20.7638L10.1437 21.5663C10.8187 22.2413 11.7712 22.4888 12.6862 22.2263C13.605 21.9638 14.2837 21.255 14.5012 20.325L16.8787 10.23C17.085 9.34878 16.8262 8.44128 16.1887 7.80003C15.555 7.16628 14.6475 6.90753 13.7662 7.11378ZM15.2025 9.84003L12.825 19.935C12.72 20.3813 12.3675 20.5275 12.2212 20.5688C12.075 20.61 11.6962 20.6738 11.3737 20.3475L9.95998 18.9338C9.62248 18.5963 9.07498 18.5963 8.73748 18.9338L6.29248 21.3788C5.96623 21.705 5.39623 21.705 5.06998 21.3788L2.62498 18.9338C2.45998 18.7688 2.36998 18.555 2.36998 18.3225C2.36998 18.09 2.45998 17.8725 2.62498 17.7113L5.06998 15.2663C5.40748 14.9288 5.40748 14.3813 5.06998 14.0438L3.65623 12.63C3.33373 12.3075 3.39373 11.9288 3.43498 11.7825C3.47623 11.6363 3.62248 11.2838 4.06873 11.1788L14.1637 8.80128C14.5875 8.70003 14.8725 8.92878 14.9737 9.03003C15.075 9.13128 15.3 9.41628 15.2025 9.84003ZM20.9475 3.05253C20.6212 2.72628 20.0887 2.72628 19.7587 3.05253L17.3137 5.49753C16.9875 5.82378 16.9875 6.35628 17.3137 6.68628C17.4787 6.85128 17.6925 6.93378 17.9062 6.93378C18.12 6.93378 18.3375 6.85128 18.4987 6.68628L20.9437 4.24128C21.2775 3.91128 21.2775 3.37878 20.9475 3.05253ZM22.5 8.19003H19.4812C19.0162 8.19003 18.6412 8.56503 18.6412 9.03003C18.6412 9.49503 19.0162 9.87003 19.4812 9.87003H22.5C22.965 9.87003 23.34 9.49503 23.34 9.03003C23.34 8.56503 22.965 8.19003 22.5 8.19003ZM14.97 5.35878C15.435 5.35878 15.81 4.98378 15.81 4.51878V1.50003C15.81 1.03503 15.435 0.660034 14.97 0.660034C14.505 0.660034 14.13 1.03503 14.13 1.50003V4.51878C14.1337 4.98003 14.5087 5.35878 14.97 5.35878Z"
                    fill="currentColor"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_41_113">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Paste or type raw text
            </div>
            <EditorShell dotVariant="neutral">
              <textarea
                className="block h-[232px] w-full resize-none bg-transparent text-sm leading-relaxed text-stone-700 placeholder:text-stone-300 focus:outline-none"
                placeholder="Type here ..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </EditorShell>
          </div>

          {/* Output panel */}
          <div>
            <button
              onClick={handleCopy}
              className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[0.65rem] font-semibold uppercase text-stone-500 transition-colors hover:border-green-300 hover:text-green-700"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-5"
              >
                <path
                  d="M17 4H15.82C15.6137 3.41645 15.2319 2.911 14.7271 2.55294C14.2222 2.19488 13.6189 2.00174 13 2H11C10.3811 2.00174 9.7778 2.19488 9.27293 2.55294C8.76807 2.911 8.38631 3.41645 8.18 4H7C6.20435 4 5.44129 4.31607 4.87868 4.87868C4.31607 5.44129 4 6.20435 4 7V19C4 19.7956 4.31607 20.5587 4.87868 21.1213C5.44129 21.6839 6.20435 22 7 22H17C17.7956 22 18.5587 21.6839 19.1213 21.1213C19.6839 20.5587 20 19.7956 20 19V7C20 6.20435 19.6839 5.44129 19.1213 4.87868C18.5587 4.31607 17.7956 4 17 4ZM10 5C10 4.73478 10.1054 4.48043 10.2929 4.29289C10.4804 4.10536 10.7348 4 11 4H13C13.2652 4 13.5196 4.10536 13.7071 4.29289C13.8946 4.48043 14 4.73478 14 5V6H10V5ZM18 19C18 19.2652 17.8946 19.5196 17.7071 19.7071C17.5196 19.8946 17.2652 20 17 20H7C6.73478 20 6.48043 19.8946 6.29289 19.7071C6.10536 19.5196 6 19.2652 6 19V7C6 6.73478 6.10536 6.48043 6.29289 6.29289C6.48043 6.10536 6.73478 6 7 6H8V7C8 7.26522 8.10536 7.51957 8.29289 7.70711C8.48043 7.89464 8.73478 8 9 8H15C15.2652 8 15.5196 7.89464 15.7071 7.70711C15.8946 7.51957 16 7.26522 16 7V6H17C17.2652 6 17.5196 6.10536 17.7071 6.29289C17.8946 6.48043 18 6.73478 18 7V19Z"
                  fill="currentColor"
                />
              </svg>
              Copy protected prompt
            </button>
            <EditorShell dotVariant="traffic">
              {output || (
                <span className="text-stone-300">Output shows here ...</span>
              )}
            </EditorShell>
          </div>
        </div>

        {/* Anonymize button */}
        <button className="mt-8 rounded-full bg-stone-900 px-10 py-3 text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800">
          Anonymize
        </button>

        {/* Footer reassurance */}
        <p className="mt-6 text-center text-xs text-stone-400">
          Go ahead, paste a real secret. It never leaves your browser.
        </p>
      </div>
    </section>
  );
}
