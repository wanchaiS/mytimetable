import { ActivityType, SubjectType } from "@/hooks/useSubjects";
import { ActivityCombinationType, SuggestionsType } from "@/lib/subjectPlanner";
import { Preference } from "@/types";
import { createContext } from "react";

type DashboardContextType = {
  subjects: SubjectType[];
  swappingActivity: ActivityType | undefined;
  suggestionsController: SuggestionControllerType;
  preference: Preference;
  semester: string;
  onToggleActivity: (activity: ActivityType) => void;
  onDeselectActivity: (activity: ActivityType) => void;
  onSwapClicked: (activity: ActivityType) => void;
  onSwapActivity: (newActivity: ActivityType) => void;
  onDeselectSubject: (subject: SubjectType) => void;
  onAddSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onSetPreference: (pref: Preference) => void;
  onSuggest: () => void;
  onNextSuggest: () => void;
  onPrevSuggest: () => void;
  onChangeSemester: (semester: string) => void;
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
  onToggleActivity: () => {},
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
});
