import { ActivityType } from "@/pages/timetable-planner/hooks/useSearchSubjects";
import { isTimeOverlap } from "@/pages/timetable-planner/utils/dateHelpers";
import { Fragment } from "react/jsx-runtime";
import Activity from "../activity/Activity";

interface DayColumnProps {
  activities: ActivityType[];
  onClickActivity: (activity: ActivityType) => void;
}

interface ActivityClusterType {
  clusterId: string;
  members: ActivityType[][];
}

export default function DayColumn({
  activities,
  onClickActivity,
}: DayColumnProps): React.JSX.Element {
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
                    return (
                      <Activity
                        key={activity.id}
                        activity={activity}
                        colNumber={colNumber}
                        maxColumns={activityCluster.members.length}
                        onClick={() => onClickActivity(activity)}
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

function getActivityClusters(
  activities: ActivityType[],
): ActivityClusterType[] {
  const clusters: ActivityClusterType[] = [];

  // sort activities
  const sorted = [...activities].sort(
    (a, b) => a.startTimeMins - b.startTimeMins,
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
          isTimeOverlap(
            ac.startTimeMins,
            ac.endTimeMins,
            activity.startTimeMins,
            activity.endTimeMins,
          ),
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
        if (
          isTimeOverlap(
            activity.startTimeMins,
            activity.endTimeMins,
            existedAc.startTimeMins,
            existedAc.endTimeMins,
          )
        ) {
          return cluster;
        }
      }
    }
  }

  return undefined;
}
