import { Fragment } from "react";

const categories = [
  "Names",
  "API Keys",
  "Locations",
  "Financials",
  "Passwords",
  "Custom Secrets",
];

function Token({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline rounded-sm bg-green-100 px-1 py-0.5 font-mono text-[0.8em] font-semibold text-green-800">
      [{children}]
    </span>
  );
}

export function Hero() {
  return (
    <section className="mx-auto flex max-w-[1400px] flex-col items-center px-6 pt-20 pb-28">
      {/* Pill tag */}
      <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-[0.75rem] font-medium uppercase tracking-[0.15em] text-stone-400">
        Your prompts, your privacy
        <span className="text-stone-300">&rarr;</span>
      </div>

      {/* Heading */}
      <h1 className="text-center text-6xl font-black leading-[0.92] tracking-[-0.03em] text-stone-900 md:text-7xl lg:text-[6.5rem]">
        Protect{" "}
        <em className="font-display text-green-600">sensitive</em> data
        <br />
        in your prompts
      </h1>

      {/* Subtitle */}
      <p className="mt-8 max-w-[40rem] text-center text-lg leading-relaxed text-stone-500">
        Scrub sensitive data from your prompts directly in your browser. Mask
        names, API keys, and financials with context-aware placeholders that keep
        your AI&apos;s logic intact&mdash;all without a single byte leaving your
        device
      </p>

      {/* Buttons */}
      <div className="mt-10 flex items-center gap-4">
        <button className="rounded-full bg-stone-900 px-8 py-3 text-[0.9rem] font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800">
          Anonymize now
        </button>
        <button className="rounded-full border border-stone-900 px-8 py-3 text-[0.9rem] font-semibold text-stone-900 transition-colors hover:bg-stone-900 hover:text-[#F5F0E5]">
          My sessions
        </button>
      </div>

      {/* Categories bar */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full border border-stone-200 px-6 py-3 text-xs text-stone-400">
        <svg
          className="size-3.5 text-stone-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span>Protects your...</span>
        <span className="text-stone-300">&rsaquo;</span>
        {categories.map((item, i) => (
          <Fragment key={item}>
            {i > 0 && <span className="text-stone-300">&middot;</span>}
            <span className="text-stone-500">[{item}]</span>
          </Fragment>
        ))}
      </div>

      {/* Before / After comparison */}
      <div className="mt-20 flex w-full max-w-5xl flex-col items-center gap-6 md:flex-row md:items-stretch md:gap-8">
        {/* Before card */}
        <div className="flex-1 rounded-2xl border border-stone-200 bg-white/60 p-8 text-[0.9rem] leading-[1.75] text-stone-600">
          Can you analyze this server error? It happened when John Miller (id:
          jm_992) tried to access the Stripe production API at 192.168.1.44. He
          was using the secret key sk_live_51Msz82K9l to process a $4,500
          payment for Tesla Inc. We need to know if the leak happened at our
          Palo Alto office or during the handshake.
        </div>

        {/* Arrow */}
        <div className="flex shrink-0 items-center justify-center py-2 md:py-0">
          <svg
            className="h-6 w-14 rotate-90 text-green-600 md:rotate-0"
            viewBox="0 0 56 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="2" y1="12" x2="48" y2="12" />
            <polyline points="42,6 48,12 42,18" />
          </svg>
        </div>

        {/* After card */}
        <div className="flex-1 rounded-2xl border-2 border-green-600/25 bg-white/60 p-8 text-[0.9rem] leading-[1.75] text-stone-600">
          Can you analyze this server error? It happened when{" "}
          <Token>PERSON_1</Token> (id: <Token>ID_1</Token>) tried to access
          the <Token>ORG_1</Token> production API at <Token>IP_ADDR_1</Token>.
          He was using the secret key <Token>SENSITIVE_KEY_1</Token> to process
          a <Token>VALUE_1</Token> payment for <Token>ORG_2</Token>. We need to
          know if the leak happened at our <Token>LOC_1</Token> office or during
          the handshake.
        </div>
      </div>
    </section>
  );
}
