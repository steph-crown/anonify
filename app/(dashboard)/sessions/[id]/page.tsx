import { SessionPage } from "@/components/session-page";

const mockAnonymizations = [
  {
    id: "a1",
    title: "Initial error report anonymization",
    original:
      "John Miller (id: jm_992) tried to access the Stripe production API at 192.168.1.44 using the secret key sk_live_51Msz82K9l.",
    protectedText:
      "[PERSON_1] (id: [ID_1]) tried to access the [ORG_1] production API at [IP_ADDR_1] using the secret key [SENSITIVE_KEY_1].",
  },
  {
    id: "a2",
    title: "Follow‑up conversation anonymization",
    original:
      "We refunded $4,500 to Tesla Inc. from our Palo Alto office during the last deployment window.",
    protectedText:
      "We refunded [VALUE_1] to [ORG_2] from our [LOC_1] office during the last deployment window.",
  },
];

export default function SessionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <SessionPage
      sessionId={params.id}
      anonymizations={mockAnonymizations}
      isNew={false}
    />
  );
}

