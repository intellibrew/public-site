import axios from "axios";
const API_BASE_URL = "https://app.neofab.ai/api";
export const submitFeedback = async (
  name: string,
  email: string,
  feedback: string,
  company?: string,
  phone?: string
) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/user_feedback`, {
      name,
      email,
      feedback,
      company,
      phone,
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};
