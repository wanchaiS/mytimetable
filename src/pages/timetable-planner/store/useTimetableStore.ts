import { CalendarView } from "@/pages/timetable-planner/types";
import { create } from "zustand";

export type Semester = "Autumn" | "Spring";

const useTimetableStore = create<{
  calendarView: CalendarView;
  semester: Semester;
  year: number;
  setCalendarView: (calendarView: CalendarView) => void;
  setSemester: (semester: Semester) => void;
  setYear: (year: number) => void;
}>((set) => ({
  calendarView: getDefaultCalendarView(),
  semester: loadSemester(),
  year: loadYear(),
  setCalendarView: (calendarView) => set({ calendarView }),
  setSemester: (semester: Semester) => {
    set({ semester });
    localStorage.setItem("semester", semester);
  },
  setYear: (year: number) => {
    set({ year });
    localStorage.setItem("year", year.toString());
  },
}));

// load semester from session storage
function loadSemester(): Semester {
  const semester = localStorage.getItem("semester");
  if (semester) {
    return semester as Semester;
  }
  localStorage.setItem("semester", "Autumn");
  return "Autumn";
}

function loadYear(): number {
  const storedYear = localStorage.getItem("year");
  if (storedYear) {
    const parsedYear = parseInt(storedYear, 10);
    if (!isNaN(parsedYear)) {
      return parsedYear;
    }
  }
  const currentYear = new Date().getFullYear();
  localStorage.setItem("year", currentYear.toString());
  return currentYear;
}

function getDefaultCalendarView() {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768 ? "weekdays" : "week";
  }
  // Fallback
  return "weekdays";
}

export default useTimetableStore;
