const LOCKED_EVENT_STATUSES = new Set(["approved", "active", "completed"]);

export const isOrganizerEventLocked = (eventOrStatus) => {
  const status =
    typeof eventOrStatus === "string"
      ? eventOrStatus
      : eventOrStatus?.status;
  return LOCKED_EVENT_STATUSES.has(String(status || "").toLowerCase());
};
