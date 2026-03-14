/** Recurrence config stored in habits.recurrence (JSONB). Sunday = 0, Saturday = 6. */

export type Recurrence =
  | { type: "daily"; interval?: number }
  | { type: "weekdays" }
  | { type: "weekends" }
  | { type: "weekly"; days: number[]; interval?: number }
  | { type: "biweekly"; days: number[] }
  | { type: "monthly"; everyMonths: number; mode: "each"; days: number[] }
  | {
      type: "monthly";
      everyMonths: number;
      mode: "on_the";
      ordinal: Ordinal;
      weekday: Weekday;
    }
  | {
      type: "yearly";
      everyYears: number;
      months: number[];
      onThe?: { ordinal: Ordinal; weekday: Weekday };
    };

export type Ordinal = "first" | "second" | "third" | "fourth" | "last";
export type Weekday = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

/** Fixed epoch for interval calculations (avoids resetting every month). */
const EPOCH = new Date("2024-01-01T12:00:00");

const WEEKDAY_NAMES: Weekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatRecurrence(r: Recurrence | null): string {
  if (!r) return "—";
  switch (r.type) {
    case "daily":
      return r.interval && r.interval > 1 ? `Every ${r.interval} days` : "Daily";
    case "weekdays":
      return "Weekdays";
    case "weekends":
      return "Weekends";
    case "weekly": {
      const interval = r.interval && r.interval > 1 ? r.interval : 1;
      const dayStr = formatDaysOfWeek(r.days);
      return interval > 1 ? `Every ${interval} weeks (${dayStr})` : `Weekly (${dayStr})`;
    }
    case "biweekly": {
      const dayStr = formatDaysOfWeek(r.days);
      return `Biweekly (${dayStr})`;
    }
    case "monthly": {
      const every = r.everyMonths > 1 ? `Every ${r.everyMonths} months, ` : "";
      if (r.mode === "each") {
        const days = r.days.length ? r.days.sort((a, b) => a - b).join(", ") : "—";
        return `${every}each ${days}`;
      }
      return `${every}on the ${r.ordinal} ${r.weekday}`;
    }
    case "yearly": {
      const every = r.everyYears > 1 ? `Every ${r.everyYears} years, ` : "";
      const monthsStr = r.months.length
        ? r.months.sort((a, b) => a - b).map((m) => MONTH_NAMES[m - 1]).join(", ")
        : "—";
      if (r.onThe) {
        return `${every}${monthsStr}, on the ${r.onThe.ordinal} ${r.onThe.weekday}`;
      }
      return `${every}${monthsStr}`;
    }
    default:
      return "—";
  }
}

function formatDaysOfWeek(days: number[]): string {
  if (!days.length) return "—";
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days.sort((a, b) => a - b).map((d) => labels[d]).join(", ");
}

/** Returns true if this recurrence is due on the given date (YYYY-MM-DD or Date). */
export function isDueOn(recurrence: Recurrence | null, date: string | Date): boolean {
  if (!recurrence) return true;
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : date;
  const dayOfWeek = d.getDay();
  const dateOfMonth = d.getDate();
  const month = d.getMonth() + 1;
  const weekOfMonth = Math.ceil(dateOfMonth / 7);

  switch (recurrence.type) {
    case "daily": {
      if (!recurrence.interval || recurrence.interval <= 1) return true;
      const daysSinceEpoch = Math.floor(
        (d.getTime() - EPOCH.getTime()) / (24 * 60 * 60 * 1000)
      );
      return daysSinceEpoch % recurrence.interval === 0;
    }
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "weekly":
    case "biweekly":
      if (!recurrence.days.includes(dayOfWeek)) return false;
      if (recurrence.type === "biweekly" || (recurrence.interval && recurrence.interval > 1)) {
        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weekIndex = Math.floor((d.getTime() - EPOCH.getTime()) / msPerWeek);
        const interval = recurrence.type === "biweekly" ? 2 : (recurrence.interval ?? 1);
        return weekIndex % interval === 0;
      }
      return true;
    case "monthly": {
      if (recurrence.mode === "each") {
        return recurrence.days.includes(dateOfMonth);
      }
      const targetWeekday = WEEKDAY_NAMES.indexOf(recurrence.weekday);
      if (dayOfWeek !== targetWeekday) return false;
      const ord = recurrence.ordinal;
      const nth = ord === "first" ? 1 : ord === "second" ? 2 : ord === "third" ? 3 : ord === "fourth" ? 4 : 5;
      const count = Math.ceil(dateOfMonth / 7);
      return count === nth || (ord === "last" && dateOfMonth > new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() - 7);
    }
    case "yearly": {
      if (!recurrence.months.includes(month)) return false;
      if (!recurrence.onThe) return true;
      const targetWeekday = WEEKDAY_NAMES.indexOf(recurrence.onThe.weekday);
      if (dayOfWeek !== targetWeekday) return false;
      const ord = recurrence.onThe.ordinal;
      if (ord === "last") {
        const lastDay = new Date(d.getFullYear(), month, 0);
        return dateOfMonth > lastDay.getDate() - 7;
      }
      const nth = ord === "first" ? 1 : ord === "second" ? 2 : ord === "third" ? 3 : ord === "fourth" ? 4 : 5;
      return Math.ceil(dateOfMonth / 7) === nth;
    }
    default:
      return true;
  }
}

export const ORDINALS: Ordinal[] = ["first", "second", "third", "fourth", "last"];
export const WEEKDAYS: Weekday[] = WEEKDAY_NAMES;
