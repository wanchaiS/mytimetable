import {
  ActivityType,
  SubjectType,
} from "@/pages/timetable-planner/hooks/useSearchSubjects";
import { Preference } from "@/pages/timetable-planner/types";
import { useCallback, useContext } from "react";
import { TimetableContext } from "../contexts/TimetableContext";
import { isActivityOverlap } from "../utils/dateHelpers";

type GroupedActivity = {
  [key: string]: ActivityType[];
};

export function useSuggestions() {
  const { subjects, onSelectActivities } = useContext(TimetableContext);

  const handleSuggest = useCallback(
    (preference: Preference) => {
      const suggestedActivities = suggest(subjects, preference);
      if (suggestedActivities.length === 0) {
        return;
      }

      onSelectActivities(suggestedActivities);
    },
    [onSelectActivities, subjects],
  );

  return { handleSuggest };
}

function suggest(
  subjects: SubjectType[],
  preference: Preference,
): ActivityType[] {
  const groupedActivities = groupByActivityType(subjects);

  // build all possible activity combinations
  const activityCombinations = buildActivityCombinations(
    Object.entries(groupedActivities),
    0,
  );

  // find the lowest point which is the best combination
  const bestCombination = activityCombinations.reduce((best, current) => {
    const bestScore = calculateScore(best, preference);
    const currentScore = calculateScore(current, preference);
    return bestScore < currentScore ? best : current;
  }, activityCombinations[0]);

  return bestCombination;
}

function calculateScore(
  combination: ActivityType[],
  preference: Preference,
): number {
  // Point based system

  const activeDays = [...new Set(combination.map((ac) => ac.day))].filter(
    (d) => d !== undefined,
  );
  const totalGapMinutes = calculateGap(activeDays, combination);

  if (preference === "Compact") {
    const activeDaysPoints = activeDays.length * 1000;
    const gapPoints = totalGapMinutes * 100;
    return activeDaysPoints + gapPoints;
  }

  if (preference === "Relaxed") {
    const activeDaysPoints = activeDays.length * -1000;
    const gapPoints = totalGapMinutes * -100;
    return activeDaysPoints + gapPoints;
  }

  if (preference === "Late") {
    const latePoints = calculateLateScore(combination);
    return latePoints;
  }

  return 0;
}

function calculateGap(
  activeDays: string[],
  combination: ActivityType[],
): number {
  let totalGapMinutesPw = 0;
  activeDays.forEach((activeDay) => {
    const activitiesPd = combination.filter((ac) => ac.day === activeDay);

    activitiesPd.sort((a, b) => a.start_time_mins - b.start_time_mins);

    // exlude the last one by -1
    let totalGapMinutesPd = 0;
    for (let i = 0; i < activitiesPd.length - 1; i++) {
      const nextAc = activitiesPd[i + 1];
      const curAc = activitiesPd[i];

      const gapInMins = nextAc.start_time_mins - curAc.end_time_mins;
      // if the duration is more than 60 mins, it's considered as a gap
      if (gapInMins > 60) {
        totalGapMinutesPd += gapInMins;
      }
    }
    totalGapMinutesPw += totalGapMinutesPd;
  });

  return totalGapMinutesPw;
}

function calculateLateScore(weekActivities: ActivityType[]): number {
  if (weekActivities.length === 0) {
    return Infinity;
  }
  let totalStartTime = 0;
  weekActivities.forEach((activity) => {
    totalStartTime += activity.start_time_mins;
  });
  const averageStartTime = totalStartTime / weekActivities.length;

  // 1440 is minutes in a day
  return (1440 - averageStartTime) * 100;
}

function groupByActivityType(subjects: SubjectType[]): GroupedActivity {
  // flat all activities
  const activities = subjects.flatMap((sub) => sub.activities);
  const grouped: GroupedActivity = {};
  activities.forEach((activity) => {
    if (!grouped[activity.codeType]) {
      grouped[activity.codeType] = [];
    }
    grouped[activity.codeType].push(activity);
  });
  return grouped;
}

function buildActivityCombinations(
  groups: [string, ActivityType[]][],
  gIndex: number,
  currentCombination: ActivityType[] = [],
): ActivityType[][] {
  // beyond last group, the combination is complete
  if (currentCombination.length === groups.length) {
    return [currentCombination];
  }

  // try to combine with all the possible activities
  const [, activities] = groups[gIndex];
  const results: ActivityType[][] = [];
  for (const activity of activities) {
    // find if it's overlap with the current conbination
    // to qualify as overlap
    // 1. activity is in the same day
    // 2. activity is in the same subject
    const overlapped = currentCombination.some(
      (ac) =>
        ac.day === activity.day &&
        ac.code !== activity.code &&
        isActivityOverlap(ac, activity),
    );

    // not overlap add it to the combination and find a another activity in next group
    if (!overlapped) {
      const newCombinations = buildActivityCombinations(groups, gIndex + 1, [
        ...currentCombination,
        activity,
      ]);
      results.push(...newCombinations);
    }
  }
  return results;
}
