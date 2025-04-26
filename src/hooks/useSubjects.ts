import {
  ActivityResponse,
  searchSubjects,
  SubjectResponse,
  SubjectsResponse,
} from "@/apis/subjects";
import { DAY_ABBREVIATIONS } from "@/constants";
import { useQuery } from "@tanstack/react-query";

export interface SubjectType {
  code: string;
  callista_code: string;
  name: string;
  semester: string;
  color: string;
  activities: ActivityType[];
}

export interface ActivityType {
  code: string;
  name: string;
  type: string;
  type_desc: string;
  activity: string;
  day: Day | undefined;
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
  color: string;
}

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

const useSubjects = (search: string) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["subjects", { searchTerm: search }],
    queryFn: searchSubjects,
    enabled: !!search,
  });

  // transform
  return { data: parseSubjectsResponse(data), isLoading, isError };
};

function parseSubjectsResponse(
  subjectsResponse: SubjectsResponse | undefined,
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

  return parsedSubjects;
}

function parseSubjectResponse(subjectReponse: SubjectResponse): SubjectType {
  const color = getRandomHexColor();
  return {
    name: subjectReponse.description,
    code: subjectReponse.subject_code,
    callista_code: subjectReponse.callista_code,
    semester: tryParseSemester(subjectReponse.semester),
    color,
    activities: Object.keys(subjectReponse.activities).map((activityKey) =>
      parseActivityResponse(
        subjectReponse.activities[activityKey],
        subjectReponse,
        color,
      ),
    ),
  };
}

function parseActivityResponse(
  activityResponse: ActivityResponse,
  subjectResponse: SubjectResponse,
  color: string,
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
    color,
    type: activityResponse.activity_group_code,
    type_desc: activityResponse.activity_type,
    activity: activityResponse.activity_code,
    room: activityResponse.location,
    duration,
    start_time: activityResponse.start_time,
    start_time_mins: startInMins,
    end_time_mins: endInMins,
    day: DAY_ABBREVIATIONS[activityResponse.day_of_week],
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

function getRandomHexColor() {
  // Generate a random number between 0 and 16777215 (hex FFFFFF)
  const randomNumber = Math.floor(Math.random() * 16777215);

  // Convert the number to a hexadecimal string and pad with zeros if needed
  let hexColor = randomNumber.toString(16);

  // Ensure the hex color is 6 digits by padding with zeros
  while (hexColor.length < 6) {
    hexColor = "0" + hexColor;
  }

  // Return the hex color with a '#' prefix
  return "#" + hexColor;
}

export default useSubjects;
