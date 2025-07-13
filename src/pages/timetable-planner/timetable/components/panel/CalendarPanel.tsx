import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/useIsMobile";
import useTimetableStore from "@/pages/timetable-planner/store/useTimetableStore";
import { CalendarX, Sparkles } from "lucide-react";

function CalendarPanel({
  setShowPreferenceSettings,
  setShowTimeReserver,
}: {
  setShowPreferenceSettings: (show: boolean) => void;
  setShowTimeReserver: (show: boolean) => void;
}) {
  const { calendarView, setCalendarView } = useTimetableStore();
  const isMobile = useIsMobile();
  return (
    <div className="flex items-center border-b border-(--border) p-3">
      <div className="flex items-center gap-2">
        <Select value={calendarView} onValueChange={setCalendarView}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekdays">Weekdays</SelectItem>
            <SelectItem value="week">Week</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={() => setShowTimeReserver(true)}>
          <CalendarX className="h-4 w-4" />
          Reserve {!isMobile && "Time"}
        </Button>
      </div>

      <Button
        className="ml-auto"
        onClick={() => setShowPreferenceSettings(true)}
      >
        <Sparkles className="h-4 w-4" />
        Suggest
      </Button>
    </div>
  );
}

export default CalendarPanel;
