export class FeedbackSubmitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackSubmitError";
  }
}

export const submitFeedback = async (
  _name: string,
  _email: string,
  _feedback: string,
  _company?: string,
  _phone?: string
) => {
  throw new FeedbackSubmitError(
    "Demo request form is currently disabled. Please email hello@neofab.ai."
  );
};
