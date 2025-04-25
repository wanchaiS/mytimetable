import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { ActivityType } from "@/hooks/useSubjects";
import { isActivityOverlap } from "@/lib/dateHelpers";
import { use } from "react";
import { Fragment } from "react/jsx-runtime";
import Activity from "./activity/activity";

interface DropzoneProps {
  activities: ActivityType[];
  swappingOptions: ActivityType[];
}

interface OverlapGroupType {
  groupId: string;
  columns: ActivityType[][];
}

function getOverlapGroups(activities: ActivityType[]): OverlapGroupType[] {
  const groups: OverlapGroupType[] = [];

  // sort activities
  const sorted = [...activities].sort(
    (a, b) => a.start_time_mins - b.start_time_mins,
  );

  for (let i = 0; i < sorted.length; i++) {
    const activity = sorted[i];

    const group = findGroup(groups, activity);

    // found the group, assign to correct column
    if (group !== undefined) {
      let foundColumn = false;
      for (let i = 0; i < group.columns.length; i++) {
        const column = group.columns[i];
        const foundOverlap = column.some((ac) =>
          isActivityOverlap(ac, activity),
        );
        if (!foundOverlap) {
          column.push(activity);
          foundColumn = true;
          break;
        }
      }

      // create a new column if cannot assign to any cols
      if (!foundColumn) {
        const newColumn: ActivityType[] = [activity];
        group.columns.push(newColumn);
      }
      group.groupId = `${group.groupId};${activity.id}`;
    }

    // create a new group
    else {
      const newGroup: OverlapGroupType = {
        groupId: activity.id,
        columns: [[activity]],
      };
      groups.push(newGroup);
    }
  }

  return groups;
}

function findGroup(
  groups: OverlapGroupType[],
  activity: ActivityType,
): OverlapGroupType | undefined {
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    for (let j = 0; j < group.columns.length; j++) {
      const column = group.columns[j];
      for (let k = 0; k < column.length; k++) {
        const existedAc = column[k];
        if (isActivityOverlap(activity, existedAc)) {
          return group;
        }
      }
    }
  }

  return undefined;
}

export default function Dropzone({
  activities,
  swappingOptions,
}: DropzoneProps): React.JSX.Element {
  const { subjects } = use(DashboardContext);
  const groups = getOverlapGroups([...activities, ...swappingOptions]);
  const tempActivities = [...swappingOptions];

  const availableActivities = subjects
    .flatMap((sub) => sub.activities)
    .filter((ac) => !ac.selected);
  return (
    <>
      {groups.map((group) => {
        // get position
        return (
          <Fragment key={group.groupId}>
            {group.columns.map((activities, colNumber) => {
              return (
                <Fragment key={colNumber}>
                  {activities.map((activity) => {
                    const isOption =
                      tempActivities.find((ha) => ha.id === activity.id) !==
                      undefined;
                    const hasRemainingOptions =
                      availableActivities.filter(
                        (ac) =>
                          ac.code === activity.code &&
                          ac.type === activity.type,
                      ).length > 0;

                    return (
                      <Activity
                        key={activity.id}
                        activity={activity}
                        colNumber={colNumber}
                        maxColumns={group.columns.length}
                        isOption={isOption}
                        hasRemainingOptions={hasRemainingOptions}
                      />
                    );
                  })}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}
