import { Fragment } from "react/jsx-runtime";
import { ActivityType } from "../../types/common";
import Activity from "../activity/Activity";

interface DropzoneProps {
  activities: ActivityType[];
  onChangeActivity: (
    oldActivity: ActivityType,
    newActivity: ActivityType,
  ) => void;
  onDeselectActivity: (activity: ActivityType) => void;
}

interface OverlapGroupType {
  groupId: string;
  columns: ActivityType[][];
}

/**
 * Checks if two activities overlap based on their start and end times.
 *
 * @param activity1Date - A tuple containing the start and end Date objects for the first activity.
 * @param activity2Date - A tuple containing the start and end Date objects for the second activity.
 * @returns A boolean indicating whether the two activities overlap.
 */
function isOverlap(
  activity1Date: [Date, Date],
  activity2Date: [Date, Date],
): boolean {
  const [startTime1, endTime1] = activity1Date;
  const [startTime2, endTime2] = activity2Date;

  if (startTime2 >= startTime1 && startTime2 < endTime1) {
    return true;
  }

  // if subject2 ends between duration of subject1
  if (endTime2 > startTime1 && endTime2 <= endTime1) {
    return true;
  }
  return false;
}

function getOverlapGroups(activities: ActivityType[]): OverlapGroupType[] {
  const groups: OverlapGroupType[] = [];

  // sort activities
  const sorted = [...activities].sort(
    (a, b) => a.startEndTime[0].getTime() - b.startEndTime[0].getTime(),
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
          isOverlap(ac.startEndTime, activity.startEndTime),
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
        if (isOverlap(activity.startEndTime, existedAc.startEndTime)) {
          return group;
        }
      }
    }
  }

  return undefined;
}

export default function Dropzone({
  activities,
  onChangeActivity,
  onDeselectActivity,
}: DropzoneProps): React.JSX.Element {
  const groups = getOverlapGroups(activities);
  console.log("groups", groups);

  return (
    <>
      {groups.map((group) => {
        // get position
        return (
          <Fragment key={group.groupId}>
            {group.columns.map((activities, colNumber) => {
              return (
                <Fragment key={colNumber}>
                  {activities.map((activity) => (
                    <Activity
                      key={activity.id}
                      activity={activity}
                      colNumber={colNumber}
                      maxColumns={group.columns.length}
                      onChangeActivity={onChangeActivity}
                      onDeselectActivity={onDeselectActivity}
                    />
                  ))}
                </Fragment>
              );
            })}
          </Fragment>
        );
      })}
    </>
  );
}
