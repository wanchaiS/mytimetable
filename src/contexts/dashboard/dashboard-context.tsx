import { SuggestionsPerSemType } from "@/lib/subjectPlanner";
import { ActivityType, Preference, Semester, SubjectType } from "@/types";
import { createContext } from "react";

type DashboardContextType = {
  subjects: SubjectType[];
  swappingActivity: ActivityType | undefined;
  suggestions: SuggestionType;
  preference: Preference;
  semester: Semester;
  onToggleActivity: (activity: ActivityType) => void;
  onDeselectActivity: (activity: ActivityType) => void;
  onSwapClicked: (activity: ActivityType) => void;
  onSwapActivity: (newActivity: ActivityType) => void;
  onDeselectSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onSetPreference: (pref: Preference) => void;
  onSuggest: () => void;
  onNextSuggest: () => void;
  onPrevSuggest: () => void;
  onChangeSemester: (semester: Semester) => void;
};

export type SuggestionType = {
  all: SuggestionsPerSemType;
  currentSuggestionIdx: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export const DashboardContext = createContext<DashboardContextType>({
  subjects: [],
  swappingActivity: undefined,
  suggestions: {
    all: { Autumn: [], Spring: [], Summer: [] },
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
  onRemoveSubject: () => {},
  onSetPreference: () => {},
  onSuggest: () => {},
  onNextSuggest: () => {},
  onPrevSuggest: () => {},
  onChangeSemester: () => {},
});
