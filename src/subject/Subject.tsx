import { AppContext } from "@/App";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CircleX,
} from "lucide-react";
import { use, useState } from "react";
import { ActivityType, SubjectType } from "../types/common";
import ActivityOption from "./activityOption/ActivityOption";
import "./styles.css";

export interface SubjectProps {
  subject: SubjectType;
  onToggleActivity: (activity: ActivityType) => void;
  onDeSelectSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subject: SubjectType) => void;
  onSelectSubject: (subject: SubjectType) => void;
}

export default function Subject({
  subject,
  onToggleActivity,
  onDeSelectSubject,
  onRemoveSubject,
  onSelectSubject,
}: SubjectProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const { selectMode } = use(AppContext);

  const activitiesCount = new Set(subject.activities.map((ac) => ac.activity))
    .size;

  return (
    <Card className="group hover:bg-accent relative gap-0 py-4 hover:scale-[1.02]">
      {!selectMode && (
        <CircleX
          onClick={() => onRemoveSubject(subject)}
          fill="#ee3e2b"
          color="#fff"
          strokeWidth={1}
          className="absolute -top-2 -right-2 cursor-pointer opacity-0 group-hover:opacity-100"
        />
      )}
      <CardHeader>
        <CardTitle className="flex">
          <div className="flex-1">{subject.name}</div>
          {subject.fullyEnrolled ? (
            <ArrowLeft
              onClick={() => onDeSelectSubject(subject)}
              color="#ee3e2b"
              className={`cursor-pointer ${selectMode ? "pointer-events-none opacity-50" : ""}`}
            />
          ) : (
            <ArrowRight
              onClick={() => onSelectSubject(subject)}
              color="#4ca03b"
              className={`cursor-pointer ${selectMode ? "pointer-events-none opacity-50" : ""}`}
            />
          )}
        </CardTitle>
        <CardDescription>{subject.code}</CardDescription>
      </CardHeader>
      <CardContent>
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex w-full cursor-pointer">
            <div>
              {expanded ? (
                <ChevronUp
                  className={`cursor-pointer ${selectMode ? "pointer-events-none opacity-50" : ""}`}
                />
              ) : (
                <ChevronDown
                  className={`cursor-pointer ${selectMode ? "pointer-events-none opacity-50" : ""}`}
                />
              )}
            </div>
            <div
              className={`flex-1 text-left ${selectMode ? "pointer-events-none opacity-50" : ""}`}
              onClick={(prev) => setExpanded(!prev)}
            >
              <span className="px-2 py-1 text-sm">
                Activities ({activitiesCount})
              </span>
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
