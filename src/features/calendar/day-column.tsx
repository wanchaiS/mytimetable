import { DashboardContext } from "@/contexts/dashboard/dashboard-context";
import { ActivityType, Day, SubjectType } from "@/hooks/useSubjects";
import { isActivityOverlap } from "@/lib/dateHelpers";
import { use } from "react";
import { Fragment } from "react/jsx-runtime";
import Activity from "./activity/activity";

interface DayColumnProps {
  day: Day;
}

interface ActivityClusterType {
  clusterId: string;
  members: ActivityType[][];
}

export default function DayColumn({ day }: DayColumnProps): React.JSX.Element {
  const { subjects, swappingActivity, swapping, selectingActivityTypeCode } =
    use(DashboardContext);
  const activities = getActivities(
    day,
    subjects,
    swapping,
    swappingActivity,
    selectingActivityTypeCode,
  );
  const activityClusters = getActivityClusters(activities);

  return (
    <>
      {activityClusters.map((activityCluster) => {
        return (
          <Fragment key={activityCluster.clusterId}>
            {activityCluster.members.map((member, colNumber) => {
              return (
                <Fragment key={member.map((m) => m.id).join("-")}>
                  {member.map((activity) => {
                    const availableActivities = subjects
                      .flatMap((sub) => sub.activities)
                      .filter((ac) => !ac.selected);
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
                        maxColumns={activityCluster.members.length}
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

function getActivities(
  day: Day,
  subjects: SubjectType[],
  swapping: boolean,
  swappingActivity: ActivityType | undefined,
  selectingActivityTypeCode: string | undefined,
) {
  let result: ActivityType[] = [];
  const flatActivities = subjects
    .flatMap((s) => s.activities)
    .filter((a) => a.day === day);
  // seleccted
  result = flatActivities.filter((a) => a.selected);

  if (swapping) {
    let options: ActivityType[] = [];
    if (swappingActivity) {
      options = flatActivities.filter(
        (a) =>
          a.code === swappingActivity.code &&
          a.type === swappingActivity.type &&
          !a.selected,
      );
    }
    if (selectingActivityTypeCode) {
      options = flatActivities.filter(
        (a) => a.codeType === selectingActivityTypeCode,
      );
    }
    result = [...result, ...options];
  }
  return result;
}

function getActivityClusters(
  activities: ActivityType[],
): ActivityClusterType[] {
  const clusters: ActivityClusterType[] = [];

  // sort activities
  const sorted = [...activities].sort(
    (a, b) => a.start_time_mins - b.start_time_mins,
  );

  for (let i = 0; i < sorted.length; i++) {
    const activity = sorted[i];

    const cluster = findCluster(clusters, activity);

    // found the cluster, assign to correct members
    if (cluster !== undefined) {
      let foundColumn = false;
      for (let i = 0; i < cluster.members.length; i++) {
        const column = cluster.members[i];
        const foundOverlap = column.some((ac) =>
          isActivityOverlap(ac, activity),
        );
        if (!foundOverlap) {
          column.push(activity);
          foundColumn = true;
          break;
        }
      }

      // create a new member if cannot match to any clusters
      if (!foundColumn) {
        const newMember: ActivityType[] = [activity];
        cluster.members.push(newMember);
      }
      cluster.clusterId = `${cluster.clusterId};${activity.id}`;
    }

    // create a new group
    else {
      const newGroup: ActivityClusterType = {
        clusterId: activity.id,
        members: [[activity]],
      };
      clusters.push(newGroup);
    }
  }

  return clusters;
}

function findCluster(
  clusters: ActivityClusterType[],
  activity: ActivityType,
): ActivityClusterType | undefined {
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    for (let j = 0; j < cluster.members.length; j++) {
      const column = cluster.members[j];
      for (let k = 0; k < column.length; k++) {
        const existedAc = column[k];
        if (isActivityOverlap(activity, existedAc)) {
          return cluster;
        }
      }
    }
  }

  return undefined;
}
