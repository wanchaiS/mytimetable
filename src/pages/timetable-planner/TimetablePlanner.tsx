import TimetableProvider from "./contexts/TimetableProvider";
import Timetable from "./timetable/Timetable";

export default function TimetablePlanner() {
  return (
    <TimetableProvider>
      <Timetable />
    </TimetableProvider>
  );
}
