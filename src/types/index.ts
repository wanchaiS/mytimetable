export interface SubjectType {
  code: string;
  name: string;
  semester: Semester;
  activities: ActivityType[];
}

export type Semester = "Autumn" | "Spring" | "Summer";

export interface ActivityType {
  code: string;
  name: string;
  type: string;
  activity: string;
  day: Day | undefined;
  startEndTime: [Date, Date];
  room: string;
  duration: number;
  dates: Date[];
  id: string;
  selected: boolean;
  codeType: string;
  semester: Semester;
}

export interface ActivityTypeInput {
  code: string;
  name: string;
  type: string;
  activity: string;
  day: string;
  time: string;
  room: string;
  duration: string;
  weeks: string;
  semester: string;
}

export interface AppContextType {
  selectMode: boolean;
  selectingSubject: SubjectType | undefined;
  swappingActivity: ActivityType | undefined;
}

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Preference = "Morning" | "Late";
