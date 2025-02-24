import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { useState } from "react";
import { ActivityType, SubjectType } from "../types/common";
import ActivityOption from "./activityOption/ActivityOption";
import "./styles.css";

export interface SubjectProps {
  subject: SubjectType;
  onToggleActivity: (activity: ActivityType) => void;
  onDeSelectSubject: (subject: SubjectType) => void;
}

export default function Subject({
  subject,
  onToggleActivity,
  onDeSelectSubject,
}: SubjectProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);

  const activitiesCount = new Set(subject.activities.map((ac) => ac.activity))
    .size;

  return (
    <Card className="card gap-0 py-4">
      <CardHeader>
        <CardTitle className="flex">
          <div className="flex-1">{subject.name}</div>
          <Checkbox checked={subject.selected} />
        </CardTitle>
        <CardDescription>{subject.code}</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex w-full cursor-pointer">
            <div
              className="flex-1 text-left"
              onClick={(prev) => setExpanded(!prev)}
            >
              <span className="px-2 py-1 text-sm">
                Activities ({activitiesCount})
              </span>
            </div>
            <div>
              {expanded ? (
                <ChevronsUp className="cursor-pointer" />
              ) : (
                <ChevronsDown className="cursor-pointer" />
              )}
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="CollapsibleContent border-secondary mt-2 max-h-60 overflow-y-auto border py-2 pl-2">
            {subject.activities.map((activity) => {
              return (
                <ActivityOption
                  key={activity.id}
                  activity={activity}
                  onToggleActivity={onToggleActivity}
                />
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
