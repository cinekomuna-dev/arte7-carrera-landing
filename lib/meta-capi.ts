import { createHash } from "crypto";

export type CapiLeadInput = {
  event_id: string;
  email: string;
  phone?: string | null;
  program: string;
  value?: number;
  currency?: string;
  client_ip?: string;
  client_user_agent?: string;
  fbp?: string;
  fbc?: string;
  source_url?: string;
};

export type CapiResult = { ok: boolean; error?: string };

function sha256(value: string): string {
  return createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

export async function sendMetaCapiLead(input: CapiLeadInput): Promise<CapiResult> {
  const pixelId = process.env.META_CAPI_PIXEL_ID;
  const accessToken = process.env.META_CAPI_TOKEN;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    return { ok: false, error: "Missing META_CAPI_PIXEL_ID or META_CAPI_TOKEN" };
  }

  const userData: Record<string, string> = {
    em: sha256(input.email),
  };
  if (input.phone) userData.ph = sha256(normalizePhone(input.phone));
  if (input.client_ip) userData.client_ip_address = input.client_ip;
  if (input.client_user_agent) userData.client_user_agent = input.client_user_agent;
  if (input.fbp) userData.fbp = input.fbp;
  if (input.fbc) userData.fbc = input.fbc;

  const body: Record<string, unknown> = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.event_id,
        action_source: "website",
        event_source_url: input.source_url ?? "https://carrera.proyectoarte7.net",
        user_data: userData,
        custom_data: {
          content_name: input.program,
          content_category: "carrera_arte7",
          value: input.value ?? 0,
          currency: input.currency ?? "MXN",
        },
      },
    ],
  };

  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Meta CAPI ${res.status}: ${text}` };
    }

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
