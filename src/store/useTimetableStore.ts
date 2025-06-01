import { CalendarView } from "@/types";
import { create } from "zustand";

export type Semester = "Autumn" | "Spring";

const useTimetableStore = create<{
  calendarView: CalendarView;
  semester: Semester;
  setCalendarView: (calendarView: CalendarView) => void;
  setSemester: (semester: Semester) => void;
}>((set) => ({
  calendarView: getDefaultCalendarView(),
  semester: loadSemester(),
  setCalendarView: (calendarView) => set({ calendarView }),
  setSemester: (semester: Semester) => {
    set({ semester });
    localStorage.setItem("semester", semester);
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

function getDefaultCalendarView() {
  if (typeof window !== "undefined") {
    return window.innerWidth < 768 ? "weekdays" : "week";
  }
  // Fallback
  return "weekdays";
}

export default useTimetableStore;
