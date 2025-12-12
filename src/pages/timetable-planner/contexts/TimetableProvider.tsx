import { ReactNode, useCallback, useMemo } from "react";

import useLocalStorage from "@/hooks/useLocalStorage";
import { produce } from "immer";
import { ActivityType, SubjectType } from "../hooks/useSearchSubjects";
import { ReservationType } from "../types";
import { getRandomColor } from "../utils/colorHelper";
import { TimetableContext, TimetableState } from "./TimetableContext";

type TimetableProviderProps = {
  children: ReactNode;
};

export default function TimetableProvider({
  children,
}: TimetableProviderProps) {
  const [timetable, setTimetable] = useLocalStorage<TimetableState>(
    "timetable",
    {
      subjects: [],
      reservations: [],
      maxCredit: 24,
      selectedSemester: "Autumn",
      version: 2,
    },
  );

  // Migration logic: from version 1 (subjects array) to version 2
  if (timetable.version === undefined || timetable.version === 1) {
    setTimetable({
      subjects: [],
      reservations: [],
      maxCredit: 24,
      selectedSemester: "Autumn",
      version: 2,
    });
  }

  const handleSelectActivity = useCallback(
    (activity: ActivityType) => {
      setTimetable(
        produce((draft: TimetableState) => {
          const subjectIdx = draft.subjects.findIndex(
            (s) => s.code === activity.code && s.semester === activity.semester,
          );
          const acIdx = draft.subjects[subjectIdx].activities.findIndex(
            (a) => a.id === activity.id,
          );
          // toggle activity
          draft.subjects[subjectIdx].activities[acIdx].selected =
            !draft.subjects[subjectIdx].activities[acIdx].selected;

          // deselect the same type activities
          draft.subjects[subjectIdx].activities.forEach((ac) => {
            if (ac.id !== activity.id && ac.type === activity.type) {
              ac.selected = false;
            }
          });
        }),
      );
    },
    [setTimetable],
  );

  const handleSelectActivities = useCallback(
    (activities: ActivityType[]) => {
      setTimetable(
        produce((draft: TimetableState) => {
          for (let i = 0; i < draft.subjects.length; i++) {
            const subject = draft.subjects[i];
            for (let j = 0; j < subject.activities.length; j++) {
              const activity = subject.activities[j];

              if (!activities.find((s) => s.id === activity.id)) {
                activity.selected = false;
              } else {
                activity.selected = true;
              }
            }
          }
        }),
      );
    },
    [setTimetable],
  );

  const handleAddSubject = useCallback(
    (subject: SubjectType) => {
      setTimetable(
        produce((draft: TimetableState) => {
          subject.color = getRandomColor(
            draft.subjects.map((s) => s.color).filter((c) => c !== undefined),
          );
          draft.subjects.push(subject);
        }),
      );
    },
    [setTimetable],
  );

  const handleRemoveSubject = useCallback(
    (subjectCode: string, semester: string) => {
      setTimetable(
        produce((draft: TimetableState) => {
          const subjectIdx = draft.subjects.findIndex(
            (s) => s.callista_code === subjectCode && s.semester === semester,
          );
          if (subjectIdx === -1) {
            return;
          }
          draft.subjects.splice(subjectIdx, 1);
        }),
      );
    },
    [setTimetable],
  );

  const handleChangeMaxCredit = useCallback(
    (maxCredit: number) =>
      setTimetable(
        produce((draft: TimetableState) => {
          draft.maxCredit = maxCredit;
        }),
      ),
    [setTimetable],
  );

  const handleAddReservation = useCallback(
    (reservation: ReservationType) => {
      setTimetable(
        produce((draft: TimetableState) => {
          draft.reservations.push(reservation);
        }),
      );
    },
    [setTimetable],
  );

  const handleRemoveReservation = useCallback(
    (reservation: ReservationType) => {
      setTimetable(
        produce((draft: TimetableState) => {
          draft.reservations = draft.reservations.filter(
            (r) => r.label !== reservation.label,
          );
        }),
      );
    },
    [setTimetable],
  );

  const handleChangeSemester = useCallback(
    (semester: string) => {
      setTimetable(
        produce((draft: TimetableState) => {
          draft.selectedSemester = semester;
        }),
      );
    },
    [setTimetable],
  );

  const filteredSubjects = useMemo(() => {
    return timetable.subjects.filter((s) => {
      // if semester is Autumn returns startsWith AU
      if (timetable.selectedSemester === "Autumn") {
        return s.semester.startsWith("AU");
      }
      // if semester is Spring returns startsWith SP
      else if (timetable.selectedSemester === "Spring") {
        return s.semester.startsWith("SP");
      }
      // else returns all
      return true;
    });
  }, [timetable.subjects, timetable.selectedSemester]);

  const subjects = filteredSubjects;

  const ctxValues = useMemo(
    () => ({
      subjects: subjects,
      maxCredit: timetable.maxCredit,
      selectedSemester: timetable.selectedSemester,
      reservations: timetable.reservations,
      version: timetable.version,
      onSelectActivity: handleSelectActivity,
      onSelectActivities: handleSelectActivities,
      onRemoveSubject: handleRemoveSubject,
      onAddSubject: handleAddSubject,
      onChangeMaxCredit: handleChangeMaxCredit,
      onAddReservation: handleAddReservation,
      onRemoveReservation: handleRemoveReservation,
      onChangeSemester: handleChangeSemester,
    }),
    [
      subjects,
      timetable.maxCredit,
      timetable.selectedSemester,
      timetable.reservations,
      timetable.version,
      handleSelectActivity,
      handleSelectActivities,
      handleRemoveSubject,
      handleAddSubject,
      handleChangeMaxCredit,
      handleAddReservation,
      handleRemoveReservation,
      handleChangeSemester,
    ],
  );

  return <TimetableContext value={ctxValues}>{children}</TimetableContext>;
}

TimetableProvider.displayName = "TimetableProvider";
