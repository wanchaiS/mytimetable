import { ActivityType, Preference, SubjectType } from "@/types";
import { createContext } from "react";

type DashboardContextType = {
  subjects: SubjectType[];
  swappingActivity: ActivityType | undefined;
  suggestions: {
    all: ActivityType[][];
    currentSuggestionIdx: number;
  };
  onToggleActivity: (activity: ActivityType) => void;
  onDeselectActivity: (activity: ActivityType) => void;
  onSwapClicked: (activity: ActivityType) => void;
  onSwapActivity: (newActivity: ActivityType) => void;
  onDeselectSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subvject: SubjectType) => void;
  onSetPreference: (pref: Preference) => void;
  onSuggest: () => void;
  onNextSuggest: () => void;
  onPrevSuggest: () => void;
};

export const DashboardContext = createContext<DashboardContextType>({
  subjects: [],
  swappingActivity: undefined,
  suggestions: {
    all: [],
    currentSuggestionIdx: 0,
  },
  onToggleActivity: () => {},
  onDeselectActivity: () => {},
  onSwapClicked: () => {},
  onSwapActivity: () => {},
  onDeselectSubject: () => {},
  onRemoveSubject: () => {},
  onSetPreference: () => {},
  onSuggest: () => {},
  onNextSuggest: () => {},
  onPrevSuggest: () => {},
});
