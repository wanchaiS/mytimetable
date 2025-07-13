export type Preference = "Compact" | "Relaxed" | "Late";
export type CalendarView = "weekdays" | "week";

export type ReservationType = {
  label: string;
  days: string[];
  start: string;
  end: string;
};
