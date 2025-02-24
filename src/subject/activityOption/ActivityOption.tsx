import { DAY_ABBREVIATIONS } from "@/calendar/constants";
import ActivityBadge from "@/components/ui/activitybadge";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ActivityType, Day } from "@/types/common";

interface ActivityOptionProps {
  activity: ActivityType;
  onToggleActivity: (activity: ActivityType) => void;
}

function getDayShort(long: Day | undefined): string | undefined {
  return Object.keys(DAY_ABBREVIATIONS).find(
    (key) => DAY_ABBREVIATIONS[key] === long,
  );
}

export default function ActivityOption({
  activity,
  onToggleActivity,
}: ActivityOptionProps): React.JSX.Element {
  return (
    <div
      onClick={() => onToggleActivity(activity)}
      className="border-secondary flex cursor-pointer border-b p-2"
    >
      <div className="flex flex-1 items-center space-x-2 text-sm">
        <ActivityBadge type={activity.type} />
        <Badge variant="outline">{activity.activity}</Badge>
        <Badge variant="outline">{getDayShort(activity.day)}</Badge>
      </div>
      <Checkbox className="cursor-pointer" checked={activity.selected} />
    </div>
  );
}
