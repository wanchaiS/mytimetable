import { Button } from "@/components/ui/button";
import { ActivityType, SubjectType } from "@/hooks/useSearchSubjects";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Drawer } from "vaul";
import { CurrentSubjects } from "../components/current-subjects/current-subjects";
import { SubjectDetails } from "../components/subject-detail/subject-details";

const snapPoints = [0.5, 0.8];

interface SubjectsDrawerProps {
  subjects: SubjectType[];
  maxCredit: number;
  activeSubjectCode: string | undefined;
  setActiveSubjectCode: (subjectCode: string | undefined) => void;
  onSearchSubjects: (open: boolean) => void;
  onSelectActivity: (activity: ActivityType) => void;
  onRemoveSubject: (subjectCode: string) => void;
  onClose: () => void;
}

export default function SubjectsDrawer({
  subjects,
  maxCredit,
  activeSubjectCode,
  setActiveSubjectCode,
  onSearchSubjects,
  onSelectActivity,
  onRemoveSubject,
  onClose,
}: SubjectsDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0]);

  const activeSubject = subjects.find(
    (s) => s.callista_code === activeSubjectCode,
  );

  return (
    <Drawer.Root
      open={true}
      modal={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <Drawer.Overlay className="fixed inset-0 bg-black/40" />
      <Drawer.Portal>
        <Drawer.Content
          data-testid="content"
          className="border-b-none fixed right-0 bottom-0 left-0 mx-[-1px] flex h-full max-h-[97%] flex-col rounded-t-[10px] border border-gray-200 bg-white shadow-2xl"
        >
          <>
            <Button
              onClick={onClose}
              className="fixed top-0 left-1/2 z-50 flex h-4 w-18 -translate-x-1/2 items-center justify-center rounded-b-full bg-blue-500 px-6 py-2 text-white shadow-lg md:hidden"
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <div className="flex w-full flex-col px-4 pt-6 pb-2">
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
