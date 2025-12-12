import { cn } from "@/lib/utils";
import {
  ActivityType,
  SubjectType,
} from "@/pages/timetable-planner/hooks/useSearchSubjects";
import { CurrentSubjects } from "../current-subjects/CurrentSubjects";
import { SubjectDetails } from "../subject-detail/SubjectDetails";

interface SubjectsSidebarProps {
  subjects: SubjectType[];
  maxCredit: number;
  activeSubjectCode: string | undefined;
  setActiveSubjectCode: (subjectCode: string | undefined) => void;
  onSearchSubjects: (open: boolean) => void;
  onSelectActivity: (activity: ActivityType) => void;
  onRemoveSubject: (subjectCode: string, semester: string) => void;
}

export default function SubjectsSidebar({
  subjects,
  maxCredit,
  activeSubjectCode,
  setActiveSubjectCode,
  onSearchSubjects,
  onSelectActivity,
  onRemoveSubject,
}: SubjectsSidebarProps) {
  const activeSubject = subjects.find(
    (s) => s.callista_code === activeSubjectCode,
  );

  return (
    <div
      className={cn(
        "h-full w-full border-l border-gray-200 bg-white shadow-xl",
      )}
    >
      <div className="flex h-full flex-col px-4 pt-6 pb-4">
        {activeSubject ? (
          <SubjectDetails
            subject={activeSubject}
            subjects={subjects}
            onBack={() => setActiveSubjectCode(undefined)}
            onRemoveSubject={onRemoveSubject}
            onSelectActivity={onSelectActivity}
          />
        ) : (
          <CurrentSubjects
            subjects={subjects}
            maxCredit={maxCredit}
            onClickSubject={setActiveSubjectCode}
            onSearchSubjects={onSearchSubjects}
            onRemoveSubject={onRemoveSubject}
          />
        )}
      </div>
    </div>
  );
}
