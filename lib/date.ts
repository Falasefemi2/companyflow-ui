export function formatDisplayDate(
  value?: string | null,
  fallback = "-",
): string {
  if (!value) return fallback;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export function formatDateRange(
  start?: string | null,
  end?: string | null,
  fallback = "-",
): string {
  const formattedStart = formatDisplayDate(start, "");
  const formattedEnd = formatDisplayDate(end, "");

  if (formattedStart && formattedEnd) {
    return `${formattedStart} to ${formattedEnd}`;
  }

  return formattedStart || formattedEnd || fallback;
}
