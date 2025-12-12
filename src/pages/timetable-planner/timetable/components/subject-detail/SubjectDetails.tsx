import { cn } from "@/lib/utils";
import { WEEK_DAYS } from "@/pages/timetable-planner/constants";
import {
  ActivityType,
  SubjectType,
} from "@/pages/timetable-planner/hooks/useSearchSubjects";
import { isTimeOverlap } from "@/pages/timetable-planner/utils/dateHelpers";
import { ArrowLeft, ChevronRight, Trash2 } from "lucide-react";
import { useState } from "react";

interface SubjectDetailsProps {
  subject: SubjectType;
  subjects: SubjectType[];
  onBack: (subjectCode: string | undefined) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onSelectActivity: (activity: ActivityType) => void;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  startTimeMins: number;
  endTimeMins: number;
  activities: ActivityType[];
}

export function SubjectDetails({
  subject,
  subjects,
  onBack,
  onRemoveSubject,
  onSelectActivity,
}: SubjectDetailsProps) {
  const [drilldownSlot, setDrilldownSlot] = useState<{
    type: string;
    slot: TimeSlot;
  } | null>(null);

  const handleActivitySelect = (activity: ActivityType) => {
    onSelectActivity(activity);
    setDrilldownSlot(null);
  };

  const groupedActivities = getGroupedActivitiesPerType(subject);

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeft
            className="h-4 w-4 cursor-pointer"
            onClick={() => onBack(undefined)}
          />
          <div className="flex flex-col">
            <div className="text-sm font-semibold">{subject.name}</div>
            <div className="text-muted-foreground text-xs">
              {subject.credit} Credits
            </div>
          </div>
        </div>
        <Trash2
          className="h-4 w-4 cursor-pointer text-red-500"
          onClick={() => onRemoveSubject(subject.callista_code)}
        />
      </div>

      {/* Activity type sections */}
      {Object.keys(groupedActivities).map((type) => {
        const timeSlots = getTimeSlots(groupedActivities[type]);
        const isDrilledDown = drilldownSlot?.type === type;

        return (
          <div key={type}>
            {/* Breadcrumb header */}
            <div className="mb-2 flex items-center gap-2 text-sm">
              <span
                className={cn(
                  "font-semibold",
                  isDrilledDown &&
                    "hover:text-muted-foreground cursor-pointer transition-colors",
                )}
                onClick={() => isDrilledDown && setDrilldownSlot(null)}
              >
                {type}
              </span>
              {isDrilledDown && (
                <>
                  <span className="">
                    <ChevronRight className="h-4 w-4" />
                  </span>
                  <span className="font-semibold">
                    {drilldownSlot.slot.day} {drilldownSlot.slot.startTime} -{" "}
                    {drilldownSlot.slot.endTime}
                  </span>
                </>
              )}
            </div>

            {/* Section body - with animation */}
            <div
              key={isDrilledDown ? `${type}-drilldown` : `${type}-main`}
              className="animate-in fade-in slide-in-from-right-2 flex flex-wrap gap-2 duration-200"
            >
              {isDrilledDown
                ? // Drill-down view: Show all activities for this time slot with SAME badge style
                  drilldownSlot.slot.activities.map((activity) => {
                    const hasConflict =
                      checkConflict(activity, subjects).length > 0;

                    return (
                      <div
                        key={activity.id}
                        onClick={() => handleActivitySelect(activity)}
                        className={cn(
                          "bg-muted/30 flex cursor-pointer items-center justify-between rounded-lg border p-1 hover:brightness-75",
                          activity.selected && "border-active bg-active/10",
                          hasConflict && "border-red-500",
                        )}
                      >
                        <div className="text-muted-foreground text-xs">
                          <div className="flex justify-center font-semibold">
                            #{activity.activity} {activity.day}
                          </div>
                          <div>
                            {activity.startTime} -{" "}
                            {minsToTime(activity.endTimeMins)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                : // Main view: Show grouped time slots
                  timeSlots.map((slot) => {
                    const slotId = `${type}-${slot.day}-${slot.startTime}`;
                    const isMulti = slot.activities.length > 1;
                    const singleActivity = !isMulti ? slot.activities[0] : null;
                    const hasConflict = singleActivity
                      ? checkConflict(singleActivity, subjects).length > 0
                      : false;

                    return (
                      <div
                        key={slotId}
                        onClick={() => {
                          if (isMulti) {
                            setDrilldownSlot({ type, slot });
                          } else if (singleActivity) {
                            onSelectActivity(singleActivity);
                          }
                        }}
                        className={cn(
                          "bg-muted/30 flex cursor-pointer items-center justify-between rounded-lg border p-1 hover:brightness-75",
                          !isMulti &&
                            singleActivity?.selected &&
                            "border-active bg-active/10",
                          !isMulti && hasConflict && "border-red-500",
                        )}
                      >
                        <div className="text-muted-foreground text-xs">
                          <div className="flex justify-center font-semibold">
                            {isMulti
                              ? `(${slot.activities.length})`
                              : `#${singleActivity?.activity}`}{" "}
                            {slot.day}
                          </div>
                          <div>
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getGroupedActivitiesPerType(subject: SubjectType): {
  [type: string]: ActivityType[];
} {
  const byType: { [type: string]: ActivityType[] } = {};
  subject.activities.forEach((activity) => {
    if (!byType[activity.typeDesc]) byType[activity.typeDesc] = [];
    byType[activity.typeDesc].push(activity);
  });
  // order activities by day and start_time_mins
  Object.keys(byType).forEach((type) => {
    byType[type].sort((a, b) => {
      const dayDiff = WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.startTimeMins - b.startTimeMins;
    });
  });
  return byType;
}

function minsToTime(mins: number | undefined) {
  if (!mins) return "";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

// Group activities by time slot
function getTimeSlots(activities: ActivityType[]): TimeSlot[] {
  const slotsMap = new Map<string, TimeSlot>();

  activities.forEach((activity) => {
    const slotKey = `${activity.day}-${activity.startTime}-${activity.endTimeMins}`;

    if (!slotsMap.has(slotKey)) {
      slotsMap.set(slotKey, {
        day: activity.day,
        startTime: activity.startTime,
        endTime: minsToTime(activity.endTimeMins),
        startTimeMins: activity.startTimeMins,
        endTimeMins: activity.endTimeMins,
        activities: [],
      });
    }

    slotsMap.get(slotKey)!.activities.push(activity);
  });

  return Array.from(slotsMap.values());
}

function checkConflict(
  activity: ActivityType,
  subjects: SubjectType[],
): ActivityType[] {
  const conflicts: ActivityType[] = [];
  for (const subject of subjects) {
    for (const ac of subject.activities) {
      if (ac.id === activity.id) continue;
      if (ac.code === activity.code) continue;
      if (!ac.selected) continue;
      if (ac.day !== activity.day) continue;

      if (
        isTimeOverlap(
          ac.startTimeMins,
          ac.endTimeMins,
          activity.startTimeMins,
          activity.endTimeMins,
        )
      ) {
        conflicts.push(ac);
      }
    }
  }
  return conflicts;
}
