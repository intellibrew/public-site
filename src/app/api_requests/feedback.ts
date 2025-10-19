import axios from "axios";

/**
 * Calls our own Next.js route (avoids CORS and keeps API key server-side).
 * Optionally override with NEXT_PUBLIC_FEEDBACK_URL if you really need direct calls.
 */
const API_URL =
  process.env.NEXT_PUBLIC_FEEDBACK_URL?.trim() || "/api/feedback";

export const submitFeedback = async (
  name: string,
  email: string,
  feedback: string,
  company?: string,
  phone?: string
) => {
  const payload = { name, email, feedback, company, phone };

  try {
    const res = await axios.post(API_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 15_000,
    });

    // Our route responds with { ok, data, status }
    if (res?.data?.ok) return res.data.data ?? true;

    // If something unexpected, pass the body back
    return res.data;
  } catch (err) {
    err = err as Error;
    console.log(err);
    // throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }
};
