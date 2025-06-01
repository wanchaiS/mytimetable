import { ActivityType, SubjectType } from "@/hooks/useSearchSubjects";
import { createContext } from "react";

export interface TimetableState {
  maxCredit: number;
  semester: string;
  subjects: SubjectType[];
}

type TimetableContextType = TimetableState & {
  onSelectActivity: (activity: ActivityType) => void;
  onSelectActivities: (activities: ActivityType[]) => void;
  onAddSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onChangeMaxCredit: (maxCredit: number) => void;
};

export const TimetableContext = createContext<TimetableContextType>({
  subjects: [],
  maxCredit: 0,
  semester: "Autumn",
  onSelectActivity: () => {},
  onSelectActivities: () => {},
  onAddSubject: () => {},
  onRemoveSubject: () => {},
  onChangeMaxCredit: () => {},
});
