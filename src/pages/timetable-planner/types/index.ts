export type Preference = "Compact" | "Relaxed" | "Late";
export type CalendarView = "weekdays" | "week";

export type ReservationType = {
  label: string;
  days: string[];
  start: string;
  end: string;
};

export interface TimeSlot {
  name: string;
  activityType: string;
  day: Day;
  activities: string[];
  location: string;
  weeks: string[];
  startTime: string;
  endTime: string;
  duration: number;
  startTimeMins: number;
  endTimeMins: number;
}

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;
export const WEEKEND_DAYS = ["Sat", "Sun"] as const;
export type WeekDay = (typeof WEEK_DAYS)[number];
export type WeekendDay = (typeof WEEKEND_DAYS)[number];
export type Day = WeekDay | WeekendDay;
