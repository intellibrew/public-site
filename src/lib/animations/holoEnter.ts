import gsap from "gsap";

type HoloEnterOptions = {
  alert?: boolean;
};

const HOLO_TRANSFORM_CLEAR_SELECTOR =
  ".holo-char, .holo-enter-pane, .holo-preview-frame, .holo-data-chip, .holo-cap-tag, .holo-line-flow, .holo-dismiss, .holo-machine-codename, .holo-lock-id, .holo-lock-label, .holo-spec-row, .holo-log-line, .holo-footer, .holo-optimize-cta, .holo-station-index, .holo-status-pill--alert";

function clearHoloTransforms(root: HTMLElement) {
  gsap.set(root, { clearProps: "transform,opacity,visibility,willChange" });
  root.querySelectorAll<HTMLElement>(HOLO_TRANSFORM_CLEAR_SELECTOR).forEach((element) => {
    gsap.set(element, { clearProps: "transform,opacity,visibility,willChange" });
  });
}

function prefersReducedHoloMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 767px)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function playHoloEnterAnimation(root: HTMLElement, options: HoloEnterOptions = {}) {
  return gsap.context(() => {
    const simplified = prefersReducedHoloMotion();
    const border = root.querySelector<SVGRectElement>(".holo-border-stroke");
    const borderLength = border?.getTotalLength() ?? 2800;
    const tl = gsap.timeline({
      defaults: { ease: "power3.out", force3D: false },
      onComplete: () => {
        clearHoloTransforms(root);
      },
    });

    const overlay = root.closest(".holo-overlay");
    const backdrop = overlay?.querySelector(".holo-backdrop");
    const vignette = overlay?.querySelector(".holo-vignette");

    if (backdrop) {
      tl.fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.42 }, 0);
    }

    if (vignette) {
      tl.fromTo(vignette, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.38 }, 0.04);
    }

    tl.fromTo(
      root,
      simplified ? { autoAlpha: 0 } : { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: simplified ? 0.32 : 0.72, ease: "power3.out" },
      0.08
    );

    if (border) {
      gsap.set(border, { strokeDasharray: borderLength, strokeDashoffset: borderLength });
      tl.to(border, { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" }, 0.16);
    }

    const scan = root.querySelector(".holo-scan");
    if (scan) {
      tl.fromTo(
        scan,
        { yPercent: -115, autoAlpha: 0.75 },
        { yPercent: 215, autoAlpha: 0, duration: 0.82, ease: "power1.in" },
        0.22
      );
    }

    const lockChars = root.querySelectorAll(".holo-lock-label .holo-char");
    if (lockChars.length) {
      tl.fromTo(
        lockChars,
        { autoAlpha: 0, ...(simplified ? {} : { y: 9 }) },
        { autoAlpha: 1, y: 0, duration: simplified ? 0.2 : 0.28, stagger: { each: 0.016, from: "start" } },
        0.36
      );
    }

    const lockId = root.querySelector(".holo-lock-id");
    if (lockId) {
      tl.fromTo(lockId, { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.36 }, 0.52);
    }

    const headerMeta = root.querySelector(".holo-station-index, .holo-status-pill--alert");
    if (headerMeta) {
      tl.fromTo(headerMeta, { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.32 }, 0.46);
    }

    const dismiss = root.querySelector(".holo-dismiss");
    if (dismiss) {
      tl.fromTo(
        dismiss,
        simplified ? { autoAlpha: 0 } : { autoAlpha: 0, scale: 0.82, rotate: -45 },
        {
          autoAlpha: 1,
          scale: 1,
          rotate: 0,
          duration: simplified ? 0.24 : 0.42,
          ease: simplified ? "power2.out" : "back.out(2.2)",
        },
        0.42
      );
    }

    const lineFlow = root.querySelector(".holo-line-flow");
    if (lineFlow) {
      tl.fromTo(lineFlow, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.38 }, 0.5);
    }

    const panes = root.querySelectorAll(".holo-enter-pane");
    if (panes.length) {
      tl.fromTo(
        panes,
        { autoAlpha: 0, ...(simplified ? {} : { y: 18 }) },
        { autoAlpha: 1, y: 0, duration: simplified ? 0.28 : 0.46, stagger: simplified ? 0.04 : 0.07 },
        0.56
      );
    }

    const preview = root.querySelector(".holo-preview-frame");
    if (preview) {
      tl.fromTo(
        preview,
        { autoAlpha: 0, ...(simplified ? {} : { scale: 0.95 }) },
        { autoAlpha: 1, scale: 1, duration: simplified ? 0.28 : 0.52, ease: "power2.out" },
        0.6
      );
    }

    const nameChars = root.querySelectorAll(".holo-machine-name .holo-char");
    if (nameChars.length) {
      tl.fromTo(
        nameChars,
        { autoAlpha: 0, ...(simplified ? {} : { y: 11 }) },
        {
          autoAlpha: 1,
          y: 0,
          duration: simplified ? 0.18 : 0.26,
          stagger: { each: simplified ? 0.006 : 0.012, from: "start" },
        },
        0.64
      );
    }

    const codename = root.querySelector(".holo-machine-codename");
    if (codename) {
      tl.fromTo(codename, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.6);
    }

    const specRows = root.querySelectorAll(".holo-spec-row");
    if (specRows.length) {
      tl.fromTo(
        specRows,
        { autoAlpha: 0, x: -14 },
        { autoAlpha: 1, x: 0, duration: 0.3, stagger: 0.045 },
        0.7
      );
    }

    const chips = root.querySelectorAll(".holo-data-chip, .holo-cap-tag");
    if (chips.length) {
      tl.fromTo(
        chips,
        { autoAlpha: 0, ...(simplified ? {} : { scale: 0.9 }) },
        { autoAlpha: 1, scale: 1, duration: simplified ? 0.2 : 0.26, stagger: simplified ? 0.02 : 0.035 },
        0.74
      );
    }

    root.querySelectorAll<HTMLElement>(".holo-metric-row").forEach((row, index) => {
      const fill = row.querySelector<HTMLElement>(".holo-metric-fill");
      const valueEl = row.querySelector<HTMLElement>(".holo-metric-num");
      if (!fill) return;

      const targetWidth = fill.dataset.width ?? "0%";
      gsap.set(fill, { width: "0%" });
      tl.to(fill, { width: targetWidth, duration: 0.78, ease: "power2.out" }, 0.8 + index * 0.07);

      if (valueEl?.dataset.value) {
        const target = Number(valueEl.dataset.value);
        const decimals = Number(valueEl.dataset.decimals ?? 0);
        const counter = { value: 0 };
        tl.to(
          counter,
          {
            value: target,
            duration: 0.85,
            ease: "power2.out",
            snap: { value: decimals > 0 ? 0.1 : 1 },
            onUpdate: () => {
              valueEl.textContent =
                decimals > 0 ? counter.value.toFixed(decimals) : String(Math.round(counter.value));
            },
          },
          0.8 + index * 0.07
        );
      }
    });

    const logLines = root.querySelectorAll(".holo-log-line");
    if (logLines.length) {
      tl.fromTo(
        logLines,
        { autoAlpha: 0, x: -8 },
        { autoAlpha: 1, x: 0, duration: 0.24, stagger: 0.09 },
        0.9
      );
    }

    const footer = root.querySelector(".holo-footer");
    if (footer) {
      tl.fromTo(footer, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.34 }, 0.94);
    }

    const optimizeCta = root.querySelector(".holo-optimize-cta");
    if (optimizeCta) {
      tl.fromTo(
        optimizeCta,
        simplified ? { autoAlpha: 0 } : { autoAlpha: 0, y: 12, scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: simplified ? 0.28 : 0.48,
          ease: simplified ? "power2.out" : "back.out(1.6)",
        },
        1.02
      );
    }

    if (options.alert) {
      const flash = root.querySelector(".holo-flash");
      if (flash) {
        tl.fromTo(flash, { autoAlpha: 0.5 }, { autoAlpha: 0, duration: 0.7, ease: "power2.out" }, 0.54);
      }
    }
  }, root);
}

export function splitChars(text: string, className = "holo-char") {
  return text.split("").map((char, index) => ({
    key: `${char}-${index}`,
    char: char === " " ? "\u00A0" : char,
    className,
  }));
}
