"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { submitFeedback } from "@/app/api_requests/feedback";
import { useLenis } from "@/hooks/useLenis";

type DemoRequestModalProps = {
  open: boolean;
  onClose: () => void;
};

type FormStatus = "idle" | "submitting" | "success" | "error";

const SUCCESS_CLOSE_MS = 1400;

export default function DemoRequestModal({ open, onClose }: DemoRequestModalProps) {
  const titleId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { getLenis } = useLenis();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setErrorMessage("");
      return;
    }

    const lenis = getLenis();
    lenis?.stop();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      lenis?.start();
    };
  }, [open, onClose, getLenis]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting") return;

    const data = new FormData(event.currentTarget);

    setStatus("submitting");
    setErrorMessage("");

    try {
      await submitFeedback(
        String(data.get("name") ?? "").trim(),
        String(data.get("email") ?? "").trim(),
        String(data.get("feedback") ?? "").trim(),
        String(data.get("company") ?? "").trim() || undefined,
        String(data.get("phone") ?? "").trim() || undefined
      );

      setStatus("success");
      window.setTimeout(() => {
        formRef.current?.reset();
        onClose();
      }, SUCCESS_CLOSE_MS);
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again or email Hello@neofab.ai.");
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="demo-request-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="demo-request-modal__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="demo-request-modal__dialog">
        <div className="demo-request-modal__body">
          <div className="demo-request-modal__head">
            <div>
              <h2 id={titleId} className="demo-request-modal__title">
                Request a 1:1 demo
              </h2>
              <p className="demo-request-modal__subtitle">
                Tell us a bit about you. We&apos;ll reach out with a personalized demo.
              </p>
            </div>
            <button
              type="button"
              className="demo-request-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <form
            ref={formRef}
            className="demo-request-modal__form"
            onSubmit={handleSubmit}
            data-lenis-prevent
          >
            <div className="demo-request-modal__field-grid">
              <label className="demo-request-modal__label">
                Full name *
                <input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="John Doe"
                  className="demo-request-modal__input"
                />
              </label>
              <label className="demo-request-modal__label">
                Work email *
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="johndoe@company.com"
                  className="demo-request-modal__input"
                />
              </label>
            </div>

            <div className="demo-request-modal__field-grid">
              <label className="demo-request-modal__label">
                Company
                <input
                  name="company"
                  autoComplete="organization"
                  placeholder="Acme Manufacturing"
                  className="demo-request-modal__input"
                />
              </label>
              <label className="demo-request-modal__label">
                Phone
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+1 (555) 555-5555"
                  className="demo-request-modal__input"
                />
              </label>
            </div>

            <label className="demo-request-modal__label">
              What do you want to see? *
              <textarea
                name="feedback"
                required
                placeholder="Share goals, current tools, timelines..."
                className="demo-request-modal__textarea"
              />
            </label>

            {status === "success" && (
              <p className="demo-request-modal__status demo-request-modal__status--success" role="status">
                Thanks. We received your request and will reach out shortly.
              </p>
            )}

            {status === "error" && (
              <p className="demo-request-modal__status demo-request-modal__status--error" role="alert">
                {errorMessage}
              </p>
            )}

            <div className="demo-request-modal__actions">
              <button
                type="button"
                className="demo-request-modal__btn-secondary"
                onClick={onClose}
                disabled={status === "submitting"}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-cta-large inline-flex"
                disabled={status === "submitting" || status === "success"}
              >
                <span>{status === "submitting" ? "Submitting…" : "Submit"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}
