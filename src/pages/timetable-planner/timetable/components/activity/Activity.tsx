import { ActivityType } from "@/pages/timetable-planner/hooks/useSearchSubjects";
import React, { use } from "react";
import { TimetableContext } from "../../../contexts/TimetableContext";
import { cn } from "@/lib/utils";

interface ActivityProps {
  activity: ActivityType;
  maxColumns: number;
  colNumber: number;
  onClick: () => void;
}

const MINUTES_IN_DAY = 1440;

function getTop(activity: ActivityType) {
  const topPct = (activity.startTimeMins / MINUTES_IN_DAY) * 100;
  return topPct;
}
function getBottom(activity: ActivityType) {
  const bottomPct = 100 - (activity.endTimeMins / MINUTES_IN_DAY) * 100;
  return bottomPct;
}

function getLineClamp(durationMins: number): string {
  if (durationMins <= 60) return 'line-clamp-2';
  if (durationMins <= 120) return 'line-clamp-3';
  if (durationMins <= 180) return 'line-clamp-4';
  return 'line-clamp-6';
}

export default function Activity({
  activity,
  colNumber,
  maxColumns,
  onClick,
}: ActivityProps): React.JSX.Element {
  const { subjects } = use(TimetableContext);

  const subject = subjects.find((s) => s.code === activity.code);

  const width = 100 / maxColumns;
  const top = getTop(activity);
  const bottom = getBottom(activity);
  const left = width * colNumber;
  // where the right edge of the column ends
  const colSpan =
    colNumber === maxColumns - 1 ? 0 : maxColumns - (colNumber + 1);
  const right = width * colSpan;

  return (
    <div
      className="absolute cursor-pointer pr-1 pb-1 hover:brightness-75"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        bottom: `${bottom}%`,
        right: `${right}%`,
      }}
      id={`activity-${activity.id}`}
      onClick={onClick}
    >
      <div
        style={{
          backgroundColor: `rgba(${subject?.color}, 0.7)`,
          borderColor: `rgb(${subject?.color})`,
        }}
        className="bg-background flex h-full flex-col overflow-hidden rounded-sm border-l-10 p-1"
      >
        <div
          className={cn(
            "w-full text-xs md:text-sm",
            "overflow-hidden break-words",
            getLineClamp(activity.duration)
          )}
          title={`${subject?.callista_code} - ${activity.typeDesc}:${activity.activity}\n${subject?.name}`}
        >
          <div className="font-semibold">
            {subject?.callista_code} - {activity.typeDesc}:{activity.activity}
          </div>
          <div className="text-[0.7rem] md:text-xs opacity-90">
            {subject?.name}
          </div>
        </div>
      </div>
    </div>
  );
}
