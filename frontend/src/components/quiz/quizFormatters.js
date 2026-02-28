export const formatDuration = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const mm = String(Math.floor(safe / 60)).padStart(2, "0");
  const ss = String(safe % 60).padStart(2, "0");
  return `${mm}:${ss}`;
};

export const formatAttemptDate = (value) => {
  const date = new Date(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const titleCase = (value) => {
  if (!value) {
    return "";
  }
  return String(value)
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

