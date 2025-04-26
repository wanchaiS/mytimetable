import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { ActivityType } from "@/hooks/useSubjects";
import { minsToAMPM } from "@/lib/dateHelpers";
import { cn } from "@/lib/utils";
import { ChevronRight, X } from "lucide-react";
import React, { use } from "react";
import SearchSubjects from "./search-subjects/search-subjects";

export default function SubjectsPane(): React.JSX.Element {
  const {
    swapping,
    subjects,
    semester,
    suggestionsController,
    onRemoveSubject,
    onSwapClicked,
    onSelectActivityByType,
    onChangeSemester,
  } = use(DashboardContext);
  const semSubjects = subjects.filter((s) => s.semester === semester);

  return (
    <Sidebar className="top-(--header-height) !h-[calc(100svh-var(--header-height))] border-(--border)">
      {/**Header section suggestions */}
      <SidebarHeader className="border-b border-(--border) px-4 py-4">
        <div className="flex space-x-2">
          <Label className="text-md font-bold">Semester</Label>
          <Select
            value={semester}
            onValueChange={(sem) => onChangeSemester(sem)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Autumn">Autumn</SelectItem>
                <SelectItem value="Spring">Spring</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between">
          <Label className="text-md font-bold"> Subjects</Label>
          {/** Add subjects */}
          <SearchSubjects />
        </div>
      </SidebarHeader>

      {/** Body */}
      <SidebarContent className="p-4">
        {semSubjects.map((subject) => (
          <Collapsible key={subject.code} className="group/subject">
            <Card
              style={{ borderColor: subject.color }}
              className={cn(
                "gap-3 border border-l-10 py-2 pl-2",
                suggestionsController.allSuggestedBySem.length > 0 &&
                  !subject.activities.some((ac) => ac.selected)
                  ? "bg-(--muted-foreground)"
                  : "",
              )}
            >
              <CardHeader className="p-2">
                <div className="flex items-center">
                  <div className="flex-1 text-sm">{subject.callista_code}</div>
                  <X
                    size={18}
                    color="var(--destructive)"
                    className="invisible ml-auto cursor-pointer group-hover/subject:visible"
                    onClick={() => onRemoveSubject(subject.code)}
                  />
                </div>

                <div className="flex">
                  <div className="flex-1 text-xs">{subject.name}</div>

                  <CollapsibleTrigger asChild>
                    <ChevronRight className="mt-[-4px] cursor-pointer transition-transform duration-200 group-data-[state=open]/subject:rotate-90" />
                  </CollapsibleTrigger>
                </div>
              </CardHeader>
              <CollapsibleContent className="space-y-2 pr-4 pl-2">
                {getActivityTypes(subject.activities).map((activityType) => {
                  const selectedActivity = subject.activities.find(
                    (a) => a.type === activityType.type && a.selected,
                  );

                  return (
                    <div
                      key={activityType.type}
                      className="flex justify-between bg-(--card-activity) p-2 text-sm"
                    >
                      <div title={activityType.type_desc}>
                        {activityType.type}
                      </div>
                      {selectedActivity ? (
                        <div>{getStartEndTimeFormatted(selectedActivity)}</div>
                      ) : (
                        <div>{""}</div>
                      )}
                      {selectedActivity ? (
                        <Button
                          size={"sm"}
                          disabled={
                            swapping ||
                            subject.activities.filter(
                              (a) => a.type === activityType.type,
                            ).length < 2
                          }
                          variant="ghost"
                          className="h-fit cursor-pointer"
                          onClick={() => onSwapClicked(selectedActivity)}
                        >
                          Change
                        </Button>
                      ) : (
                        <Button
                          size={"sm"}
                          disabled={swapping}
                          variant="ghost"
                          className="h-fit cursor-pointer"
                          onClick={() =>
                            onSelectActivityByType(
                              `${subject.code}|${activityType.type}`,
                            )
                          }
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  );
                })}
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}

type ActivityCode = { type: string; type_desc: string };
function getActivityTypes(activities: ActivityType[]): ActivityCode[] {
  const result: ActivityCode[] = [];
  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    if (result.find((r) => r.type === activity.type)) {
      continue;
    }
    result.push({ type: activity.type, type_desc: activity.type_desc });
  }
  return result;
}

function getStartEndTimeFormatted(activity: ActivityType): string {
  const start = minsToAMPM(activity.start_time_mins);
  const end = minsToAMPM(activity.end_time_mins);
  if (start === null || end === null) {
    return "Invalid date";
  }
  return `${start} - ${end}`;
}
