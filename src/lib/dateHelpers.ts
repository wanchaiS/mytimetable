import { DAY_ABBREVIATIONS } from "../features/calendar/constants";
import { ActivityType, ActivityTypeInput, SubjectType } from "../types";

// group activities by subject code
export function getSubjects(
  activitiesInput: ActivityTypeInput[],
): SubjectType[] {
  if (activitiesInput.length === 0) return [];

  let subjects: SubjectType[] = [];
  // parse all activities, easier to group and calculate weeks after
  const parsedActivities = activitiesInput.map((inp) => parseActivity(inp));

  // group into subject type
  for (let i = 0; i < parsedActivities.length; i++) {
    const activity = parsedActivities[i];
    const subject = subjects.find((s) => s.code === activity.code);
    if (subject !== undefined) {
      subject.activities.push(activity);
    } else {
      const newSubject: SubjectType = {
        name: activity.name,
        code: activity.code,
        activities: [activity],
      };
      subjects.push(newSubject);
    }
  }

  return subjects;
}

function parseActivity(subjectActivityInput: ActivityTypeInput): ActivityType {
  const duration = parseDuration(subjectActivityInput.duration);

  const { weeks: weekStr, ...activityBody } = subjectActivityInput;
  const activityDates = parseDates(weekStr);

  const activity: ActivityType = {
    ...activityBody,
    id: `${activityBody.code}|${activityBody.type}|${activityBody.activity}`,
    duration,
    day: DAY_ABBREVIATIONS[subjectActivityInput.day],
    dates: activityDates,
    startEndTime: getTime(activityBody.time, duration),
    selected: false,
    codeType: `${activityBody.code}|${activityBody.type}`,
  };

  return activity;
}

/**
 * Checks if two activities overlap based on their start and end times.
 *
 * @param activity1Date - A tuple containing the start and end Date objects for the first activity.
 * @param activity2Date - A tuple containing the start and end Date objects for the second activity.
 * @returns A boolean indicating whether the two activities overlap.
 */
export function isOverlap(
  activity1Date: [Date, Date],
  activity2Date: [Date, Date],
): boolean {
  const [startTime1, endTime1] = activity1Date;
  const [startTime2, endTime2] = activity2Date;

  if (startTime2 >= startTime1 && startTime2 < endTime1) {
    return true;
  }

  // if subject2 ends between duration of subject1
  if (endTime2 > startTime1 && endTime2 <= endTime1) {
    return true;
  }
  return false;
}

function getFullDate(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export function isSameDay(date1: Date | undefined, date2: Date | undefined) {
  if (date1 === undefined || date2 === undefined) {
    return false;
  }
  return getFullDate(date1) === getFullDate(date2);
}

function parseDates(inputRanges: string): Date[] {
  const today = new Date();
  const year = today.getFullYear();

  return inputRanges.split(", ").flatMap((range) => {
    const [start, end] = range.split("-").map((date) => {
      const [day, month] = date.split("/").map(Number);
      // Month is 0-based
      return new Date(year, month - 1, day, 0, 0, 0, 0);
    });

    const weeks = [];
    let current = new Date(start);

    // Iterate week by week
    while (current <= end) {
      weeks.push(new Date(current));
      // Move to the next week
      current.setDate(current.getDate() + 7);
    }

    return weeks;
  });
}

/**
 * Parses a duration string and returns the numeric value.
 *
 * @param duration - The duration string to parse, expected to be in the format "X unit" where X is a number.
 * @returns The numeric value of the duration.
 */
function parseDuration(duration: string): number {
  return Number(duration.split(" ")[0]);
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

function getTime(time: string, duration: number): [Date, Date] {
  const startTime = new Date();
  const [hours, mins] = time.split(":").map(Number);
  startTime.setHours(hours, mins, 0, 0);

  const endTime = new Date(startTime.getTime());
  endTime.setTime(startTime.getTime() + 1000 * 60 * 60 * duration);

  return [startTime, endTime];
}
