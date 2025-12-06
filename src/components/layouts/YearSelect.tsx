import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableYears } from "@/pages/timetable-planner/utils/yearHelpers";

interface YearSelectProps {
  year: number;
  setYear: (year: number) => void;
}

export default function YearSelect({ year, setYear }: YearSelectProps) {
  const availableYears = getAvailableYears();

  return (
    <Select
      value={year.toString()}
      onValueChange={(value) => setYear(parseInt(value, 10))}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent>
        {availableYears.map((yearOption) => (
          <SelectItem key={yearOption} value={yearOption.toString()}>
            {yearOption}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
