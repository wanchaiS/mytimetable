import { DAY_ABBREVIATIONS } from "@/constants";
import { Day } from "@/hooks/useSearchSubjects";
import { cn } from "@/lib/utils";
import React from "react";
import { Badge } from "./badge";

function getShortDay(long: Day | undefined): string | undefined {
  return Object.keys(DAY_ABBREVIATIONS).find(
    (short) => DAY_ABBREVIATIONS[short] === long,
  );
}

interface DayBadgeProps {
  day: Day | undefined;
  selected?: boolean;
}

export default function DayBadge({
  day,
  selected,
}: DayBadgeProps): React.JSX.Element {
  return (
    <Badge
      className={cn("w-[44px]", selected ? "bg-lime-500" : "")}
      variant="outline"
    >
      {getShortDay(day)}
    </Badge>
  );
}
