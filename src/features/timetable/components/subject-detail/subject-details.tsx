import { WEEK_DAYS } from "@/constants";
import { ActivityType, SubjectType } from "@/hooks/useSearchSubjects";
import { isActivityOverlap } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trash2 } from "lucide-react";

interface SubjectDetailsProps {
  subject: SubjectType;
  subjects: SubjectType[];
  onBack: (subjectCode: string | undefined) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onSelectActivity: (activity: ActivityType) => void;
}

export function SubjectDetails({
  subject,
  subjects,
  onBack,
  onRemoveSubject,
  onSelectActivity,
}: SubjectDetailsProps) {
  return (
    <div className="flex flex-col gap-2">
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
      {/* Activities */}
      {Object.keys(getGroupedActivitiesPerType(subject)).map((type) => (
        <div key={type}>
          <div className="text-sm font-semibold">{type}</div>
          <div className="flex flex-wrap gap-2">
            {getGroupedActivitiesPerType(subject)[type].map((activity) => (
              <div
                key={activity.id}
                onClick={() => onSelectActivity(activity)}
                className={cn(
                  "bg-muted/30 flex cursor-pointer items-center justify-between rounded-lg border p-1 hover:brightness-75",
                  activity.selected
                    ? "border-active bg-active/10"
                    : "border-(--border)",
                  checkConflict(activity, subjects).length > 0
                    ? "border-red-500"
                    : "",
                )}
              >
                <div>
                  <div className="text-muted-foreground text-xs">
                    <div className="flex justify-center font-semibold">
                      #{activity.activity} {activity.day}
                    </div>
                    <div>
                      {activity.start_time} -{" "}
                      {minsToTime(activity.end_time_mins)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getGroupedActivitiesPerType(subject: SubjectType): {
  [type: string]: ActivityType[];
} {
  const byType: { [type: string]: ActivityType[] } = {};
  subject.activities.forEach((activity) => {
    if (!byType[activity.type_desc]) byType[activity.type_desc] = [];
    byType[activity.type_desc].push(activity);
  });
  // order activities by day and start_time_mins
  Object.keys(byType).forEach((type) => {
    byType[type].sort((a, b) => {
      const dayDiff = WEEK_DAYS.indexOf(a.day) - WEEK_DAYS.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.start_time_mins - b.start_time_mins;
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

      if (isActivityOverlap(activity, ac)) {
        conflicts.push(ac);
      }
    }
  }
  return conflicts;
}
