import {
  ActivityResponse,
  searchSubjects,
  SubjectResponse,
  SubjectsResponse,
} from "@/pages/timetable-planner/apis/subjects";
import { useQuery } from "@tanstack/react-query";

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
  type_desc: string;
  activity: string;
  day: string;
  room: string;
  duration: number;
  start_time: string;
  start_time_mins: number;
  end_time_mins: number;
  dates: string[];
  id: string;
  selected: boolean;
  codeType: string;
  semester: string;
}

const useSearchSubjects = (search: string, semester: string, year: number) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["subjects", { searchTerm: search, semester, year }],
    queryFn: searchSubjects,
    enabled: !!search,
    gcTime: 0,
  });

  // transform
  return {
    data: parseSubjectsResponse(data, semester),
    isLoading,
    isError,
    refetch,
  };
};

function parseSubjectsResponse(
  subjectsResponse: SubjectsResponse | undefined,
  semester: string,
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

  return parsedSubjects.filter((s) => s.semester === semester);
}

function parseSubjectResponse(subjectReponse: SubjectResponse): SubjectType {
  return {
    name: subjectReponse.description,
    code: subjectReponse.subject_code,
    callista_code: subjectReponse.callista_code,
    credit: 6,
    semester: tryParseSemester(subjectReponse.semester),
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
    id: `${activityResponse.subject_code}|${activityResponse.activity_group_code}|${activityResponse.activity_code}`,
    name: subjectResponse.description,
    code: activityResponse.subject_code,
    type: activityResponse.activity_group_code,
    type_desc: activityResponse.activity_type,
    activity: activityResponse.activity_code,
    room: activityResponse.location,
    duration,
    start_time: activityResponse.start_time,
    start_time_mins: startInMins,
    end_time_mins: endInMins,
    day: activityResponse.day_of_week,
    dates: activityDates,
    selected: false,
    codeType: `${activityResponse.subject_code}|${activityResponse.activity_group_code}`,
    semester: tryParseSemester(activityResponse.semester),
  };

  return activity;
}

function tryParseSemester(sem: string) {
  switch (sem) {
    case "SPR":
      return "Spring";
    case "AUT":
      return "Autumn";
    default:
      return "Other";
  }
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
