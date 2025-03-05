import { getSubjects } from "@/lib/dateHelpers";
import { ActivityType, Preference, SubjectType } from "@/types";
import { ReactNode, useCallback, useMemo, useState } from "react";
import mockDataTest from "../../mock-data/subjectsTest.json";

import { suggest } from "@/lib/subjectPlanner";
import { produce } from "immer";
import { DashboardContext } from "./dashboard-context";

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

type DashboardProviderProps = {
  children: ReactNode;
};

export default function DashboardProvider({
  children,
}: DashboardProviderProps) {
  const [subjects, setSubjects] = useState<SubjectType[]>(
    getSubjects(mockDataTest),
  );

  const [swappingActivity, setSwappingActivity] = useState<
    ActivityType | undefined
  >();

  const [suggestions, setSuggestions] = useState<{
    all: ActivityType[][];
    currentSuggestionIdx: number;
  }>({ all: [], currentSuggestionIdx: 0 });

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

  const handleRemoveSubject = (subject: SubjectType) => {
    setSubjects(
      produce((draft: SubjectType[]) => {
        const [subjectIdx] = getIndexes(draft, undefined, subject);
        if (subjectIdx === -1) {
          return;
        }
        draft.splice(subjectIdx, 1);
      }),
    );
  };

  const handleSuggest = useCallback(() => {
    const combinations = suggest(subjects, preference);
    if (combinations.length === 0) {
      return;
    }
    // set the first suggestion to subjects
    selectAcitivitiesBySuggestion(combinations[0]);
    setSuggestions({ all: combinations, currentSuggestionIdx: 0 });
  }, [preference, subjects]);

  const handleNextSuggest = useCallback(() => {
    if (suggestions.all.length === 0) {
      return;
    }

    if (suggestions.currentSuggestionIdx >= suggestions.all.length - 1) {
      return;
    }

    selectAcitivitiesBySuggestion(
      suggestions.all[suggestions.currentSuggestionIdx + 1],
    );
    setSuggestions((prev) => ({
      ...prev,
      currentSuggestionIdx: prev.currentSuggestionIdx + 1,
    }));
  }, [suggestions.all, suggestions.currentSuggestionIdx]);

  const handlePrevSuggest = useCallback(() => {
    if (suggestions.all.length === 0) {
      return;
    }

    if (suggestions.currentSuggestionIdx === 0) {
      return;
    }

    selectAcitivitiesBySuggestion(
      suggestions.all[suggestions.currentSuggestionIdx - 1],
    );
    setSuggestions((prev) => ({
      ...prev,
      currentSuggestionIdx: prev.currentSuggestionIdx - 1,
    }));
  }, [suggestions.all, suggestions.currentSuggestionIdx]);

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

  const ctxValues = useMemo(
    () => ({
      subjects,
      swappingActivity,
      suggestions,
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
    }),
    [
      handleNextSuggest,
      handlePrevSuggest,
      handleSuggest,
      handleSwapActivity,
      handleSwapClicked,
      handleToggleActivity,
      subjects,
      suggestions,
      swappingActivity,
    ],
  );

  return <DashboardContext value={ctxValues}>{children}</DashboardContext>;
}

DashboardContext.displayName = "DashboardContext";
