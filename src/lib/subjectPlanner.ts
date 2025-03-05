import { ActivityType, Day, Preference, SubjectType } from "@/types";
import { isOverlap } from "./dateHelpers";

interface CodeTypeGroupType {
  [key: string]: ActivityType[];
}

export function suggest(
  subjects: SubjectType[],
  preference: Preference = "Late",
): ActivityType[][] {
  // TODO: subjects needs to be validated, the suggestion would not work
  //  if one of the subject is not selectable
  const groups = groupBySubjectCodeType(subjects);

  // generate combinations
  const groupsArray = Object.entries(groups);
  const allCombinations = generateActivityCombination(groupsArray, 0);

  // rate score
  let bestScore = Infinity;
  let bestCombinations: ActivityType[][] = [];
  for (let i = 0; i < allCombinations.length; i++) {
    const combination = allCombinations[i];
    const score = calculateScore(combination, preference);
    if (score === bestScore) {
      bestCombinations.push(combination);
    }
    if (score < bestScore) {
      bestScore = score;
      bestCombinations = [combination];
    }
  }
  return bestCombinations;
}

function calculateScore(
  combination: ActivityType[],
  preference: Preference,
): number {
  // Point based system
  // Active days (the day that has a class), the less days the better score(less score)
  // Gap time during the active day, the lesser gap between class the better score (less score)

  let points = 0;
  const activeDays = [...new Set(combination.map((ac) => ac.day))].filter(
    (d) => d !== undefined,
  );
  points = activeDays.length * 1000; // using 1000 as a multiplier because it's easier to evaluate when the number are thounsands

  const gapPoints = calculateGap(activeDays, combination);
  points += gapPoints;

  // tie breaker with preference
  if (preference === "Late") {
    points += calculateLateScore(combination);
  } else if (preference === "Morning") {
    points += calculateMorningScore(combination);
  }

  return points;
}

function calculateGap(activeDays: Day[], combination: ActivityType[]): number {
  let totalGapPw = 0;
  activeDays.forEach((activeDay) => {
    const activitiesPd = combination.filter((ac) => ac.day === activeDay);

    activitiesPd.sort(
      (a, b) => a.startEndTime[0].getTime() - b.startEndTime[0].getTime(),
    );

    // exlude the last one by -1
    let totalGapPd = 0;
    for (let i = 0; i < activitiesPd.length - 1; i++) {
      const nextAc = activitiesPd[i + 1];
      const curAc = activitiesPd[i];

      const gap =
        (nextAc.startEndTime[0].getTime() - curAc.startEndTime[1].getTime()) /
        (1000 * 60);
      if (gap > 60) {
        totalGapPd += gap;
      }
    }
    totalGapPw += totalGapPd;
  });

  return totalGapPw;
}

function calculateMorningScore(weekActivities: ActivityType[]): number {
  if (weekActivities.length === 0) {
    return Infinity;
  }
  let totalStartTime = 0;
  weekActivities.forEach((activity) => {
    totalStartTime +=
      activity.startEndTime[0].getMinutes() +
      activity.startEndTime[0].getHours() * 60;
  });
  const averageStartTime = totalStartTime / weekActivities.length;
  return averageStartTime * 100;
}

function calculateLateScore(weekActivities: ActivityType[]): number {
  if (weekActivities.length === 0) {
    return Infinity;
  }
  let totalStartTime = 0;
  weekActivities.forEach((activity) => {
    totalStartTime +=
      activity.startEndTime[0].getMinutes() +
      activity.startEndTime[0].getHours() * 60;
  });
  const averageStartTime = totalStartTime / weekActivities.length;

  // 1440 is minutes in a day
  return (1440 - averageStartTime) * 100;
}

function generateActivityCombination(
  groups: [string, ActivityType[]][],
  gIndex: number,
  currentCombination: ActivityType[] = [],
): ActivityType[][] {
  // beyond last group, the combination is complete
  if (currentCombination.length === groups.length) {
    return [currentCombination];
  }

  // try to combine with all the possible activities
  const [_, activities] = groups[gIndex];
  const results: ActivityType[][] = [];
  for (const activity of activities) {
    // find if it's overlap with the current conbination
    // to qualify as overlap
    // 1. same day
    // 2. not the same subject (same subject can ignore the overlap checking)
    const overlapped = currentCombination.some(
      (ac) =>
        ac.day === activity.day &&
        ac.code !== activity.code &&
        isOverlap(ac.startEndTime, activity.startEndTime),
    );

    // not overlap add it to the combination and find a another activity in next group
    if (!overlapped) {
      const newCombinations = generateActivityCombination(groups, gIndex + 1, [
        ...currentCombination,
        activity,
      ]);
      results.push(...newCombinations);
    }
  }
  return results;
}

function groupBySubjectCodeType(subjects: SubjectType[]): CodeTypeGroupType {
  // flat all activities
  const activities = subjects.flatMap((sub) => sub.activities);

  const codeTypeGroups: CodeTypeGroupType = {};
  activities.forEach((activity) => {
    if (!codeTypeGroups[activity.codeType]) {
      codeTypeGroups[activity.codeType] = [];
    }
    codeTypeGroups[activity.codeType].push(activity);
  });
  return codeTypeGroups;
}
