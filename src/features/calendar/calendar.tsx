import { Button } from "@/components/ui/button";
import { DAY_ABBREVIATIONS } from "@/constants";
import { minsToAMPM } from "@/lib/dateHelpers";
import DayColumn from "./day-column";
import CalendarPanel from "./panel/calendar-panel";

export default function Calendar(): React.JSX.Element {
  const times = getTimes();
  return (
    <div className="flex h-full flex-1 flex-col">
      <CalendarPanel />
      <div className="flex h-full flex-col">
        {/** Days */}
        <ul className="grid grid-cols-7 pr-2 pl-18">
          {Object.keys(DAY_ABBREVIATIONS).map((day) => (
            <li key={day} className="flex justify-center">
              <Button variant={"ghost"}>{day}</Button>
            </li>
          ))}
        </ul>

        {/** actual calendar */}
        <div className="relative flex-1">
          <div className="absolute top-0 right-0 bottom-0 left-0 flex overflow-y-auto">
            {/** time */}
            <ul className="w-18 pl-4 text-xs">
              {times.map((time) => (
                <li key={time} className="h-16">
                  <span>{time}</span>
                </li>
              ))}
            </ul>

            {/** content */}
            <div className="grid flex-1 grid-cols-7 pt-3">
              {Object.values(DAY_ABBREVIATIONS).map((day) => (
                <div key={day} className="relative">
                  {times.map((time) => (
                    <div
                      key={time}
                      className="h-16 border-t border-l border-(--border)"
                    ></div>
                  ))}
                  <DayColumn day={day} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimes() {
  const startMins = 8 * 60;
  const gapMins = 30;
  const lastMins = 24 * 60;

  const times: string[] = [];
  for (let i = startMins; i < lastMins; i = i += gapMins) {
    const time = minsToAMPM(i);
    if (time === null) {
      continue;
    }
    times.push(time);
  }
  return times;
}
