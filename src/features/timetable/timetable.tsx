import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { WEEK_DAYS, WEEKEND_DAYS } from "@/constants";
import { TimetableContext } from "@/contexts/timetable/timetable-context";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ActivityType } from "@/hooks/useSearchSubjects";
import { cn } from "@/lib/utils";
import useTimetableStore from "@/store/useTimetableStore";
import { CalendarView } from "@/types";
import { ChevronUp } from "lucide-react";
import { use, useEffect, useState } from "react";
import CalendarPanel from "./components/panel/calendar-panel";
import { PreferenceSettings } from "./components/preference-settings/preference-settings";
import SearchSubjects from "./components/search-subjects/search-subjects";
import DayColumn from "./day-column/day-column";
import SubjectsDrawer from "./subjects-drawer/subjects-drawer";
import SubjectsSidebar from "./subjects-sidebar/subjects-sidebar";

export default function Calendar(): React.JSX.Element {
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showPreferenceSettings, setShowPreferenceSettings] = useState(false);
  const [activeSubjectCode, setActiveSubjectCode] = useState<
    string | undefined
  >();
  const isMobile = useIsMobile();
  const [showDrawer, setShowDrawer] = useState(false);

  const times = getTimes();
  const { calendarView, semester } = useTimetableStore();
  const days = getDays(calendarView);
  const {
    subjects,
    maxCredit,
    onSelectActivity,
    onAddSubject,
    onRemoveSubject,
  } = use(TimetableContext);
  const selectedActivities = subjects.flatMap((sub) =>
    sub.activities.filter((ac) => ac.selected),
  );

  // scroll to earlierst activity on mount
  useEffect(() => {
    const selectedActivities = subjects
      .flatMap((s) => s.activities)
      .filter((a) => a.selected);

    if (selectedActivities.length === 0) return;

    // Find the earliest by start_time_mins
    const earliest = selectedActivities.reduce((min, a) =>
      a.start_time_mins < min.start_time_mins ? a : min,
    );

    // Scroll to the activity block
    scrollToActivity(earliest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function scrollToActivity(activity: ActivityType) {
    const el = document.getElementById(`activity-${activity.id}`);
    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }

  return (
    <ResizablePanelGroup
      autoSaveId="timetable-panel-group"
      direction="horizontal"
      className="!flex-col md:!flex-row"
    >
      <ResizablePanel
        defaultSize={75}
        className="flex h-[calc(100svh-60px)] flex-1 !basis-auto flex-col md:!basis-0"
      >
        <CalendarPanel setShowPreferenceSettings={setShowPreferenceSettings} />
        {/** Days */}
        <div className="flex">
          <div className="min-w-12 border-b border-(--border)" />
          <ul
            className={cn(
              "grid flex-1 grid-cols-7 border-b border-(--border)",
              calendarView === "weekdays" ? "grid-cols-5" : "grid-cols-7",
            )}
          >
            {days.map((day) => (
              <li key={day} className="flex min-w-12 justify-center">
                <Button className="p-6 text-sm font-bold" variant={"ghost"}>
                  {day}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/** Calendar grid */}
        <div className="relative flex-1 bg-(--calendar-grid)">
          <div className="absolute top-0 right-0 bottom-0 left-0 flex overflow-y-auto">
            {/** time */}
            <ul className="min-w-12 pl-1 text-xs">
              {times.map((time) => (
                <li
                  key={time}
                  className="flex h-(--calendar-h-m) items-center md:h-(--calendar-h-d)"
                >
                  <span>{displayTime(time)}</span>
                </li>
              ))}
            </ul>

            {/** content */}
            <div
              className={cn(
                "grid flex-1 pt-3",
                calendarView === "weekdays" ? "grid-cols-5" : "grid-cols-7",
              )}
            >
              {days.map((day) => (
                <div key={day} className="relative">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="h-(--calendar-h-m) border-t border-l border-(--c-border) md:h-(--calendar-h-d)"
                      style={
                        time % 60 === 30
                          ? { borderTopStyle: "dashed" }
                          : undefined
                      }
                    ></div>
                  ))}
                  <DayColumn
                    activities={selectedActivities.filter((a) => a.day === day)}
                    onClickActivity={(activity) => {
                      const clickedSubject = subjects.find(
                        (s) => s.code === activity.code,
                      );
                      if (clickedSubject) {
                        setActiveSubjectCode(clickedSubject.callista_code);
                        if (isMobile) {
                          setShowDrawer(true);
                        }
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ResizablePanel>

      {!isMobile ? (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={25}
            maxSize={50}
            className="flex h-full min-w-[380px] flex-1 !basis-auto flex-col md:!basis-0"
          >
            <SubjectsSidebar
              subjects={subjects}
              maxCredit={maxCredit}
              activeSubjectCode={activeSubjectCode}
              setActiveSubjectCode={setActiveSubjectCode}
              onSearchSubjects={setShowAddSubject}
              onSelectActivity={onSelectActivity}
              onRemoveSubject={onRemoveSubject}
            />
          </ResizablePanel>
        </>
      ) : (
        <Button
          onClick={() => setShowDrawer(true)}
          className={cn(
            "fixed bottom-0 left-1/2 z-50 flex h-5 w-20 -translate-x-1/2 translate-y-1/8 items-center justify-center rounded-t-full bg-blue-500 px-6 py-2 text-white shadow-2xl md:hidden",
            showDrawer && "hidden",
          )}
        >
          <ChevronUp className="h-5 w-5 shadow-lg" strokeWidth={5} />
        </Button>
      )}
      {isMobile && (
        <SubjectsDrawer
          isOpen={showDrawer}
          subjects={subjects}
          maxCredit={maxCredit}
          activeSubjectCode={activeSubjectCode}
          setActiveSubjectCode={setActiveSubjectCode}
          onSelectActivity={onSelectActivity}
          onRemoveSubject={onRemoveSubject}
          onSearchSubjects={setShowAddSubject}
          onOpenChange={setShowDrawer}
        />
      )}

      {showAddSubject && (
        <SearchSubjects
          onOpenChange={setShowAddSubject}
          onAddSubject={onAddSubject}
          subjects={subjects}
          semester={semester}
        />
      )}
      <PreferenceSettings
        open={showPreferenceSettings}
        onOpenChange={setShowPreferenceSettings}
        onSuggestCompleted={() => {
          setShowPreferenceSettings(false);
        }}
      />
    </ResizablePanelGroup>
  );
}

function getDays(currentCalendarView: CalendarView): string[] {
  if (currentCalendarView === "weekdays") {
    return WEEK_DAYS;
  }
  return [...WEEK_DAYS, ...WEEKEND_DAYS];
}

function getTimes() {
  const startMins = 0;
  const gapMins = 30;
  const lastMins = 24 * 60;

  const times: number[] = [];
  for (let i = startMins; i < lastMins; i = i += gapMins) {
    times.push(i);
  }
  return times;
}

function displayTime(time: number): string {
  if (time % 60 !== 0) return "";
  if (time === 0) return "00 AM";
  const hours24 = Math.floor(time / 60) % 24;
  const period = hours24 < 12 ? "AM" : "PM";
  const hour12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hour12} ${period}`;
}
