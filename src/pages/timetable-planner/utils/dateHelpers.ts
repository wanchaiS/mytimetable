import { ActivityType } from "@/pages/timetable-planner/hooks/useSearchSubjects";

export function isActivityOverlap(
  activity1: ActivityType,
  activity2: ActivityType,
): boolean {
  // Check if one activity ends exactly when the other starts (back-to-back)
  if (
    activity1.end_time_mins === activity2.start_time_mins ||
    activity2.end_time_mins === activity1.start_time_mins
  ) {
    return false;
  }

  // Activities collide if one starts before the other ends
  return (
    activity1.start_time_mins < activity2.end_time_mins &&
    activity2.start_time_mins < activity1.end_time_mins
  );
  return false;
}

function getFullDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function getStartEndWeekDate(date?: string): [Date, Date] {
  const startOfWeek = new Date(date || new Date());
  const dayOfWeek = startOfWeek.getDay(); // 0 (Sun) - 6 (Sat)

  // Adjust: If Sunday (0), move back 6 days, otherwise move back (dayOfWeek - 1)
  startOfWeek.setDate(
    startOfWeek.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1),
  );

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  return [startOfWeek, endOfWeek];
}

export function isSameDay(date1: Date | undefined, date2: Date | undefined) {
  if (date1 === undefined || date2 === undefined) {
    return false;
  }
  return getFullDate(date1) === getFullDate(date2);
}

export function compareTime(totalMinsA: number, totalMinsB: number): number {
  if (totalMinsA < totalMinsB) return -1;
  if (totalMinsA > totalMinsB) return 1;

  return 0;
}

export function minsToHourAMPM(totalMinutes: number): string | null {
  if (totalMinutes < 0 || !Number.isInteger(totalMinutes)) {
    return null;
  }
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const period = hours24 < 12 ? "AM" : "PM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hour12} ${period}`;
}

export function minsToTime(totalMinutes: number) {
  if (totalMinutes < 0 || !Number.isInteger(totalMinutes)) {
    return null;
  }

  if (totalMinutes === 0) {
    return "00:00";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours}:${formattedMinutes}`;
}
