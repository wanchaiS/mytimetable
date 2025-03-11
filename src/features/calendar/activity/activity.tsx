import ActivityBadge from "@/components/ui/activitybadge";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ArrowLeftRight, CalendarX2 } from "lucide-react";
import React, { use, useState } from "react";
import { cn } from "../../../lib/utils";
import { ActivityType } from "../../../types";

import AnimateBoarderContainer from "@/components/animateBorderContainer/AnimateBoarderContainer";
import { Button } from "@/components/ui/button";
import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import "./style.css";

interface ActivityProps {
  activity: ActivityType;
  maxColumns: number;
  colNumber: number;
  isOption: boolean;
  hasRemainingOptions: boolean;
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
  isOption,
  hasRemainingOptions,
}: ActivityProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const {
    swappingActivity,
    onSwapActivity,
    onSwapClicked,
    onDeselectActivity,
  } = use(DashboardContext);
  const swapMode = swappingActivity !== undefined;
  const isSwapOrigin = swappingActivity?.id === activity.id;

  const height = getHeight(activity);
  const top = getTop(activity);
  const width = getWidth(maxColumns);
  const left = width * colNumber;

  if (isOption && swapMode) {
    return (
      <div
        className="absolute pr-2 pb-1"
        style={{
          top: `${top}px`,
          left: `${left}px`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <AnimateBoarderContainer>
          <div
            onClick={() => onSwapActivity(activity)}
            className={cn(
              "group bg-background relative flex h-full rounded-sm p-1 hover:brightness-90",
            )}
          >
            <div className="flex w-full flex-col space-y-2">
              <ActivityBadge type={activity.type} />
              <Badge variant="outline">{activity.activity}</Badge>
            </div>
          </div>
        </AnimateBoarderContainer>
      </div>
    );
  }

  return (
    <Popover open={open && !swapMode} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div
          className={cn(
            "absolute pr-2 pb-1 hover:brightness-75",
            `${swapMode ? (isSwapOrigin ? "" : "brightness-75") : ""}`,
          )}
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
              <div className="truncate-text h-full overflow-hidden text-sm text-ellipsis">
                {activity.name}
              </div>
              {maxColumns <= 2 && (
                <div
                  className={`"flex space-x-1 ${activity.duration <= 1 ? "flex-col" : ""}"`}
                >
                  <ActivityBadge type={activity.type} />
                  <Badge variant="outline">{activity.activity}</Badge>
                </div>
              )}
            </div>
          </div>
          {swapMode && isSwapOrigin && (
            <div
              className="absolute pr-2 pb-1"
              style={{
                top: "0px",
                left: `${left}px`,
                width: `${width}px`,
                height: `${height}px`,
              }}
            >
              <div className="animated-border h-full rounded-sm p-0.5">
                <div className="hover:bg-secondary flex h-full w-full items-center justify-center opacity-0 hover:opacity-70">
                  <Button
                    onClick={() => onSwapActivity(activity)}
                    className="h-full w-full cursor-pointer"
                  >
                    Select
                  </Button>
                </div>
              </div>
            </div>
          )}
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
          onClick={() =>
            !swapMode && hasRemainingOptions && onSwapClicked(activity)
          }
          className={cn(
            "hover:bg-accent flex cursor-pointer items-center space-x-1 text-sm",
            {
              "cursor-not-allowed opacity-50": swapMode || !hasRemainingOptions,
            },
          )}
        >
          <ArrowLeftRight color="#4ca03b" size={14} /> <span>Swap</span>
        </div>
        <div
          onClick={() => !swapMode && onDeselectActivity(activity)}
          className={cn(
            "hover:bg-accent flex cursor-pointer items-center space-x-1 text-sm",
            { "cursor-not-allowed opacity-50": swapMode },
          )}
        >
          <CalendarX2 color="#a03b3b" size={14} />
          <span>Remove</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
