import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useTimetableStore from "@/store/useTimetableStore";
import { Sparkles } from "lucide-react";

function CalendarPanel({
  setShowPreferenceSettings,
}: {
  setShowPreferenceSettings: (show: boolean) => void;
}) {
  const { calendarView, setCalendarView } = useTimetableStore();
  return (
    <div className="flex items-center border-b border-(--border) p-3">
      <Select value={calendarView} onValueChange={setCalendarView}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weekdays">Weekdays</SelectItem>
          <SelectItem value="week">Week</SelectItem>
        </SelectContent>
      </Select>

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
