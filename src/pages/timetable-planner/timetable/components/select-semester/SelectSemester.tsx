import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TimetableContext } from "@/pages/timetable-planner/contexts/TimetableContext";
import { useContext } from "react";

export default function SelectSemester() {
  const { selectedSemester, onChangeSemester } = useContext(TimetableContext);
  const semesters = ["Autumn", "Spring"];

  return (
    <Select value={selectedSemester} onValueChange={onChangeSemester}>
      <SelectTrigger>
        <SelectValue defaultValue={semesters[0]} />
      </SelectTrigger>
      <SelectContent>
        {semesters.map((sem) => (
          <SelectItem key={sem} value={sem}>
            {sem}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
