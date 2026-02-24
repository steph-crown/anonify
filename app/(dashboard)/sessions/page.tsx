import Link from "next/link";

const sessions = [
  {
    id: "1",
    title: "Reviewing investment partnership contract for fairness",
    lastMessage: "Last message 1 day ago",
  },
  {
    id: "2",
    title: "Poultry farming business viability in Lagos",
    lastMessage: "Last message 2 days ago",
  },
  {
    id: "3",
    title: "Prompt with API keys and customer names",
    lastMessage: "Last message 3 days ago",
  },
  {
    id: "4",
    title: "Support ticket with PII redaction",
    lastMessage: "Last message 5 days ago",
  },
  {
    id: "5",
    title: "Financial summary anonymization",
    lastMessage: "Last message 1 week ago",
  },
];

export default function SessionsPage() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center justify-between pb-0 pt-12">
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">
          Sessions
        </h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-sm font-semibold text-[#F5F0E5] transition-colors hover:bg-stone-800"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          New session
        </Link>
      </header>

      <div className="py-6">
        <div className="relative mb-6">
          <svg
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search your sessions..."
            className="w-full rounded-lg border border-stone-200 bg-stone-50 py-3 pl-10 pr-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-300 focus:outline-none focus:ring-1 focus:ring-stone-300"
          />
        </div>

        <p className="mb-2 text-sm text-stone-500">
          {sessions.length} sessions
        </p>

        <ul className="divide-y divide-stone-100">
          {sessions.map((session) => (
            <li key={session.id}>
              <a
                href={`/sessions/${session.id}`}
                className="block py-4 transition-colors hover:bg-stone-50"
              >
                <p className="font-medium text-stone-900">{session.title}</p>
                <p className="mt-0.5 text-sm text-stone-500">
                  {session.lastMessage}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
