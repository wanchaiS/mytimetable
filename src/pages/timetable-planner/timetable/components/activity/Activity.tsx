import { ActivityType } from "@/pages/timetable-planner/hooks/useSearchSubjects";
import React, { use } from "react";
import { TimetableContext } from "../../../contexts/TimetableContext";

interface ActivityProps {
  activity: ActivityType;
  maxColumns: number;
  colNumber: number;
  onClick: () => void;
}

const MINUTES_IN_DAY = 1440;

function getTop(activity: ActivityType) {
  const topPct = (activity.start_time_mins / MINUTES_IN_DAY) * 100;
  return topPct;
}
function getBottom(activity: ActivityType) {
  const bottomPct = 100 - (activity.end_time_mins / MINUTES_IN_DAY) * 100;
  return bottomPct;
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
        className="bg-background flex h-full overflow-hidden rounded-sm border-l-10 p-1"
      >
        <div className="w-full overflow-hidden text-xs break-words text-ellipsis whitespace-pre-line md:text-sm">
          {subject?.callista_code} - {subject?.name} {activity.type} <br />
          {activity.activity}
        </div>
      </div>
    </div>
  );
}
