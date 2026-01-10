type MediaQuery =
  | "mobile"      // max-width: 1023px
  | "desktop"     // min-width: 1024px
  | "touch"       // pointer: coarse
  | "mouse"       // pointer: fine
  | "hover"       // hover: hover
  | "no-hover"    // hover: none
  | (string & {}) // custom query

const PRESETS: Record<string, string> = {
  mobile: "(max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  touch: "(pointer: coarse)",
  mouse: "(pointer: fine)",
  hover: "(hover: hover)",
  "no-hover": "(hover: none)",
};

export function getMedia(query: MediaQuery): boolean {
  const mediaQuery = PRESETS[query] ?? query;
  return window.matchMedia(mediaQuery).matches;
}
