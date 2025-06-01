import { ReactNode, useCallback, useMemo } from "react";

import useLocalStorage from "@/hooks/useLocalStorage";
import { ActivityType, SubjectType } from "@/hooks/useSearchSubjects";
import { getRandomColor } from "@/lib/colorHelper";
import useTimetableStore from "@/store/useTimetableStore";
import { produce } from "immer";
import { TimetableContext, TimetableState } from "./timetable-context";

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
      maxCredit: 24,
      semester,
    },
  );

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

  const ctxValues = useMemo(
    () => ({
      ...timetable,
      onSelectActivity: handleSelectActivity,
      onSelectActivities: handleSelectActivities,
      onRemoveSubject: handleRemoveSubject,
      onAddSubject: handleAddSubject,
      onChangeMaxCredit: handleChangeMaxCredit,
    }),
    [
      timetable,
      handleSelectActivity,
      handleSelectActivities,
      handleRemoveSubject,
      handleAddSubject,
      handleChangeMaxCredit,
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
