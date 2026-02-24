import Link from "next/link";

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

export function SessionPage({
  sessionId,
  anonymizations,
  isNew,
}: SessionPageProps) {
  const hasHistory = anonymizations.length > 0;

  return (
    <div className="flex flex-col gap-8 ">
      <header className="flex items-center justify-between pb-0 pt-4 sm:pt-12">
        <div className="w-max">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            {isNew ? "New session" : "Session"}
          </h1>
          {!isNew && sessionId && (
            <p className="mt-1 text-sm text-stone-500">ID: {sessionId}</p>
          )}
        </div>

        <Link
          href="/new"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4"
          >
            <path
              d="M22 15H20V12C20 11.7348 19.8946 11.4804 19.7071 11.2929C19.5196 11.1054 19.2652 11 19 11H13V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8V2C16 1.73478 15.8946 1.48043 15.7071 1.29289C15.5196 1.10536 15.2652 1 15 1H9C8.73478 1 8.48043 1.10536 8.29289 1.29289C8.10536 1.48043 8 1.73478 8 2V8C8 8.26522 8.10536 8.51957 8.29289 8.70711C8.48043 8.89464 8.73478 9 9 9H11V11H5C4.73478 11 4.48043 11.1054 4.29289 11.2929C4.10536 11.4804 4 11.7348 4 12V15H2C1.73478 15 1.48043 15.1054 1.29289 15.2929C1.10536 15.4804 1 15.7348 1 16V22C1 22.2652 1.10536 22.5196 1.29289 22.7071C1.48043 22.8946 1.73478 23 2 23H8C8.26522 23 8.51957 22.8946 8.70711 22.7071C8.89464 22.5196 9 22.2652 9 22V16C9 15.7348 8.89464 15.4804 8.70711 15.2929C8.51957 15.1054 8.26522 15 8 15H6V13H18V15H16C15.7348 15 15.4804 15.1054 15.2929 15.2929C15.1054 15.4804 15 15.7348 15 16V22C15 22.2652 15.1054 22.5196 15.2929 22.7071C15.4804 22.8946 15.7348 23 16 23H22C22.2652 23 22.5196 22.8946 22.7071 22.7071C22.8946 22.5196 23 22.2652 23 22V16C23 15.7348 22.8946 15.4804 22.7071 15.2929C22.5196 15.1054 22.2652 15 22 15ZM7 17V21H3V17H7ZM10 7V3H14V7H10ZM21 21H17V17H21V21Z"
              fill="#F5F0E5"
            />
          </svg>
          View mappings
        </Link>
      </header>

      {/* Editors row */}
      <section className="grid gap-6 md:grid-cols-2">
        {/* Input editor */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-stone-700">Raw prompt</div>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-stone-500">
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="size-2.5 rounded-full bg-stone-300" />
              <span className="ml-2">Input</span>
            </div>
            <textarea
              rows={10}
              className="block h-[300px] w-full resize-none bg-transparent px-5 py-4 text-sm leading-relaxed text-stone-800 placeholder:text-stone-300 focus:outline-none"
              placeholder="Paste or type the text you want to anonymize..."
            />
          </div>
        </div>

        {/* Output editor */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium text-stone-700">
            Protected prompt
          </div>
          <div className="overflow-hidden rounded-xl border border-stone-200 bg-stone-50">
            <div className="flex items-center gap-1.5 border-b border-stone-200 bg-stone-100 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-stone-500">
              <span className="size-2.5 rounded-full bg-[#FE5F57]" />
              <span className="size-2.5 rounded-full bg-[#FEBB2F]" />
              <span className="size-2.5 rounded-full bg-[#28C840]" />
              <span className="ml-2">Output</span>
            </div>
            <div className="h-[300px] px-5 py-4 text-sm leading-relaxed text-stone-800">
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
            No anonymizations yet. Run this session to see a history of
            protected prompts.
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
                    <p className="text-sm text-stone-800">
                      {item.protectedText}
                    </p>
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
