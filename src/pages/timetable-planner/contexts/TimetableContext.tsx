import { createContext } from "react";
import { ActivityType, SubjectType } from "../hooks/useSearchSubjects";
import { ReservationType } from "../types";

export interface TimetableState {
  maxCredit: number;
  semester: string;
  subjects: SubjectType[];
  reservations: ReservationType[];
  version: number;
}

type TimetableContextType = TimetableState & {
  onSelectActivity: (activity: ActivityType) => void;
  onSelectActivities: (activities: ActivityType[]) => void;
  onAddSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onChangeMaxCredit: (maxCredit: number) => void;
  onAddReservation: (reservation: ReservationType) => void;
  onRemoveReservation: (reservation: ReservationType) => void;
};

export const TimetableContext = createContext<TimetableContextType>({
  subjects: [],
  maxCredit: 0,
  semester: "Autumn",
  reservations: [],
  version: 1,
  onSelectActivity: () => {},
  onSelectActivities: () => {},
  onAddSubject: () => {},
  onRemoveSubject: () => {},
  onChangeMaxCredit: () => {},
  onAddReservation: () => {},
  onRemoveReservation: () => {},
});
