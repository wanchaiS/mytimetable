import Subject from "../subject/Subject";
import { ActivityType, SubjectType } from "../types/common";

interface SidebarProps {
  subjects: SubjectType[];
  onToggleActivity: (activity: ActivityType) => void;
  onDeSelectSubject: (activity: SubjectType) => void;
  onSelectSubject: (subject: SubjectType) => void;
  onRemoveSubject: (subject: SubjectType) => void;
}

export default function Sidebar({
  subjects,
  onToggleActivity,
  onDeSelectSubject,
  onSelectSubject,
  onRemoveSubject,
}: SidebarProps): React.JSX.Element {
  return (
    <div className="border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 p-4">My Subjects</div>
      <div className="h-[calc(100vh-64px)] space-y-3 overflow-y-auto p-3">
        {subjects.map((subject) => (
          <Subject
            key={subject.code}
            subject={subject}
            onToggleActivity={onToggleActivity}
            onDeSelectSubject={onDeSelectSubject}
            onSelectSubject={onSelectSubject}
            onRemoveSubject={onRemoveSubject}
          />
        ))}
      </div>
    </div>
  );
}
