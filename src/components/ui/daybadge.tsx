import { DAY_ABBREVIATIONS } from "@/constants";
import { cn } from "@/lib/utils";
import { Day } from "@/types";
import React from "react";
import { Badge } from "./badge";

export function getShortDay(long: Day | undefined): string | undefined {
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
