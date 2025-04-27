import { ActivityType, SubjectType } from "@/hooks/useSubjects";
import { ActivityCombinationType, SuggestionsType } from "@/lib/subjectPlanner";
import { Preference } from "@/types";
import { createContext } from "react";

type DashboardContextType = {
  subjects: SubjectType[];
  swapping: boolean;
  swappingActivity: ActivityType | undefined;
  selectingActivityTypeCode: string | undefined;
  suggestionsController: SuggestionControllerType;
  preference: Preference;
  semester: string | undefined;
  onSelectActivityByType: (subject: string) => void;
  onSelectActivity: (activity: ActivityType) => void;
  onDeselectActivity: (activity: ActivityType) => void;
  onSwapClicked: (activity: ActivityType | undefined) => void;
  onSwapActivity: (newActivity: ActivityType) => void;
  onDeselectSubject: (subject: SubjectType) => void;
  onAddSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onSetPreference: (pref: Preference) => void;
  onSuggest: () => void;
  onNextSuggest: () => void;
  onPrevSuggest: () => void;
  onChangeSemester: (semester: string) => void;
  onClearSelected: () => void;
  onAbortSwapping: () => void;
};

export type SuggestionControllerType = {
  allSuggestedBySem: ActivityCombinationType[];
  allSuggested: SuggestionsType[];
  currentSuggestionIdx: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const DashboardContext = createContext<DashboardContextType>({
  subjects: [],
  swapping: false,
  selectingActivityTypeCode: undefined,
  swappingActivity: undefined,
  suggestionsController: {
    allSuggestedBySem: [],
    allSuggested: [],
    currentSuggestionIdx: 0,
    hasNext: false,
    hasPrev: false,
  },
  preference: "Late",
  semester: "Autumn",
  onSelectActivityByType: () => {},
  onSelectActivity: () => {},
  onDeselectActivity: () => {},
  onSwapClicked: () => {},
  onSwapActivity: () => {},
  onDeselectSubject: () => {},
  onAddSubject: () => {},
  onRemoveSubject: () => {},
  onSetPreference: () => {},
  onSuggest: () => {},
  onNextSuggest: () => {},
  onPrevSuggest: () => {},
  onChangeSemester: () => {},
  onClearSelected: () => {},
  onAbortSwapping: () => {},
});
