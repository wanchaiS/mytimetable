import { ActivityType, SubjectType } from "@/hooks/useSearchSubjects";
import { cn } from "@/lib/utils";
import { CurrentSubjects } from "../components/current-subjects/current-subjects";
import { SubjectDetails } from "../components/subject-detail/subject-details";

interface SubjectsSidebarProps {
  subjects: SubjectType[];
  maxCredit: number;
  activeSubjectCode: string | undefined;
  setActiveSubjectCode: (subjectCode: string | undefined) => void;
  onSearchSubjects: (open: boolean) => void;
  onSelectActivity: (activity: ActivityType) => void;
  onRemoveSubject: (subjectCode: string) => void;
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
