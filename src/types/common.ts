export interface SubjectType {
  code: string;
  name: string;
  selected: boolean;
  activities: ActivityType[];
}

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
}

export type Day =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";
