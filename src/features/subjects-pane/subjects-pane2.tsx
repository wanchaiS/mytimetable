import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import React, { use } from "react";

export default function Sidebar(): React.JSX.Element {
  const { subjects } = use(DashboardContext);

  return (
    <div className="min-w-sm">
      <div className="p-10">Some panel</div>
      <div>
        {subjects.map((subject) => {
          return <div>{subject.name}</div>;
        })}
      </div>
    </div>
  );
}
