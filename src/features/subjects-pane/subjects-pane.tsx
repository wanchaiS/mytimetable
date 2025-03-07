import ActivityBadge from "@/components/ui/activitybadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DayBadge from "@/components/ui/daybadge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import TimeBadge from "@/components/ui/timebadge";
import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { ActivityType, Day, Preference, Semester } from "@/types";
import {
  ArrowBigLeft,
  ArrowBigRight,
  ChevronRight,
  CirclePlus,
  Filter,
  Sparkles,
  Trash2,
} from "lucide-react";
import React, { use, useState } from "react";

type SidePaneSubjectType = {
  code: string;
  name: string;
  activitiesByType: ActivityByTypeType;
};

type ActivityByTypeType = {
  [type: string]: ActivityType[];
};

// function groupSubjects(subjects: SubjectType[]): SidePaneSubjectType[] {
//   const result: SidePaneSubjectType[] = [];
//   for (let i = 0; i < subjects.length; i++) {
//     const subject = subjects[i];
//     result.push({
//       code: subject.code,
//       name: subject.name,
//       activitiesByType: groupAcByType(subject.activities),
//     });
//   }
//   return result;
// }

// function groupAcByType(activities: ActivityType[]): ActivityByTypeType {
//   return activities.reduce(
//     (acc: ActivityByTypeType, cur: ActivityType): ActivityByTypeType => {
//       if (acc[cur.type] !== undefined) {
//         acc[cur.type].push(cur);
//       } else {
//         acc[cur.type] = [cur];
//       }
//       return acc;
//     },
//     {},
//   );
// }

export default function SubjectsPane(): React.JSX.Element {
  const [filterDays, setFilterDays] = useState<Day[]>([]);
  const {
    subjects,
    suggestions,
    preference,
    semester,
    onToggleActivity,
    onSuggest,
    onNextSuggest,
    onPrevSuggest,
    onRemoveSubject,
    onSetPreference,
    onChangeSemester,
  } = use(DashboardContext);
  const semSubjects = subjects.filter((s) => s.semester === semester);
  const searchedSubjects =
    filterDays.length > 0
      ? semSubjects
          .map((sub) => ({
            ...sub,
            activities: sub.activities.filter(
              (ac) => ac.day && filterDays.includes(ac.day),
            ),
          }))
          .filter((sub) => sub.activities.length > 0)
      : semSubjects;
  // const groupedSubjects = groupSubjects(searchedSubjects);
  return (
    <Sidebar className="top-[40px]">
      <SidebarHeader>
        <div className="flex items-center space-x-2">
          <RadioGroup
            value={preference}
            onValueChange={(value: Preference) => onSetPreference(value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Late" />
              <Label>Late</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Morning" />
              <Label>Morning</Label>
            </div>
          </RadioGroup>
          <Button className="ml-4" variant="outline" onClick={onSuggest}>
            <Sparkles /> <span>Suggest</span>
          </Button>
          <div>
            Suggestion:{" "}
            {suggestions.all[semester].length > 0
              ? suggestions.currentSuggestionIdx + 1
              : 0}
            /{suggestions.all[semester].length}
          </div>
        </div>

        <Button onClick={onPrevSuggest} disabled={!suggestions.hasPrev}>
          <ArrowBigLeft /> <span>Prev</span>
        </Button>
        <Button onClick={onNextSuggest} disabled={!suggestions.hasNext}>
          <ArrowBigRight /> <span>Next</span>
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="border-t-1">
          <div className="flex items-center">
            <SidebarGroupLabel className="flex-1">Subjects</SidebarGroupLabel>
            <Select
              value={semester}
              onValueChange={(sem: Semester) => onChangeSemester(sem)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Autumn">Autumn</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button className="mr-2" variant="outline" size="icon">
              <Filter size={16} />
            </Button>
            <Button variant="outline" size="icon">
              <CirclePlus fill="#84cc16" size={16} />
            </Button>
          </div>
          <SidebarMenu>
            {searchedSubjects.map((subject) => (
              <Collapsible key={subject.code} className="group/subject">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={subject.name} className="">
                      <ChevronRight className="transition-transform duration-200 group-data-[state=open]/subject:rotate-90" />
                      <span className="truncate" title={subject.name}>
                        {subject.name}
                      </span>
                      <Trash2
                        color="#ef4444"
                        className="invisible ml-auto group-hover/subject:visible"
                        onClick={() => onRemoveSubject(subject.code)}
                      />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="mr-0 pr-0">
                      {subject.activities.map((activity) => (
                        <SidebarMenuSubItem key={activity.id}>
                          <SidebarMenuSubButton
                            className="cursor-pointer"
                            onClick={() => onToggleActivity(activity)}
                          >
                            <ActivityBadge type={activity.type} />
                            <Badge
                              variant="outline"
                              className={activity.selected ? "bg-lime-500" : ""}
                            >
                              {activity.activity}
                            </Badge>
                            <DayBadge
                              day={activity.day}
                              selected={activity.selected}
                            />
                            <TimeBadge
                              selected={activity.selected}
                              startTime={activity.startEndTime[0]}
                            />
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
