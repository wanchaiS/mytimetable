import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ActivityType, SubjectType } from "@/hooks/useSearchSubjects";
import useTimetableStore from "@/store/useTimetableStore";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import SelectSemester from "../select-semester/select-semester";

interface CurrentSubjectsProps {
  subjects: SubjectType[];
  maxCredit: number;
  onSearchSubjects: (open: boolean) => void;
  onClickSubject: (subjectCode: string | undefined) => void;
  onRemoveSubject: (subjectCode: string) => void;
}

export function CurrentSubjects({
  subjects,
  maxCredit,
  onSearchSubjects,
  onClickSubject,
  onRemoveSubject,
}: CurrentSubjectsProps) {
  const { semester, setSemester } = useTimetableStore();
  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-sm font-semibold">Current Subjects</div>
          <div className="text-muted-foreground text-xs">
            {subjects.reduce((acc, subject) => acc + subject.credit, 0)}/{" "}
            {maxCredit} Credits
          </div>
        </div>
        <SelectSemester semester={semester} setSemester={setSemester} />
        <Button
          variant="outline"
          size="icon"
          className="border-muted rounded-full bg-blue-500 text-white hover:bg-blue-600"
          onClick={() => onSearchSubjects(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {/* Subjects */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {subjects.map((subject) => (
          <div
            key={subject.code}
            onClick={() => onClickSubject(subject.callista_code)}
            className="flex min-w-20 shrink-0 cursor-pointer items-center gap-2 overflow-hidden rounded-sm border p-2 text-sm text-ellipsis whitespace-nowrap"
          >
            <div
              className="h-4 min-w-4"
              style={{ backgroundColor: `rgb(${subject.color})` }}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-center gap-2">
                <div className="truncate">
                  {subject.callista_code} {subject.name}
                </div>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                {getSelectedActivityPerType(subject).map((activityType) => (
                  <div key={activityType}>{activityType}</div>
                ))}
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <GripVertical className="text-muted-foreground h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-10 p-0">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveSubject(subject.callista_code);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        ))}
      </div>
    </>
  );
}

function getSelectedActivityPerType(subject: SubjectType): string[] {
  // Group activities by type
  const byType: { [type: string]: ActivityType[] } = {};
  subject.activities.forEach((activity) => {
    if (!byType[activity.type_desc]) byType[activity.type_desc] = [];
    byType[activity.type_desc].push(activity);
  });

  // For each type, find the selected activity and format the string
  return Object.entries(byType).map(([type, activities]) => {
    const selected = activities.find((a) => a.selected);
    if (selected) {
      return `${type} : #${selected.activity}`;
    }
    return `${type} : -`;
  });
}
