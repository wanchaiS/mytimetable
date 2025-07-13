import {
  ActivityType,
  SubjectType,
} from "@/pages/timetable-planner/hooks/useSearchSubjects";
import { Drawer } from "vaul";
import { CurrentSubjects } from "../current-subjects/CurrentSubjects";
import { SubjectDetails } from "../subject-detail/SubjectDetails";

interface SubjectsDrawerProps {
  subjects: SubjectType[];
  isOpen: boolean;
  maxCredit: number;
  activeSubjectCode: string | undefined;
  setActiveSubjectCode: (subjectCode: string | undefined) => void;
  onSearchSubjects: (open: boolean) => void;
  onSelectActivity: (activity: ActivityType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onOpenChange: (open: boolean) => void;
}

export default function SubjectsDrawer({
  isOpen,
  subjects,
  maxCredit,
  activeSubjectCode,
  setActiveSubjectCode,
  onSearchSubjects,
  onSelectActivity,
  onRemoveSubject,
  onOpenChange,
}: SubjectsDrawerProps) {
  const activeSubject = subjects.find(
    (s) => s.callista_code === activeSubjectCode,
  );

  return (
    <Drawer.Root open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
      <Drawer.Portal>
        <Drawer.Content
          data-testid="content"
          className="border-b-none fixed right-0 bottom-0 left-0 mx-[-1px] flex h-full max-h-[50%] flex-col rounded-t-[10px] border border-gray-200 bg-white shadow-2xl"
        >
          <>
            <div className="flex h-full w-full flex-col px-4 pt-4 pb-2">
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
          </>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
