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
    <section className="wrapper flex flex-col items-center pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* Heading */}
      <h1 className="mt-6 text-center text-4xl font-black leading-[0.92] tracking-[-0.03em] text-stone-900 sm:text-5xl md:text-7xl lg:text-[6.5rem]">
        Protect <em className="font-display text-green-600">sensitive</em> data
        <br />
        in your prompts
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-200 text-center text-sm leading-normal text-stone-500 sm:mt-8 sm:text-lg">
        Scrub sensitive data from your prompts directly in your browser. Mask
        names, API keys, and financials with context-aware placeholders that
        keep your AI&apos;s logic intact&mdash;all without a single byte leaving
        your device
      </p>

      {/* Buttons */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4 w-full sm:w-[unset]">
        <button className="w-full rounded-full bg-stone-900 px-8 py-3 text-[0.9rem] font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800 sm:w-auto">
          Anonymize now
        </button>

        <a
          href="/sessions"
          className="w-full rounded-full border border-stone-900 px-8 py-3 text-center text-[0.9rem] font-semibold text-stone-900 transition-colors hover:bg-stone-900 hover:text-[#F5F0E5] sm:w-auto"
        >
          My sessions
        </a>
      </div>

      {/* Categories bar */}
      <div className="mt-6 flex items-center justify-center gap-3 text-sm">
        <svg
          className="size-4 text-stone-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="font-medium text-stone-700">Protects your...</span>
        <span className="text-stone-400">&rsaquo;</span>
        <span className="grid justify-items-start items-center overflow-hidden">
          {categories.map((item, i) => (
            <span
              key={item}
              className="col-start-1 row-start-1 animate-category-cycle whitespace-nowrap rounded-md bg-green-100 px-2 py-0.5 font-semibold text-green-700"
              style={{ animationDelay: `${i * 2}s` }}
            >
              [{item}]
            </span>
          ))}
        </span>
      </div>

      {/* Before / After comparison */}
      <div className="mt-14 flex w-full max-w-5xl flex-col items-center gap-6 sm:mt-20 md:flex-row md:items-stretch md:gap-8">
        {/* Before card */}
        <div className="flex-1 rounded-2xl border border-stone-200 bg-white/60 p-5 text-[0.85rem] leading-[1.75] text-stone-600 sm:p-8 sm:text-[0.9rem]">
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
        <div className="flex-1 animate-border-pulse rounded-2xl border-4 bg-white/60 p-5 text-[0.85rem] leading-[1.75] text-stone-600 sm:p-8 sm:text-[0.9rem]">
          Can you analyze this server error? It happened when{" "}
          <Token>PERSON_1</Token> (id: <Token>ID_1</Token>) tried to access the{" "}
          <Token>ORG_1</Token> production API at <Token>IP_ADDR_1</Token>. He
          was using the secret key <Token>SENSITIVE_KEY_1</Token> to process a{" "}
          <Token>VALUE_1</Token> payment for <Token>ORG_2</Token>. We need to
          know if the leak happened at our <Token>LOC_1</Token> office or during
          the handshake.
        </div>
      </div>
    </section>
  );
}
