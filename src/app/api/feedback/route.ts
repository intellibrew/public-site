import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Payload = {
  name: string;
  email: string;
  feedback: string;
  company?: string;
  phone?: string;
};

const API_BASE =
  process.env.NEOFAB_API_BASE_URL ?? "https://app.neofab.ai/api";
const API_KEY = process.env.NEOFAB_API_KEY ?? "";

function join(base: string, path: string) {
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  return `${b}${path}`;
}

/** Optional: handle CORS preflight if you ever hit this route cross-origin */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: Request) {
  let body: Payload | null = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const feedback = body?.feedback?.trim();
  const company = body?.company?.trim() || undefined;
  const phone = body?.phone?.trim() || undefined;

  if (!name || !email || !feedback) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Build upstream body to match FastAPI /user_feedback: name, email, feedback, company?, phone?
  const upstreamBody: Record<string, unknown> = {
    name,
    email,
    feedback,
  };
  if (company) upstreamBody.company = company;
  if (phone) upstreamBody.phone = phone;

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (API_KEY) headers["x-api-key"] = API_KEY;

  // Timeout guard
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);

  // Try with trailing slash first (some backends require it), then fallback
  const urls = [
    join(API_BASE, "/user_feedback/"),
    join(API_BASE, "/user_feedback"),
  ];

  try {
    let lastStatus = 0;
    let lastText: string | null = null;

    for (const url of urls) {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(upstreamBody),
        cache: "no-store",
        signal: controller.signal,
        redirect: "follow",
      });

      const text = await res.text();
      lastStatus = res.status;
      lastText = text;

      // Success -> return immediately
      if (res.ok) {
        let data = null;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        clearTimeout(timer);
        return NextResponse.json(
          { ok: true, status: res.status, data },
          { headers: { "Access-Control-Allow-Origin": "*" } }
        );
      }

      // If first URL failed, try the next one in the loop
    }

    clearTimeout(timer);
    // Both attempts failed
    let parsed = null;
    try {
      parsed = lastText ? JSON.parse(lastText) : null;
    } catch {
      /* keep raw */
    }
    return NextResponse.json(
      {
        ok: false,
        error: "Upstream error",
        status: lastStatus || 502,
        detail: parsed ?? lastText,
      },
      { status: lastStatus || 502 }
    );
  } catch (e:unknown) {
    const err = e as Error;
    clearTimeout(timer);
    const aborted = err.name === "AbortError";
    return NextResponse.json(
      { ok: false, error: aborted ? "Upstream timeout" : "Proxy request failed" },
      { status: aborted ? 504 : 502 }
    );
  }
}
