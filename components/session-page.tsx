type Anonymization = {
  id: string;
  title: string;
  original: string;
  protectedText: string;
};

type SessionPageProps = {
  sessionId?: string;
  anonymizations: Anonymization[];
  isNew?: boolean;
};

export function SessionPage({ sessionId, anonymizations, isNew }: SessionPageProps) {
  const hasHistory = anonymizations.length > 0;

  return (
    <div className="flex flex-col gap-8 py-6 sm:py-8">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
            {isNew ? "New session" : "Session"}
          </h1>
          {!isNew && sessionId && (
            <p className="mt-1 text-sm text-stone-500">ID: {sessionId}</p>
          )}
        </div>
      </header>

      {/* Editors row */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Input editor */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-stone-700">Raw prompt</div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-stone-500">
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="ml-2">Input</span>
            </div>
            <textarea
              rows={10}
              className="block w-full resize-none bg-transparent px-5 py-4 text-sm leading-relaxed text-stone-800 placeholder:text-stone-300 focus:outline-none"
              placeholder="Paste or type the text you want to anonymize..."
            />
          </div>
        </div>

        {/* Output editor */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-stone-700">Protected prompt</div>
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-stone-500">
              <span className="size-2.5 rounded-full bg-[#FE5F57]" />
              <span className="size-2.5 rounded-full bg-[#FEBB2F]" />
              <span className="size-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-2">Output</span>
            </div>
            <div className="min-h-[180px] px-5 py-4 text-sm leading-relaxed text-stone-800">
              <span className="text-stone-300">
                Anonymized text will appear here after you run this session.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* History list */}
      <section className="mt-2 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
          Anonymizations in this session
        </h2>
        {!hasHistory && (
          <p className="text-sm text-stone-400">
            No anonymizations yet. Run this session to see a history of protected prompts.
          </p>
        )}
        {hasHistory && (
          <div className="space-y-3">
            {anonymizations.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700"
              >
                <h3 className="mb-2 text-sm font-medium text-stone-900">
                  {item.title}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-stone-50 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
                      Original
                    </p>
                    <p className="text-sm text-stone-700">{item.original}</p>
                  </div>
                  <div className="rounded-xl bg-green-50/60 p-3">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-600">
                      Protected
                    </p>
                    <p className="text-sm text-stone-800">{item.protectedText}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

