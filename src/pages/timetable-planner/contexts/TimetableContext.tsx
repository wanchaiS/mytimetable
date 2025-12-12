import { createContext } from "react";
import { ActivityType, SubjectType } from "../hooks/useSearchSubjects";
import { ReservationType } from "../types";

export interface TimetableState {
  maxCredit: number;
  selectedSemester: string;
  subjects: SubjectType[];
  reservations: ReservationType[];
  version: number;
}

type TimetableContextType = {
  subjects: SubjectType[]; // Runtime loaded subjects
  maxCredit: number;
  selectedSemester: string;
  reservations: ReservationType[];
  version: number;
  onSelectActivity: (activity: ActivityType) => void;
  onSelectActivities: (activities: ActivityType[]) => void;
  onAddSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subjectCode: string, semester: string) => void;
  onChangeMaxCredit: (maxCredit: number) => void;
  onAddReservation: (reservation: ReservationType) => void;
  onRemoveReservation: (reservation: ReservationType) => void;
  onChangeSemester: (semester: string) => void;
};

export const TimetableContext = createContext<TimetableContextType>({
  subjects: [],
  maxCredit: 0,
  selectedSemester: "AUT",
  reservations: [],
  version: 1,
  onSelectActivity: () => {},
  onSelectActivities: () => {},
  onAddSubject: () => {},
  onRemoveSubject: () => {},
  onChangeMaxCredit: () => {},
  onAddReservation: () => {},
  onRemoveReservation: () => {},
  onChangeSemester: () => {},
});
