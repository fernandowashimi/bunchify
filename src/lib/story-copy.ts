export const RANGE_PHRASE = {
  short_term: "from last 4 weeks",
  medium_term: "from last 6 months",
  long_term: "from all time",
} as const;

export const RANGE_HELP = {
  short_term: "About the last 4 weeks",
  medium_term: "About the last 6 months",
  long_term: "Several years of listening",
} as const;

export const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export const INSUFFICIENT_TOP = "You don't have enough data to proceed.";

export const PREVIEW_EMPTY =
  "Your story will show up here.\nPick your top and choose a time range to start.";
