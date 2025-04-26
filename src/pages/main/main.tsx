import DashboardProvider from "@/contexts/dashboard/dashboard-provider";
import Calendar from "@/features/calendar/calendar";
import SubjectsPane from "@/features/subjects-pane/subjects-pane";

export default function Main() {
  return (
    <DashboardProvider>
      <div className="flex h-full">
        <SubjectsPane />
        <Calendar />
      </div>
    </DashboardProvider>
  );
}
