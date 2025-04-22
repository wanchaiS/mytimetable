import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { use, useEffect, useRef, useState } from "react";
import { DAY_ABBREVIATIONS } from "../../constants";
import { getStartEndWeekDate, isSameDay } from "../../lib/dateHelpers";
import Dropzone from "./drop-zone";
import CalendarPanel from "./panel/calendar-panel";

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

const cellWidth = 175;
const cellheight = 40;
const TIMES = getTimes();

function getDatesOfWeek(date?: string): Date[] {
  const [startDateOfWeek] = getStartEndWeekDate(date);
  const days: Date[] = [];
  const cur = startDateOfWeek;
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

export default function Calendar(): React.JSX.Element {
  const startHourRef = useRef<HTMLDivElement | null>(null);
  const [days] = useState<Date[]>(getDatesOfWeek());
  const [currentWeek] = useState<number>(0);
  const { subjects, swappingActivity, semester } = use(DashboardContext);
  const subjectsPerSem = subjects.filter((s) => s.semester === semester);

  const selectedActivities = subjectsPerSem
    .flatMap((sub) => sub.activities)
    .filter((ac) => ac.selected);

  const swapingActivityOptions = subjectsPerSem
    .filter((sub) => sub.code === swappingActivity?.code)
    .flatMap((sub) => sub.activities)
    .filter((ac) => !ac.selected && swappingActivity?.type === ac.type);

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

  return (
    <div className="flex-1 flex-col border-r border-gray-200">
      <CalendarPanel />

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
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
