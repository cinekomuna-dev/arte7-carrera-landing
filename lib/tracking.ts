declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type LeadTrackPayload = {
  event_id: string;
  program: string;
  value?: number;
  currency?: string;
};

export type ViewContentPayload = {
  name: string;
  category?: string;
};

const PA7_PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_PA7_ID;
const ARTE7_PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ARTE7_ID;

export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function trackLead(payload: LeadTrackPayload): void {
  if (typeof window === "undefined") return;

  const { event_id, program, value = 0, currency = "MXN" } = payload;
  const customData = {
    content_name: program,
    content_category: "carrera_arte7",
    value,
    currency,
  };

  if (typeof window.fbq === "function" && PA7_PIXEL) {
    window.fbq(
      "trackSingle",
      PA7_PIXEL,
      "Lead",
      customData,
      { eventID: event_id }
    );
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "generate_lead", {
      currency,
      value,
      content_name: program,
      event_id,
    });
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: "generate_lead",
      lead_program: program,
      lead_value: value,
      lead_currency: currency,
      event_id,
    });
  }
}

export function trackViewContent(content: ViewContentPayload): void {
  if (typeof window === "undefined") return;

  const customData = {
    content_name: content.name,
    content_category: content.category,
  };

  if (typeof window.fbq === "function") {
    if (PA7_PIXEL) {
      window.fbq("trackSingle", PA7_PIXEL, "ViewContent", customData);
    }
    if (ARTE7_PIXEL) {
      window.fbq("trackSingle", ARTE7_PIXEL, "ViewContent", customData);
    }
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "view_content", customData);
  }
}

export function trackInitiateCheckout(cta_position: string): void {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function" && PA7_PIXEL) {
    window.fbq("trackSingle", PA7_PIXEL, "InitiateCheckout", {
      content_name: "aplicar",
      cta_position,
    });
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "begin_checkout", {
      content_name: "aplicar",
      cta_position,
    });
  }
}

export function trackContact(method: "whatsapp" | "email" | "phone" | "form"): void {
  if (typeof window === "undefined") return;

  if (typeof window.fbq === "function" && PA7_PIXEL) {
    window.fbq("trackSingle", PA7_PIXEL, "Contact", { method });
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", "contact", { method });
  }
}

export function readFbCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === "undefined") return {};

  const cookies = document.cookie.split(";").reduce((acc, c) => {
    const [k, ...rest] = c.trim().split("=");
    if (k) acc[k] = rest.join("=");
    return acc;
  }, {} as Record<string, string>);

  return {
    fbp: cookies["_fbp"],
    fbc: cookies["_fbc"],
  };
}
