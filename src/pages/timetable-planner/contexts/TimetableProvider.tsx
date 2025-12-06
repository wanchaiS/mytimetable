import { ReactNode, useCallback, useEffect, useMemo } from "react";

import useLocalStorage from "@/hooks/useLocalStorage";
import { produce } from "immer";
import { ActivityType, SubjectType } from "../hooks/useSearchSubjects";
import useTimetableStore from "../store/useTimetableStore";
import { ReservationType } from "../types";
import { getRandomColor } from "../utils/colorHelper";
import { TimetableContext, TimetableState } from "./TimetableContext";

type TimetableProviderProps = {
  children: ReactNode;
};

export default function TimetableProvider({
  children,
}: TimetableProviderProps) {
  const { semester } = useTimetableStore();

  const [timetable, setTimetable] = useLocalStorage<TimetableState>(
    `timetable-${semester}`,
    {
      subjects: [],
      reservations: [],
      maxCredit: 24,
      semester,
      version: 1,
    },
  );

  useEffect(() => {
    if (timetable.version === undefined) {
      setTimetable(
        produce((draft: TimetableState) => {
          draft.version = 1;
          draft.reservations = [];
        }),
      );
    }
  }, [setTimetable, timetable.version]);

  const handleSelectActivity = useCallback(
    (activity: ActivityType) => {
      setTimetable(
        produce((draft: TimetableState) => {
          const [subjectIdx, acIdx] = getIndexes(draft.subjects, activity);
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
          if (draft.semester !== subject.semester) {
            return;
          }
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
    (subjectCode: string) => {
      setTimetable(
        produce((draft: TimetableState) => {
          const subjectIdx = draft.subjects.findIndex(
            (s) => s.callista_code === subjectCode,
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

  const ctxValues = useMemo(
    () => ({
      ...timetable,
      onSelectActivity: handleSelectActivity,
      onSelectActivities: handleSelectActivities,
      onRemoveSubject: handleRemoveSubject,
      onAddSubject: handleAddSubject,
      onChangeMaxCredit: handleChangeMaxCredit,
      onAddReservation: handleAddReservation,
      onRemoveReservation: handleRemoveReservation,
    }),
    [
      timetable,
      handleSelectActivity,
      handleSelectActivities,
      handleRemoveSubject,
      handleAddSubject,
      handleChangeMaxCredit,
      handleAddReservation,
      handleRemoveReservation,
    ],
  );

  return <TimetableContext value={ctxValues}>{children}</TimetableContext>;
}

TimetableProvider.displayName = "TimetableProvider";

function getIndexes(
  subjects: SubjectType[],
  activity?: ActivityType,
  subject?: SubjectType,
): [number, number] {
  if (activity !== undefined) {
    const subjectIdx = subjects.findIndex((s) => s.code === activity.code);
    const acIdx = subjects[subjectIdx].activities.findIndex(
      (a) => a.id === activity.id,
    );
    return [subjectIdx, acIdx];
  }

  const subjectIdx = subjects.findIndex((s) => s.code === subject?.code);
  return [subjectIdx, -1];
}
