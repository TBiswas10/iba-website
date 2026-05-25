function getSydneyOffsetMs(year: number, month: number, day: number, hour: number, minute: number): number {
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = utcDate.toLocaleString("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).split(/\D+/).filter(Boolean);
  const sydneyMs = new Date(
    Number(parts[2]),
    Number(parts[1]) - 1,
    Number(parts[0]),
    Number(parts[3]),
    Number(parts[4]),
  ).getTime();
  return sydneyMs - utcDate.getTime();
}

export function parseSydneyDatetime(value: string): Date {
  if (value.includes("T") && !value.includes("Z") && !value.includes("+")) {
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    const inputAsUtc = new Date(year, month - 1, day, hour, minute).getTime();
    const offsetMs = getSydneyOffsetMs(year, month, day, hour, minute);
    return new Date(inputAsUtc - offsetMs);
  }
  return new Date(value);
}