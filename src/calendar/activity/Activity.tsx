import ActivityBadge from "@/components/ui/activitybadge";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ArrowLeftRight, CalendarX2 } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../../lib/utils";
import { ActivityType } from "../../types/common";

interface ActivityProps {
  activity: ActivityType;
  maxColumns: number;
  colNumber: number;
  onChangeActivity: (
    oldActivity: ActivityType,
    newActivity: ActivityType,
  ) => void;
  onDeselectActivity: (activity: ActivityType) => void;
}

function getHeight(activity: ActivityType): number {
  // get height from end time - start time
  const [startTime, endTime] = activity.startEndTime;
  const diffMs: number = endTime.getTime() - startTime.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  const height = (diffMinutes / 30) * 40;
  return height;
}

function getTop(activity: ActivityType) {
  const [startTime] = activity.startEndTime;

  // get top position from "how far is it from the 0:00AM"
  const startTimeTable = new Date();
  startTimeTable.setHours(0, 0, 0, 0);
  const diffMs = startTime.getTime() - startTimeTable.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  const top = (diffMinutes / 30) * 40;
  return top;
}

function getWidth(intersectCount: number): number {
  if (intersectCount === 0) {
    return 175;
  }
  return 175 / intersectCount;
}

function getBorder(type: string): string {
  if (type.includes("Lec")) {
    return "border border-l-10 border-[var(--type-lec)]";
  }
  if (type.includes("Cmp")) {
    return "border border-l-10 border-[var(--type-cmp)]";
  }
  if (type.includes("Wrk")) {
    return "border border-l-10 border-[var(--type-wrk)]";
  }
  if (type.includes("Tut")) {
    return "border border-l-10 border-[var(--type-tut)]";
  }
  if (type.includes("Olr")) {
    return "border border-l-10 border-[var(--type-olr)]";
  }
  if (type.includes("Lab")) {
    return "bborder border-l-10 order-[var(--type-lab)]";
  }
  return "";
}

export default function Activity({
  activity,
  colNumber,
  maxColumns,
  onChangeActivity,
  onDeselectActivity,
}: ActivityProps): React.JSX.Element {
  const [open, setOpen] = useState(false);

  const height = getHeight(activity);
  const top = getTop(activity);
  const width = getWidth(maxColumns);
  const left = width * colNumber;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div
          className="absolute pr-2 pb-1 hover:brightness-75"
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <div
            className={cn(
              "bg-background flex h-full rounded-sm p-1",
              getBorder(activity.type),
            )}
          >
            <div className="flex w-full flex-col space-y-2">
              <div className="line-clamp-3 text-sm break-words">
                {activity.name}
              </div>
              {maxColumns <= 2 && (
                <>
                  <ActivityBadge type={activity.type} />
                  <Badge variant="outline">{activity.activity}</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="border-primary bg-background z-50 max-w-40 rounded-sm border p-2"
      >
        {maxColumns > 1 && (
          <div className="mb-2 space-y-1">
            <div className="leading-none font-semibold">{activity.name}</div>
            <div className="text-muted-foreground text-sm">{activity.code}</div>
          </div>
        )}
        <div
          onClick={() => {}}
          className="flex cursor-pointer items-center space-x-1 text-sm hover:bg-gray-200"
        >
          <ArrowLeftRight color="#4ca03b" size={14} /> <span>Swap</span>
        </div>
        <div
          onClick={() => onDeselectActivity(activity)}
          className="flex cursor-pointer items-center space-x-1 text-sm hover:bg-gray-200"
        >
          <CalendarX2 color="#a03b3b" size={14} />
          <span>Remove</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
