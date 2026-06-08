export const LAYOUT = {
  headerHeightPx: 70,
  phoneMax: 639,
  tabletMin: 640,
  tabletMax: 1023,
  desktopMin: 1024,
  largeMin: 1280,
  xlMin: 1536,
} as const;

export function isCompactViewport(width = typeof window !== "undefined" ? window.innerWidth : 1024) {
  return width <= LAYOUT.tabletMax;
}
