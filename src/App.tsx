import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { produce } from "immer";
import { useState } from "react";
import Sidebar from "./sidebar/Sidebar";
import "./style.css";
import mockData from "./subjects.json";
import { ActivityType, SubjectType } from "./types/common";
import Uploader from "./uploader/Uploader";

import CalendarPage from "./calendar/CalendarPage";
import { getSubjects } from "./lib/dateHelpers";

const queryClient = new QueryClient();

function App() {
  const [subjects, setSubjects] = useState<SubjectType[]>(
    getSubjects(mockData),
  );
  console.log("subjects", subjects);

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

        // unselect of no activities selected
        if (draft[subjectIdx].activities.every((ac) => ac.selected === false)) {
          draft[subjectIdx].selected = false;
        } else {
          draft[subjectIdx].selected = true;
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

        // unselect of no activities selected
        if (draft[subjectIdx].activities.every((ac) => ac.selected === false)) {
          draft[subjectIdx].selected = false;
        } else {
          draft[subjectIdx].selected = true;
        }
      }),
    );
  }

  function handleDeselectSubject(subject: SubjectType) {
    setSubjects(
      produce((draft: SubjectType[]) => {
        let subjectIdx = draft.findIndex((s) => s.code === subject.code);
        if (subjectIdx === -1) {
          return;
        }
        draft[subjectIdx].selected = false;
        draft[subjectIdx].activities.forEach((activity) => {
          activity.selected = false;
        });
      }),
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-x-auto bg-gray-100">
        {subjects === undefined ? (
          <Uploader />
        ) : (
          <>
            <Sidebar
              subjects={subjects}
              onToggleActivity={handleToggleActivity}
              onDeSelectSubject={handleDeselectSubject}
            />
            <CalendarPage
              subjects={subjects}
              // onChangeActivity={selectingSubject}
              onDeselectActivity={handleDeselectActivity}
            />
          </>
        )}
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
