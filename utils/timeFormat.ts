/**
 * Converts a time string in HH:mm format to 12-hour format with AM/PM
 * @param timeString - Time string in format "HH:mm" (e.g., "09:00", "15:30")
 * @returns Formatted time string (e.g., "9:00 AM", "3:30 PM")
 */
export function formatTime12Hour(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Formats a Date object to 12-hour time format with AM/PM
 * @param date - Date object
 * @returns Formatted time string (e.g., "9:00 AM", "3:30 PM")
 */
export function formatDateTo12Hour(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
