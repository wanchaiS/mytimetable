import { cn } from "@/lib/utils";
import React from "react";
import { Badge } from "./badge";

export function getPeriod(time: Date): string {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const adjustedHours = hours % 12 || 12;
  return `${adjustedHours}:${minutes < 10 ? `0${minutes}` : minutes} ${period}`;
}

interface TimeBadgeProps {
  startTime: Date;
  selected?: boolean;
}

export default function TimeBadge({
  startTime,
  selected,
}: TimeBadgeProps): React.JSX.Element {
  return (
    <Badge
      className={cn("w-[73px]", selected ? "bg-lime-500" : "")}
      variant="outline"
    >
      {getPeriod(startTime)}
    </Badge>
  );
}
