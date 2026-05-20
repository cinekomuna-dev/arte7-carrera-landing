export type Ga4EventInput = {
  client_id: string;
  event_name: string;
  params?: Record<string, unknown>;
  user_id?: string;
};

export type Ga4Result = { ok: boolean; error?: string };

export async function sendGa4Event(input: Ga4EventInput): Promise<Ga4Result> {
  const measurementId = process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  if (!measurementId || !apiSecret) {
    return { ok: false, error: "Missing GA4_MEASUREMENT_ID or GA4_API_SECRET" };
  }

  const body: Record<string, unknown> = {
    client_id: input.client_id,
    events: [
      {
        name: input.event_name,
        params: input.params ?? {},
      },
    ],
  };

  if (input.user_id) {
    body.user_id = input.user_id;
  }

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `GA4 MP ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export function newClientId(): string {
  return `${Math.floor(Math.random() * 1_000_000_000)}.${Math.floor(Date.now() / 1000)}`;
}
