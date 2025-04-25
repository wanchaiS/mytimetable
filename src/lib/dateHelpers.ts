import { ActivityType } from "@/hooks/useSubjects";

/**
 * Checks if two activities overlap based on their start and end times.
 *
 * @param activity1Date - A tuple containing the start and end Date objects for the first activity.
 * @param activity2Date - A tuple containing the start and end Date objects for the second activity.
 * @returns A boolean indicating whether the two activities overlap.
 */
export function isActivityOverlap(
  activity1: ActivityType,
  activity2: ActivityType,
): boolean {
  if (
    activity2.start_time_mins >= activity1.start_time_mins &&
    activity2.start_time_mins < activity1.end_time_mins
  ) {
    return true;
  }

  // if subject2 ends between duration of subject1
  if (
    activity2.end_time_mins > activity1.start_time_mins &&
    activity2.end_time_mins <= activity1.end_time_mins
  ) {
    return true;
  }
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
