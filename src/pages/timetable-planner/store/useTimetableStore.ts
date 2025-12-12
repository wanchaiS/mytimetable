import { CalendarView } from "@/pages/timetable-planner/types";
import { create } from "zustand";

const useTimetableStore = create<{
  calendarView: CalendarView;
  year: number;
  setCalendarView: (calendarView: CalendarView) => void;
  setYear: (year: number) => void;
}>((set) => ({
  calendarView: getDefaultCalendarView(),
  year: loadYear(),
  setCalendarView: (calendarView) => set({ calendarView }),
  setYear: (year: number) => {
    set({ year });
    localStorage.setItem("year", year.toString());
  },
}));

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
