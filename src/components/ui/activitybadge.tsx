import React from "react";
import { Badge } from "./badge";

function getActivityTypeColor(type: string): string {
  if (type.includes("Lec")) {
    return "bg-[var(--type-lec)]";
  }
  if (type.includes("Cmp")) {
    return "bg-[var(--type-cmp)]";
  }
  if (type.includes("Wrk")) {
    return "bg-[var(--type-wrk)]";
  }
  if (type.includes("Tut")) {
    return "bg-[var(--type-tut)]";
  }
  if (type.includes("Olr")) {
    return "bg-[var(--type-olr)]";
  }
  if (type.includes("Lab")) {
    return "bg-[var(--type-lab)]";
  }
  return "bg-[#FFFFFF]";
}

interface ActivityBadgeProps {
  type: string;
}

export default function ActivityBadge({
  type,
}: ActivityBadgeProps): React.JSX.Element {
  return (
    <Badge className={getActivityTypeColor(type)} variant="outline">
      {type}
    </Badge>
  );
}
