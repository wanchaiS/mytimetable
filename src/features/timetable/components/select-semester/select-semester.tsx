import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Semester } from "@/store/useTimetableStore";

interface SelectSemesterProps {
  semester: string;
  setSemester: (semester: Semester) => void;
}

export default function SelectSemester({
  semester,
  setSemester,
}: SelectSemesterProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={semester}
      onValueChange={setSemester}
    >
      <ToggleGroupItem value="Autumn" aria-label="Autumn">
        Autumn
      </ToggleGroupItem>
      <ToggleGroupItem value="Spring" aria-label="Spring">
        Spring
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
