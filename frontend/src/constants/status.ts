// Single source of truth for all status-related constants.

import type { Status } from "../types";

// The kanban columns in order
export const KANBAN_STATUSES: Status[] = ["SAVED", "APPLIED", "INTERVIEW"];

export const ALL_STATUSES: Status[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "ARCHIVED",
];

export const STATUS_LABELS: Record<Status, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

// Hex-based styles used in inline style props
export const STATUS_STYLES: Record<Status, { bg: string; fg: string }> = {
  SAVED: { bg: "#EBEAF3", fg: "#6a698c" },
  APPLIED: { bg: "#EAEBFC", fg: "#6D83DD" },
  INTERVIEW: { bg: "#F0EBFC", fg: "#806ed3" },
  OFFER: { bg: "#EFF3F2", fg: "#A2C4B2" },
  REJECTED: { bg: "#FEE2E2", fg: "#B91C1C" },
  ARCHIVED: { bg: "#F3F4F6", fg: "#9CA3AF" },
};
