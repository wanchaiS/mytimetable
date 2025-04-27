import ActivityBadge from "@/components/ui/activitybadge";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@/components/ui/popover";
import { PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ArrowLeftRight, CalendarX2 } from "lucide-react";
import React, { use, useState } from "react";
import { cn } from "../../../lib/utils";

import AnimateBoarderContainer from "@/components/animateBorderContainer/AnimateBoarderContainer";
import { Button } from "@/components/ui/button";
import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { ActivityType } from "@/hooks/useSubjects";
import "./style.css";

interface ActivityProps {
  activity: ActivityType;
  maxColumns: number;
  colNumber: number;
  hasRemainingOptions: boolean;
}

function getHeight(activity: ActivityType): number {
  // get height from end time - start time
  const diffMinutes = activity.end_time_mins - activity.start_time_mins;
  const height = (diffMinutes / 30) * 64;
  return height;
}

function getTop(activity: ActivityType) {
  // get top position from "how far is it from the 8:00AM"
  const top = ((activity.start_time_mins - 480) / 30) * 64;
  return top;
}

function getWidth(intersectCount: number): number {
  if (intersectCount === 0) {
    return 180;
  }
  return 180 / intersectCount;
}

export default function Activity({
  activity,
  colNumber,
  maxColumns,
  hasRemainingOptions,
}: ActivityProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const {
    subjects,
    swappingActivity,
    swapping,
    onSwapActivity,
    onSwapClicked,
    onDeselectActivity,
    onSelectActivity,
  } = use(DashboardContext);

  const subject = subjects.find((s) => s.code === activity.code);
  const isSwapOrigin = swappingActivity?.id === activity.id;
  const isOption = !activity.selected;
  const isSwapping = swapping && swappingActivity;

  const height = getHeight(activity);
  const top = getTop(activity);
  const width = getWidth(maxColumns);
  const left = width * colNumber;

  if (isOption && swapping) {
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
            onClick={() =>
              isSwapping ? onSwapActivity(activity) : onSelectActivity(activity)
            }
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
    <Popover open={open && !swapping} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div
          className={cn(
            "absolute pr-2 pb-1 hover:brightness-75",
            `${swapping ? (isSwapOrigin ? "" : "brightness-75") : ""}`,
          )}
          style={{
            top: `${top}px`,
            left: `${left}px`,
            width: `${width}px`,
            height: `${height}px`,
          }}
        >
          <div
            style={{ borderColor: activity.color }}
            className="bg-background flex h-full rounded-sm border border-l-10 p-1"
          >
            <div className="flex w-full flex-col space-y-2">
              <div className="flex flex-1 flex-col">
                <div className="text-sm">{subject?.callista_code}</div>
                <div className="flex-1 text-xs">{subject?.name}</div>
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
          {swapping && isSwapOrigin && (
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
            !swapping && hasRemainingOptions && onSwapClicked(activity)
          }
          className={cn(
            "hover:bg-accent flex cursor-pointer items-center space-x-1 text-sm",
            {
              "cursor-not-allowed opacity-50": swapping || !hasRemainingOptions,
            },
          )}
        >
          <ArrowLeftRight color="#4ca03b" size={14} /> <span>Swap</span>
        </div>
        <div
          onClick={() => !swapping && onDeselectActivity(activity)}
          className={cn(
            "hover:bg-accent flex cursor-pointer items-center space-x-1 text-sm",
            { "cursor-not-allowed opacity-50": swapping },
          )}
        >
          <CalendarX2 color="#a03b3b" size={14} />
          <span>Remove</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
