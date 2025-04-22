import { getSubjects } from "@/lib/dateHelpers";
import { ActivityType, Preference, Semester, SubjectType } from "@/types";
import { ReactNode, useCallback, useMemo, useState } from "react";
import mockDataTest from "../../mock-data/subjectsTest.json";

import { suggest } from "@/lib/subjectPlanner";
import { produce } from "immer";
import { DashboardContext, SuggestionType } from "./dashboard-context";

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

function getFirstSem(subjects: SubjectType[]): Semester {
  if (subjects.length === 0) {
    return "Autumn";
  }
  const sems = new Set(subjects.map((s) => s.semester));
  return Array.from(sems).sort()[0];
}

type DashboardProviderProps = {
  children: ReactNode;
};

export default function DashboardProvider({
  children,
}: DashboardProviderProps) {
  const [subjects, setSubjects] = useState<SubjectType[]>(
    getSubjects(mockDataTest),
  );

  const [semester, setSemester] = useState<Semester>(getFirstSem(subjects));

  const [swappingActivity, setSwappingActivity] = useState<
    ActivityType | undefined
  >();

  const [suggestions, setSuggestions] = useState<SuggestionType>({
    all: { Autumn: [], Spring: [], Summer: [] },
    currentSuggestionIdx: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [preference, setPreference] = useState<Preference>("Late");

  const handleToggleActivity = useCallback((activity: ActivityType) => {
    setSubjects(
      produce((draft: SubjectType[]) => {
        const [subjectIdx, acIdx] = getIndexes(draft, activity);
        // toggle activity
        draft[subjectIdx].activities[acIdx].selected =
          !draft[subjectIdx].activities[acIdx].selected;

        // deselect the same type activities
        draft[subjectIdx].activities.forEach((ac) => {
          if (ac.id !== activity.id && ac.type === activity.type) {
            ac.selected = false;
          }
        });
      }),
    );
  }, []);

  function handleDeselectActivity(activity: ActivityType) {
    setSubjects(
      produce((draft: SubjectType[]) => {
        const [subjectIdx, acIdx] = getIndexes(draft, activity);
        // deselect activity
        draft[subjectIdx].activities[acIdx].selected = false;
      }),
    );
  }

  const handleSwapClicked = useCallback((swappingOut: ActivityType) => {
    setSwappingActivity(swappingOut);
  }, []);

  const handleSwapActivity = useCallback(
    (swappingIn: ActivityType) => {
      if (swappingActivity === undefined) {
        return;
      }
      handleToggleActivity(swappingIn);

      setSwappingActivity(undefined);
    },
    [handleToggleActivity, swappingActivity],
  );

  const handleDeselectSubject = (subject: SubjectType) => {
    setSubjects(
      produce((draft: SubjectType[]) => {
        const [subjectIdx] = getIndexes(draft, undefined, subject);

        if (subjectIdx === -1) {
          return;
        }
        draft[subjectIdx].activities.forEach((activity) => {
          activity.selected = false;
        });
      }),
    );
  };

  const handleRemoveSubject = (subjectCode: string) => {
    setSubjects(
      produce((draft: SubjectType[]) => {
        const subjectIdx = draft.findIndex((s) => s.code === subjectCode);
        if (subjectIdx === -1) {
          return;
        }
        draft.splice(subjectIdx, 1);
      }),
    );
  };

  const handleSuggest = useCallback(() => {
    const combinations = suggest(subjects, preference);
    if (
      combinations.Autumn.length === 0 &&
      combinations.Spring.length === 0 &&
      combinations.Summer.length === 0
    ) {
      return;
    }

    const suggestedSubjects = combinations[semester];
    // set the first suggestion to subjects
    selectAcitivitiesBySuggestion(suggestedSubjects[0]);
    setSuggestions({
      all: combinations,
      currentSuggestionIdx: 0,
      hasNext: suggestedSubjects.length > 1,
      hasPrev: false,
    });
  }, [preference, semester, subjects]);

  const handleNextSuggest = useCallback(() => {
    if (suggestions.all[semester].length === 0) {
      return;
    }

    if (
      suggestions.currentSuggestionIdx >=
      suggestions.all[semester].length - 1
    ) {
      return;
    }

    selectAcitivitiesBySuggestion(
      suggestions.all[semester][suggestions.currentSuggestionIdx + 1],
    );
    setSuggestions((prev) => ({
      ...prev,
      currentSuggestionIdx: prev.currentSuggestionIdx + 1,
      hasNext: prev.currentSuggestionIdx + 1 < prev.all[semester].length - 1,
      hasPrev: true,
    }));
  }, [semester, suggestions.all, suggestions.currentSuggestionIdx]);

  const handlePrevSuggest = useCallback(() => {
    if (suggestions.all[semester].length === 0) {
      return;
    }

    if (suggestions.currentSuggestionIdx === 0) {
      return;
    }

    selectAcitivitiesBySuggestion(
      suggestions.all[semester][suggestions.currentSuggestionIdx - 1],
    );
    setSuggestions((prev) => ({
      ...prev,
      currentSuggestionIdx: prev.currentSuggestionIdx - 1,
      hasNext: true,
      hasPrev: prev.currentSuggestionIdx - 1 !== 0,
    }));
  }, [semester, suggestions.all, suggestions.currentSuggestionIdx]);

  const selectAcitivitiesBySuggestion = (suggestion: ActivityType[]) => {
    setSubjects(
      produce((draft: SubjectType[]) => {
        for (let i = 0; i < suggestion.length; i++) {
          const sugAc = suggestion[i];
          const curSubIdx = draft.findIndex((s) => s.code === sugAc.code);
          if (curSubIdx === -1) {
            return;
          }
          // swap activity
          const selected = draft[curSubIdx].activities.filter(
            (ac) => ac.codeType === sugAc.codeType && ac.selected,
          );
          selected.forEach((se) => (se.selected = false));

          const sugAcIdx = draft[curSubIdx].activities.findIndex(
            (ac) => ac.id === sugAc.id,
          );
          if (sugAcIdx === -1) {
            return;
          }

          draft[curSubIdx].activities[sugAcIdx].selected = true;
        }
      }),
    );
  };

  const handleChangeSemester = useCallback(
    (newSem: Semester) => {
      if (suggestions.all[newSem].length > 0) {
        const suggestedSubjects = suggestions.all[newSem];
        // set the first suggestion to subjects
        selectAcitivitiesBySuggestion(suggestedSubjects[0]);
        setSuggestions((prev) => ({
          ...prev,
          currentSuggestionIdx: 0,
          hasNext: suggestedSubjects.length > 1,
          hasPrev: false,
        }));
      }

      setSemester(newSem);
    },
    [suggestions.all],
  );

  const ctxValues = useMemo(
    () => ({
      subjects,
      swappingActivity,
      suggestions,
      preference,
      semester,
      onToggleActivity: handleToggleActivity,
      onDeselectActivity: handleDeselectActivity,
      onSwapClicked: handleSwapClicked,
      onSwapActivity: handleSwapActivity,
      onDeselectSubject: handleDeselectSubject,
      onRemoveSubject: handleRemoveSubject,
      onSuggest: handleSuggest,
      onNextSuggest: handleNextSuggest,
      onPrevSuggest: handlePrevSuggest,
      onSetPreference: (pref: Preference) => setPreference(pref),
      onChangeSemester: handleChangeSemester,
    }),
    [
      handleChangeSemester,
      handleNextSuggest,
      handlePrevSuggest,
      handleSuggest,
      handleSwapActivity,
      handleSwapClicked,
      handleToggleActivity,
      preference,
      semester,
      subjects,
      suggestions,
      swappingActivity,
    ],
  );

  return <DashboardContext value={ctxValues}>{children}</DashboardContext>;
}

DashboardContext.displayName = "DashboardContext";
