import { ContactUs } from "@/components/contact-us/ContactUs";
import useTimetableStore from "@/pages/timetable-planner/store/useTimetableStore";
import YearSelect from "./YearSelect";

export default function Header() {
  const { year, setYear } = useTimetableStore();

  return (
    <header className="flex h-15 items-center justify-between border-b border-(--border) bg-(--background) px-4">
      <div className="flex items-center gap-3">
        {/* <Button variant="ghost" size="icon">
          <Menu />
        </Button> */}
        <div className="ml-2 text-2xl font-bold text-(--primary)">
          Timetable<span className="text-blue-500">X</span>
        </div>
        <YearSelect year={year} setYear={setYear} />
      </div>
      <ContactUs />
      {/* <UserProfile onLogout={handleLogout} /> */}
    </header>
  );
}
