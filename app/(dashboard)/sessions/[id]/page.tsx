import { SessionPage } from "@/components/session-page";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SessionPage mode="existing" sessionId={id} />;
}
