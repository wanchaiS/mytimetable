import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardProvider from "@/contexts/dashboard/dashboard-provider";
import Calendar from "@/features/calendar/calendar";
import SubjectsPane from "@/features/subjects-pane/subjects-pane";

export default function Main() {
  return (
    <DashboardProvider>
      <SidebarProvider>
        <SubjectsPane />
        <SidebarTrigger />

        <Calendar />
      </SidebarProvider>
    </DashboardProvider>
  );
}
