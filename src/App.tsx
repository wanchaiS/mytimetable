import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { produce } from "immer";
import { createContext, useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import "./style.css";
// import mockData from "./subjects.json";
import mockDataTest from "./subjectsTest.json";
import {
  ActivityType,
  AppContextType,
  Preference,
  SubjectType,
} from "./types/common";
import Uploader from "./uploader/Uploader";

import CalendarPage from "./calendar/CalendarPage";
import { Button } from "./components/ui/button";
import { getSubjects } from "./lib/dateHelpers";
import { suggest } from "./lib/subjectPlanner";

const queryClient = new QueryClient();
export const AppContext = createContext<AppContextType>({
  selectMode: false,
  selectingSubject: undefined,
  swappingActivity: undefined,
});

function App() {
  const [subjects, setSubjects] = useState<SubjectType[]>(
    getSubjects(mockDataTest),
  );
  const [selectingSubject, setSelectingSubject] = useState<
    SubjectType | undefined
  >();

  const [swappingActivity, setSwappingActivity] = useState<
    ActivityType | undefined
  >();

  const [suggestions, setSuggestions] = useState<{
    all: ActivityType[][];
    currentSuggestionIdx: number;
  }>({ all: [], currentSuggestionIdx: 0 });
  const [preference, setPreference] = useState<Preference>("MostTimeEfficient");

  suggest(subjects);

  const selectMode =
    swappingActivity !== undefined || selectingSubject !== undefined;
  console.log("suggestions", suggestions.all);
  console.log("subjects", subjects);
  console.log(
    "current suggestion",
    suggestions.all[suggestions.currentSuggestionIdx],
  );

  function handleToggleActivity(activity: ActivityType) {
    setSubjects(
      produce((draft: SubjectType[]) => {
        let subjectIdx = draft.findIndex((s) => s.code === activity.code);
        if (subjectIdx === -1) {
          return;
        }
        const acIdx = draft[subjectIdx].activities.findIndex(
          (ac) => ac.id === activity.id,
        );
        if (acIdx === -1) {
          return;
        }
        // toggle activity
        draft[subjectIdx].activities[acIdx].selected =
          !draft[subjectIdx].activities[acIdx].selected;

        // deselect the same type activities
        draft[subjectIdx].activities.forEach((ac) => {
          if (ac.id !== activity.id && ac.type === activity.type) {
            ac.selected = false;
          }
        });

        // deter fully enrolled
        if (isAllTypesSelected(activity, draft[subjectIdx].activities)) {
          draft[subjectIdx].fullyEnrolled = true;
        } else {
          draft[subjectIdx].fullyEnrolled = false;
        }
      }),
    );
  }

  function handleDeselectActivity(activity: ActivityType) {
    setSubjects(
      produce((draft: SubjectType[]) => {
        let subjectIdx = draft.findIndex((s) => s.code === activity.code);
        if (subjectIdx === -1) {
          return;
        }
        const acIdx = draft[subjectIdx].activities.findIndex(
          (ac) => ac.id === activity.id,
        );
        if (acIdx === -1) {
          return;
        }
        // deselect activity
        draft[subjectIdx].activities[acIdx].selected = false;

        // deter fully enrolled
        if (isAllTypesSelected(activity, draft[subjectIdx].activities)) {
          draft[subjectIdx].fullyEnrolled = true;
        } else {
          draft[subjectIdx].fullyEnrolled = false;
        }
      }),
    );
  }

  function handleChangeActivity(swappingIn: ActivityType) {
    if (swappingActivity === undefined) {
      return;
    }
    setSubjects(
      produce((draft: SubjectType[]) => {
        let subjectIdx = draft.findIndex(
          (s) => s.code === swappingActivity.code,
        );
        if (subjectIdx === -1) {
          return;
        }
        const acIdx = draft[subjectIdx].activities.findIndex(
          (ac) => ac.id === swappingActivity.id,
        );
        if (acIdx === -1) {
          return;
        }
        // deselect activity
        draft[subjectIdx].activities[acIdx].selected = false;

        const newAcIdx = draft[subjectIdx].activities.findIndex(
          (ac) => ac.id === swappingIn.id,
        );
        if (newAcIdx === -1) {
          return;
        }
        draft[subjectIdx].activities[newAcIdx].selected = true;

        // deter if all types are selected
        if (isAllTypesSelected(swappingIn, draft[subjectIdx].activities)) {
          draft[subjectIdx].fullyEnrolled = true;
        } else {
          draft[subjectIdx].fullyEnrolled = false;
        }
      }),
    );
    setSwappingActivity(undefined);
  }

  function handleDeselectSubject(subject: SubjectType) {
    setSubjects(
      produce((draft: SubjectType[]) => {
        let subjectIdx = draft.findIndex((s) => s.code === subject.code);
        if (subjectIdx === -1) {
          return;
        }
        draft[subjectIdx].fullyEnrolled = false;
        draft[subjectIdx].activities.forEach((activity) => {
          activity.selected = false;
        });
      }),
    );
  }

  function handleSelectSubject(subject: SubjectType) {
    let sub = subjects.find((s) => s.code === subject.code);
    if (sub === undefined) {
      return;
    }
    setSelectingSubject(sub);
  }

  function handleSelectActivityFromSelectingSubject(activity: ActivityType) {
    let allActivityTypesSelected = false;

    setSubjects(
      produce((draft: SubjectType[]) => {
        const subject = draft.find((s) => s.code === activity.code);
        if (subject === undefined) {
          return;
        }

        const sameTypeSelectedIdx = subject.activities.findIndex(
          (ac) => ac.selected && ac.type === activity.type,
        );

        const updated = subject.activities.find((ac) => ac.id === activity.id);
        if (updated === undefined) {
          return;
        }

        // swap
        if (sameTypeSelectedIdx !== -1) {
          subject.activities[sameTypeSelectedIdx].selected = false;
        }
        updated.selected = true;
        allActivityTypesSelected = isAllTypesSelected(
          activity,
          subject.activities,
        );

        if (allActivityTypesSelected) {
          subject.fullyEnrolled = true;
        }
      }),
    );

    if (allActivityTypesSelected) {
      setSelectingSubject(undefined);
    }
  }

  function isAllTypesSelected(
    activity: ActivityType,
    updatedActivities: ActivityType[],
  ): boolean {
    const allTypes = [
      ...new Set(
        subjects
          .filter((s) => s.code === activity.code)
          .flatMap((s) => s.activities)
          .map((ac) => ac.type),
      ),
    ];

    const allSelectedTypes = [
      ...new Set(
        updatedActivities.filter((ac) => ac.selected).map((ac) => ac.type),
      ),
    ];
    return allTypes.length === allSelectedTypes.length;
  }

  function handleRemoveSubject(subject: SubjectType) {
    setSubjects(
      produce((draft: SubjectType[]) => {
        let subjectIdx = draft.findIndex((s) => s.code === subject.code);
        if (subjectIdx === -1) {
          return;
        }
        draft.splice(subjectIdx, 1);
      }),
    );
  }

  function handleSuggest() {
    const combinations = suggest(subjects, preference);
    if (combinations.length === 0) {
      return;
    }
    // set the first suggestion to subjects
    selectAcitivitiesBySuggestion(combinations[0]);
    setSuggestions({ all: combinations, currentSuggestionIdx: 0 });
  }

  function handleNextSuggest() {
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
  }

  function handlePrevSuggest() {
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
  }

  function selectAcitivitiesBySuggestion(suggestion: ActivityType[]) {
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
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{ selectMode, selectingSubject, swappingActivity }}
      >
        <div className="h-screen overflow-x-auto bg-gray-100">
          {subjects === undefined ? (
            <Uploader />
          ) : (
            <div className="flex">
              <Sidebar
                subjects={subjects}
                onToggleActivity={handleToggleActivity}
                onDeSelectSubject={handleDeselectSubject}
                onSelectSubject={handleSelectSubject}
                onRemoveSubject={handleRemoveSubject}
              />
              <div>
                <div className="space-x-4 p-4">
                  <span>Preference</span>
                  <select
                    name="preference"
                    id="preference"
                    value={preference}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setPreference(e.target.value as Preference)
                    }
                  >
                    <option value="MostTimeEfficient">
                      Most Time Efficient
                    </option>
                    <option value="EarlyBird">Early bird</option>
                    <option value="NightOwl">Night owl</option>
                  </select>
                  <Button onClick={() => handleSuggest()}>Suggest</Button>
                  <Button
                    onClick={handlePrevSuggest}
                    disabled={suggestions.currentSuggestionIdx === 0}
                  >
                    Prev Suggestion
                  </Button>
                  <Button
                    onClick={handleNextSuggest}
                    disabled={
                      suggestions.currentSuggestionIdx >=
                      suggestions.all.length - 1
                    }
                  >
                    Next Suggestion
                  </Button>
                </div>
                <CalendarPage
                  subjects={subjects}
                  onSwapTo={handleChangeActivity}
                  onClickSwap={(swappingin) => setSwappingActivity(swappingin)}
                  onDeselectActivity={handleDeselectActivity}
                  onSelectActivityFromSelectingSubject={
                    handleSelectActivityFromSelectingSubject
                  }
                />
              </div>
            </div>
          )}
        </div>
      </AppContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
