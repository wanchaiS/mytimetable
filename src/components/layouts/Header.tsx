import { SidebarTrigger } from "../ui/sidebar";

export default function Header() {
  return (
    <header className="flex h-15 items-center border-b border-(--border) bg-(--background) pr-10 pl-5">
      <SidebarTrigger />

      <div className="ml-8 text-3xl font-bold text-(--primary)">
        Timetable<span className="text-blue-500">X</span>
      </div>
    </header>
  );
}
