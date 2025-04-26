import { ReactNode, useCallback, useMemo, useState } from "react";

import useLocalStorage from "@/hooks/useStorage";
import { ActivityType, SubjectType } from "@/hooks/useSubjects";
import { suggest } from "@/lib/subjectPlanner";
import { Preference } from "@/types";
import { produce } from "immer";
import {
  DashboardContext,
  SuggestionControllerType,
} from "./dashboard-context";

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

function getFirstSem(subjects: SubjectType[]): string {
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
  const [subjects, setSubjects] = useLocalStorage<SubjectType[]>(
    "subjects",
    [],
  );

  const [semester, setSemester] = useState(getFirstSem(subjects));

  const [swappingActivity, setSwappingActivity] = useState<
    ActivityType | undefined
  >();

  const [selectingActivityTypeCode, setSelectingActivityTypeCode] = useState<
    string | undefined
  >();
  const [swapping, setSwapping] = useState(false);

  const [suggestionsController, setSuggestionsController] =
    useState<SuggestionControllerType>({
      allSuggestedBySem: [],
      allSuggested: [],
      currentSuggestionIdx: 0,
      hasNext: false,
      hasPrev: false,
    });

  const [preference, setPreference] = useState<Preference>("Late");

  const handleClearSelected = useCallback(() => {
    setSubjects(
      produce((draft: SubjectType[]) => {
        draft.forEach((subject) => {
          subject.activities.forEach((ac) => (ac.selected = false));
        });
      }),
    );
    setSuggestionsController({
      allSuggestedBySem: [],
      allSuggested: [],
      currentSuggestionIdx: 0,
      hasNext: false,
      hasPrev: false,
    });
  }, [setSubjects]);

  const handleSelectActivityByType = useCallback((typeCode: string) => {
    setSelectingActivityTypeCode(typeCode);
    setSwapping(true);
  }, []);

  const handleSelectActivity = useCallback(
    (activity: ActivityType) => {
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
      setSwapping(false);
      setSelectingActivityTypeCode(undefined);
    },
    [setSubjects],
  );

  const handleDeselectActivity = useCallback(
    (activity: ActivityType) => {
      setSubjects(
        produce((draft: SubjectType[]) => {
          const [subjectIdx, acIdx] = getIndexes(draft, activity);
          // deselect activity
          draft[subjectIdx].activities[acIdx].selected = false;
        }),
      );
    },
    [setSubjects],
  );

  const handleSwapClicked = useCallback(
    (swappingOut: ActivityType | undefined) => {
      if (swappingOut) {
        setSwappingActivity(swappingOut);
      }
      setSwapping(true);
    },
    [],
  );

  const handleSwapActivity = useCallback(
    (swappingIn: ActivityType) => {
      if (swappingActivity === undefined) {
        return;
      }
      handleSelectActivity(swappingIn);

      setSwappingActivity(undefined);
      setSwapping(false);
    },
    [handleSelectActivity, swappingActivity],
  );

  const handleDeselectSubject = useCallback(
    (subject: SubjectType) => {
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
    },
    [setSubjects],
  );

  const handleAddSubject = useCallback(
    (subject: SubjectType) => {
      setSubjects(
        produce((draft: SubjectType[]) => {
          if (draft.length === 0) {
            setSemester(subject.semester);
          }
          draft.push(subject);
        }),
      );
    },
    [setSubjects],
  );

  const handleRemoveSubject = useCallback(
    (subjectCode: string) => {
      setSubjects(
        produce((draft: SubjectType[]) => {
          const subjectIdx = draft.findIndex((s) => s.code === subjectCode);
          if (subjectIdx === -1) {
            return;
          }
          draft.splice(subjectIdx, 1);
        }),
      );
    },
    [setSubjects],
  );

  const selectAcitivitiesBySuggestion = useCallback(
    (suggestion: ActivityType[]) => {
      setSubjects(
        produce((draft: SubjectType[]) => {
          for (let i = 0; i < draft.length; i++) {
            const subject = draft[i];
            for (let j = 0; j < subject.activities.length; j++) {
              const activity = subject.activities[j];

              if (!suggestion.find((s) => s.id === activity.id)) {
                activity.selected = false;
              } else {
                activity.selected = true;
              }
            }
          }
        }),
      );
    },
    [setSubjects],
  );

  const handleSuggest = useCallback(() => {
    const suggestions = suggest(subjects, preference);
    if (suggestions.length === 0) {
      return;
    }

    const suggestionSem = suggestions.find((s) => s.semester === semester);
    if (!suggestionSem) {
      return;
    }

    const allBestCombo = suggestionSem.subjectCombinations.flatMap(
      (sc) => sc.activityCombinations,
    );

    // set the first suggestion to subjects
    selectAcitivitiesBySuggestion(allBestCombo[0].activities);
    setSuggestionsController({
      allSuggestedBySem: allBestCombo,
      allSuggested: suggestions,
      currentSuggestionIdx: 0,
      hasNext: allBestCombo.length > 1,
      hasPrev: false,
    });
  }, [preference, selectAcitivitiesBySuggestion, semester, subjects]);

  const handleNextSuggest = useCallback(() => {
    if (suggestionsController.allSuggestedBySem.length === 0) {
      return;
    }

    if (
      suggestionsController.currentSuggestionIdx >=
      suggestionsController.allSuggestedBySem.length - 1
    ) {
      return;
    }
    selectAcitivitiesBySuggestion(
      suggestionsController.allSuggestedBySem[
        suggestionsController.currentSuggestionIdx + 1
      ].activities,
    );
    setSuggestionsController((prev) => ({
      ...prev,
      currentSuggestionIdx: prev.currentSuggestionIdx + 1,
      hasNext:
        prev.currentSuggestionIdx + 1 < prev.allSuggestedBySem.length - 1,
      hasPrev: true,
    }));
  }, [
    selectAcitivitiesBySuggestion,
    suggestionsController.allSuggestedBySem,
    suggestionsController.currentSuggestionIdx,
  ]);

  const handlePrevSuggest = useCallback(() => {
    if (suggestionsController.allSuggestedBySem.length === 0) {
      return;
    }

    if (suggestionsController.currentSuggestionIdx === 0) {
      return;
    }

    selectAcitivitiesBySuggestion(
      suggestionsController.allSuggestedBySem[
        suggestionsController.currentSuggestionIdx - 1
      ].activities,
    );
    setSuggestionsController((prev) => ({
      ...prev,
      currentSuggestionIdx: prev.currentSuggestionIdx - 1,
      hasNext: true,
      hasPrev: prev.currentSuggestionIdx - 1 !== 0,
    }));
  }, [
    selectAcitivitiesBySuggestion,
    suggestionsController.allSuggestedBySem,
    suggestionsController.currentSuggestionIdx,
  ]);

  const handleChangeSemester = useCallback(
    (newSem: string) => {
      const newSuggestionsBySem = suggestionsController.allSuggested.find(
        (s) => s.semester === newSem,
      );
      if (!newSuggestionsBySem) {
        return;
      }
      const allBestCombo = newSuggestionsBySem.subjectCombinations.flatMap(
        (sc) => sc.activityCombinations,
      );

      selectAcitivitiesBySuggestion(allBestCombo[0].activities);
      setSuggestionsController((prev) => ({
        ...prev,
        currentSuggestionIdx: 0,
        hasNext: allBestCombo.length > 1,
        hasPrev: false,
      }));

      setSemester(newSem);
    },
    [selectAcitivitiesBySuggestion, suggestionsController.allSuggested],
  );

  const ctxValues = useMemo(
    () => ({
      subjects,
      swappingActivity,
      selectingActivityTypeCode,
      swapping,
      suggestionsController,
      preference,
      semester,
      onSelectActivityByType: handleSelectActivityByType,
      onSelectActivity: handleSelectActivity,
      onDeselectActivity: handleDeselectActivity,
      onSwapClicked: handleSwapClicked,
      onSwapActivity: handleSwapActivity,
      onDeselectSubject: handleDeselectSubject,
      onRemoveSubject: handleRemoveSubject,
      onAddSubject: handleAddSubject,
      onSuggest: handleSuggest,
      onNextSuggest: handleNextSuggest,
      onPrevSuggest: handlePrevSuggest,
      onSetPreference: (pref: Preference) => setPreference(pref),
      onChangeSemester: handleChangeSemester,
      onClearSelected: handleClearSelected,
    }),
    [
      handleSelectActivityByType,
      handleAddSubject,
      handleChangeSemester,
      handleSelectActivity,
      handleDeselectActivity,
      handleDeselectSubject,
      handleNextSuggest,
      handlePrevSuggest,
      handleRemoveSubject,
      handleSuggest,
      handleSwapActivity,
      handleSwapClicked,
      handleClearSelected,
      preference,
      semester,
      subjects,
      suggestionsController,
      swappingActivity,
      swapping,
      selectingActivityTypeCode,
    ],
  );

  return <DashboardContext value={ctxValues}>{children}</DashboardContext>;
}

DashboardContext.displayName = "DashboardContext";
