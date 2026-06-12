import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_FEEDBACK_URL?.trim() || "/api/feedback";

export const submitFeedback = async (
  name: string,
  email: string,
  feedback: string,
  company?: string,
  phone?: string
) => {
  const res = await axios.post(
    API_URL,
    { name, email, feedback, company, phone },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15_000,
    }
  );

  if (res?.data?.ok) return res.data.data ?? true;

  throw new Error("Feedback submit failed");
};
