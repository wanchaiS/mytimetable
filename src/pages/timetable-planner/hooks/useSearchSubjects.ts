import {
  ActivityResponse,
  searchSubjects,
  SubjectResponse,
  SubjectsResponse,
} from "@/pages/timetable-planner/apis/subjects";
import { useQuery } from "@tanstack/react-query";
import { Day, WEEK_DAYS, WEEKEND_DAYS } from "../types";
export interface SubjectType {
  code: string;
  credit: number;
  callista_code: string;
  name: string;
  semester: string;
  color: string | undefined;
  activities: ActivityType[];
}

export interface ActivityType {
  code: string;
  name: string;
  type: string;
  typeDesc: string;
  activity: string;
  day: Day;
  room: string;
  duration: number;
  startTime: string;
  startTimeMins: number;
  endTimeMins: number;
  dates: string[];
  id: string;
  selected: boolean;
  subjectActivityGroupId: string;
  subjectActivityTimeSlotId: string;
  semester: string;
}

const useSearchSubjects = (
  search: string,
  selectedSemester: string,
  year: number,
) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["subjects", { searchTerm: search, year }],
    queryFn: searchSubjects,
    enabled: !!search,
    gcTime: 0,
  });

  // transform
  return {
    data: parseSubjectsResponse(data, selectedSemester),
    isLoading,
    isError,
    refetch,
  };
};

function parseSubjectsResponse(
  subjectsResponse: SubjectsResponse | undefined,
  selectedSemester: string,
): SubjectType[] {
  if (
    subjectsResponse === undefined ||
    Object.keys(subjectsResponse).length === 0
  ) {
    return [];
  }

  const parsedSubjects = Object.keys(subjectsResponse).map(
    (subjectKey: string) => parseSubjectResponse(subjectsResponse[subjectKey]),
  );

  return parsedSubjects.filter((s) => {
    // if semester is Autumn returns startsWith AU
    if (selectedSemester === "Autumn") {
      return s.semester.startsWith("AU");
    }
    // if semester is Spring returns startsWith SP
    else if (selectedSemester === "Spring") {
      return s.semester.startsWith("SP");
    }
    // else returns all
    return true;
  });
}

function parseSubjectResponse(subjectReponse: SubjectResponse): SubjectType {
  return {
    name: subjectReponse.description,
    code: subjectReponse.subject_code,
    callista_code: subjectReponse.callista_code,
    credit: 6,
    semester: subjectReponse.semester,
    color: undefined,
    activities: Object.keys(subjectReponse.activities).map((activityKey) =>
      parseActivityResponse(
        subjectReponse.activities[activityKey],
        subjectReponse,
      ),
    ),
  };
}

function parseActivityResponse(
  activityResponse: ActivityResponse,
  subjectResponse: SubjectResponse,
): ActivityType {
  const activityDates = parseDates(activityResponse.activitiesDays);
  const duration = Number(activityResponse.duration);
  const [startInMins, endInMins] = getStartEndTimeInMins(
    activityResponse.start_time,
    duration,
  );

  const activity: ActivityType = {
    id: `${activityResponse.semester}|${activityResponse.subject_code}|${activityResponse.activity_group_code}|${activityResponse.activity_code}`,
    name: subjectResponse.description,
    code: activityResponse.subject_code,
    type: activityResponse.activity_group_code,
    typeDesc: activityResponse.activity_type,
    activity: activityResponse.activity_code,
    room: activityResponse.location,
    duration,
    startTime: activityResponse.start_time,
    startTimeMins: startInMins,
    endTimeMins: endInMins,
    day: tryparseDay(activityResponse.day_of_week),
    dates: activityDates,
    selected: false,
    subjectActivityGroupId: `${activityResponse.semester}|${activityResponse.subject_code}|${activityResponse.activity_group_code}`,
    subjectActivityTimeSlotId: `${activityResponse.semester}|${activityResponse.subject_code}|${activityResponse.activity_group_code}|${activityResponse.day_of_week}|${activityResponse.start_time}`,
    semester: activityResponse.semester,
  };

  return activity;
}

function tryparseDay(day: string): Day {
  const allDays = [...WEEK_DAYS, ...WEEKEND_DAYS];
  if (allDays.includes(day as Day)) {
    return day as Day;
  }
  console.error(`Invalid day found: ${day}`);
  return "Mon"; // default fallback
}

function parseDates(dates: string[]): string[] {
  return dates
    .map((date) => {
      const parts = date.split("/");
      if (parts.length !== 3) {
        return null;
      }

      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);

      if (
        isNaN(day) ||
        isNaN(month) ||
        isNaN(year) ||
        month < 0 ||
        month > 11 ||
        day < 1 ||
        day > 31
      ) {
        console.error(`Invalid date found ${date}`);
        return null;
      }

      return `${year}-${month}-${day}`;
    })
    .filter((date) => date !== null);
}

function getStartEndTimeInMins(
  startTime: string,
  duration: number,
): [number, number] {
  const [hoursA, minsA] = startTime.split(":").map(Number);

  const startMinutes = hoursA * 60 + minsA;
  // duration is already in mins
  const endMinutes = startMinutes + duration;

  return [startMinutes, endMinutes];
}

export default useSearchSubjects;
