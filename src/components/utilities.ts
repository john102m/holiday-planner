export function formatDate(value: unknown): string {
  if (typeof value === "string") return value.slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return "";
}
export function formatFriendlyDate(value: unknown): string {
  try {
    const date =
      typeof value === "string" ? new Date(value) :
      value instanceof Date ? value :
      null;

    if (!date || isNaN(date.getTime())) return "";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}
