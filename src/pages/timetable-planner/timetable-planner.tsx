import TimetableProvider from "@/contexts/timetable/timetable-provider";
import Timetable from "@/features/timetable/timetable";

export default function Main() {
  return (
    <TimetableProvider>
      <Timetable />
    </TimetableProvider>
  );
}
