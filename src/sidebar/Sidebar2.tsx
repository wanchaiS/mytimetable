import { ActivityType, SubjectType } from "@/types/common";
import React from "react";

interface SidebarProps {
  subjects: SubjectType[];
  onToggleActivity: (activity: ActivityType) => void;
  onDeSelectSubject: (activity: SubjectType) => void;
  onSelectSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subject: SubjectType) => void;
}

export default function Sidebar({ subjects }: SidebarProps): React.JSX.Element {
  return (
    <div className="min-w-sm">
      <div className="p-10">Some panel</div>
      <div>
        {subjects.map((subject) => {
          return <div>{subject.name}</div>;
        })}
      </div>
    </div>
  );
}
