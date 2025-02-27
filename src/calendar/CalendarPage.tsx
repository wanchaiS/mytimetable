import { AppContext } from "@/App";
import { use, useEffect, useRef, useState } from "react";
import { getStartEndWeekDate, isSameDay } from "../lib/dateHelpers";
import { ActivityType, SubjectType } from "../types/common";
import { DAY_ABBREVIATIONS } from "./constants";
import Dropzone from "./dropzone/Dropzone";

function getTimes(): string[] {
  return Array.from({ length: 48 }, (_, i) => {
    let hour = 0;
    let mins = "00";

    // inrement hour
    if (i % 2 === 0) {
      hour = Math.floor(i / 2);
    } else {
      hour = Math.floor((i - 1) / 2);
      mins = "30";
    }
    let timeInd = "AM";
    if (hour > 11) {
      timeInd = "PM";
    }
    // format hour
    if (hour > 12) {
      hour = hour - 12;
    }

    return `${hour}:${mins} ${timeInd}`;
  });
}

interface CalendarPageProp {
  subjects: SubjectType[];
  onSwapTo: (swappingin: ActivityType) => void;
  onClickSwap: (swappingout: ActivityType) => void;
  onDeselectActivity: (activity: ActivityType) => void;
  onSelectActivityFromSelectingSubject: (activity: ActivityType) => void;
}

const cellWidth = 175;
const cellheight = 40;
const TIMES = getTimes();

function getDatesOfWeek(date?: string): Date[] {
  const [startDateOfWeek] = getStartEndWeekDate(date);
  let days: Date[] = [];
  let cur = startDateOfWeek;
  while (days.length < 7) {
    days.push(new Date(cur.getTime()));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

function getDayName(date: Date) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
}

export default function CalendarPage({
  subjects,
  onSwapTo,
  onClickSwap,
  onDeselectActivity,
  onSelectActivityFromSelectingSubject,
}: CalendarPageProp): React.JSX.Element {
  const startHourRef = useRef<HTMLDivElement | null>(null);
  const [days, setDays] = useState<Date[]>(getDatesOfWeek());
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const { swappingActivity, selectingSubject } = use(AppContext);

  const selectedActivities = subjects
    .flatMap((sub) => sub.activities)
    .filter((ac) => ac.selected);

  const availableActivities = subjects
    .flatMap((sub) => sub.activities)
    .filter((ac) => !ac.selected);

  const swapingActivityOptions = subjects
    .filter((sub) => sub.code === swappingActivity?.code)
    .flatMap((sub) => sub.activities)
    .filter((ac) => !ac.selected && swappingActivity?.type === ac.type);

  const selectingSubjectActivityOptions = subjects
    .filter((sub) => sub.code === selectingSubject?.code)
    .flatMap((sub) => sub.activities)
    .filter((ac) => !ac.selected);
  const currentWeekActivities =
    currentWeek === 0
      ? selectedActivities
      : selectedActivities.filter((sa) =>
          sa.dates.some((d) => days.some((day) => isSameDay(day, d))),
        );

  useEffect(() => {
    if (startHourRef.current) {
      startHourRef.current.scrollIntoView({ behavior: "auto", block: "start" });
      window.scrollBy(0, -100);
    }
  }, []);

  function handlePreviousWeek() {
    const firstD = days[0];
    const prevDay = new Date(firstD.getTime());
    prevDay.setDate(prevDay.getDate() - 1);
    const lastDayOfPrevWeek = `${prevDay.getFullYear()}-${prevDay.getMonth() + 1}-${prevDay.getDate()}`;
    setDays(getDatesOfWeek(lastDayOfPrevWeek));
  }

  function handleNextWeek() {
    const lastD = days[6];
    const nextDay = new Date(lastD.getTime());
    nextDay.setDate(nextDay.getDate() + 1);
    const firstDOfNextWeek = `${nextDay.getFullYear()}-${nextDay.getMonth() + 1}-${nextDay.getDate()}`;
    setDays(getDatesOfWeek(firstDOfNextWeek));
  }

  return (
    <div className="flex-1 flex-col border-r border-gray-200">
      {/* <div className="flex">
        <Button className="" onClick={() => handlePreviousWeek()}>
          Back
        </Button>

        <div className="flex-1 p-4">
          {currentWeek === 0
            ? "All Weeks"
            : `Week ${currentWeek} (${days[0].toDateString()} - ${days[days.length - 1].toDateString()})`}
        </div>

        <Button onClick={() => handleNextWeek()}>Next</Button>
      </div> */}

      <div>
        {/** Day Headers */}
        <div className="flex border-b border-gray-200">
          <div style={{ width: 80 }}></div>
          {days.map((date) => {
            const day = getDayName(date);
            return (
              <div
                style={{ width: cellWidth }}
                className="flex justify-center align-middle"
                key={day}
              >
                <span>{day}</span>
              </div>
            );
          })}
        </div>

        {/** Grid */}
        <div className="flex h-[calc(100vh-64px)] overflow-y-auto pt-[20px]">
          <div>
            {TIMES.map((time, i) => (
              <div
                key={time}
                style={{ height: cellheight, width: 80 }}
                className={`relative ${i % 2 === 1 ? "invisible" : "visible"}`}
              >
                <span className="absolute -top-[12px] right-[6px]">{time}</span>
              </div>
            ))}
          </div>

          {Object.values(DAY_ABBREVIATIONS).map((day) => {
            const activitiesPerDay = currentWeekActivities.filter(
              (ca) => ca.day === day,
            );
            const swappingActivityOptionsPerDay = swapingActivityOptions.filter(
              (a) => a.day === day,
            );
            const selectingSubjectActivityOptionsPd =
              selectingSubjectActivityOptions.filter((ac) => ac.day === day) ||
              [];
            return (
              <div key={day} className="relative">
                {TIMES.map((hour) => {
                  return (
                    <div
                      ref={hour === "8:30 AM" ? startHourRef : null}
                      key={`${day}-${hour}`}
                      style={{ height: cellheight, width: cellWidth }}
                      className={"border border-gray-200"}
                    ></div>
                  );
                })}
                {/** Drop zones */}
                <Dropzone
                  key={`${day}-dropzone`}
                  activities={activitiesPerDay}
                  swappingOptions={swappingActivityOptionsPerDay}
                  selectingSubjectActivityOptions={
                    selectingSubjectActivityOptionsPd
                  }
                  availableActivities={availableActivities}
                  onClickSwap={onClickSwap}
                  onDeselectActivity={onDeselectActivity}
                  onSwapTo={onSwapTo}
                  onSelectActivityFromSelectingSubject={
                    onSelectActivityFromSelectingSubject
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
