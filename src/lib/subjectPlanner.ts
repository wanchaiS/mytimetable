import { ActivityType, Day, SubjectType } from "@/hooks/useSubjects";
import { Preference } from "@/types";
import { isActivityOverlap } from "./dateHelpers";

// types for results
export interface SuggestionsType {
  semester: string;
  subjects: SubjectType[];
  subjectCombinations: SubjectCombinationType[];
}
export interface SubjectCombinationType {
  id: string;
  bestScore: number;
  subjects: SubjectType[];
  activityCombinations: ActivityCombinationType[];
}
export interface ActivityCombinationType {
  id: string;
  score: number;
  activities: ActivityType[];
}

type GroupedActivity = {
  [key: string]: ActivityType[];
};

export function suggest(
  subjects: SubjectType[],
  preference: Preference = "Late",
): SuggestionsType[] {
  const suggestions = groupBySemester(subjects);
  suggestions.forEach((suggestion) => {
    // find combinations of subject , assume total credit is 24 for now
    suggestion.subjectCombinations = buildSubjectCombinations(
      suggestion.subjects,
      12,
    );

    for (let j = 0; j < suggestion.subjectCombinations.length; j++) {
      // activity with the same "type" on the same subject should not be in the same combination
      // group all activities across subjects by "type" and "subject code"
      const groupedActivities = groupByActivityType(
        suggestion.subjectCombinations[j].subjects,
      );

      suggestion.subjectCombinations[j].activityCombinations =
        buildActivityCombinations(Object.entries(groupedActivities), 0);

      // calculate score for each activity combination
      suggestion.subjectCombinations[j].activityCombinations.forEach(
        (activityCombination) => {
          activityCombination.score = calculateScore(
            activityCombination.activities,
            preference,
          );
        },
      );

      // calculate best score for each subject combination
      suggestion.subjectCombinations[j].bestScore = Math.min(
        ...suggestion.subjectCombinations[j].activityCombinations.map(
          (ac) => ac.score,
        ),
      );
    }
  });

  // filter for only best score

  suggestions.forEach((suggestion) => {
    suggestion.subjectCombinations.forEach((subjectCombination) => {
      // filter activity combinations
      subjectCombination.activityCombinations =
        subjectCombination.activityCombinations.filter(
          (ac) => ac.score === subjectCombination.bestScore,
        );
    });
  });

  return suggestions;
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

    activitiesPd.sort((a, b) => a.start_time_mins - b.start_time_mins);

    // exlude the last one by -1
    let totalGapPd = 0;
    for (let i = 0; i < activitiesPd.length - 1; i++) {
      const nextAc = activitiesPd[i + 1];
      const curAc = activitiesPd[i];

      const gapInMins = nextAc.start_time_mins - curAc.end_time_mins;
      if (gapInMins > 60) {
        totalGapPd += gapInMins;
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
  let totalStartTimeInMins = 0;
  weekActivities.forEach((activity) => {
    totalStartTimeInMins += activity.start_time_mins;
  });
  const averageStartTime = totalStartTimeInMins / weekActivities.length;
  return averageStartTime * 100;
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
): ActivityCombinationType[] {
  // beyond last group, the combination is complete
  if (currentCombination.length === groups.length) {
    return [
      {
        id: currentCombination.map((a) => a.id).join("#"),
        score: Infinity,
        activities: currentCombination,
      },
    ];
  }

  // try to combine with all the possible activities
  const [, activities] = groups[gIndex];
  const results: ActivityCombinationType[] = [];
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

function groupBySemester(subjects: SubjectType[]): SuggestionsType[] {
  const result = subjects.reduce(
    (acc: SuggestionsType[], cur: SubjectType): SuggestionsType[] => {
      const idx = acc.findIndex((s) => s.semester === cur.semester);
      if (idx === -1) {
        acc.push({
          semester: cur.semester,
          subjects: [cur],
          subjectCombinations: [],
        });
      } else {
        acc[idx].subjects.push(cur);
      }
      return acc;
    },
    [],
  );
  return result;
}

function buildSubjectCombinations(
  subjects: SubjectType[],
  totalCredits: number,
): SubjectCombinationType[] {
  // no need to find combinations
  if (subjects.length * 6 <= totalCredits) {
    return [
      {
        id: subjects.map((s) => s.code).join("#"),
        bestScore: Infinity,
        subjects: subjects,
        activityCombinations: [],
      },
    ];
  }

  const result: SubjectCombinationType[] = [];

  function backtrack(combination: SubjectType[], startIndex: number) {
    // Assume every subject's credit is 6 for now
    // Baseline: when the total credits of combination is equal to given totalcredits
    if (combination.length * 6 === totalCredits) {
      // Store completed combination to the final result
      result.push({
        id: combination.map((s) => s.code).join("#"),
        bestScore: Infinity,
        subjects: [...combination],
        activityCombinations: [],
      });
      return;
    }

    // Choosing combo's member
    for (let i = startIndex; i < subjects.length; i++) {
      // Should not reach the total credit
      if (combination.length * 6 + 6 > totalCredits) {
        continue;
      }

      // Choose
      combination.push(subjects[i]);

      // Keep choosing
      backtrack(combination, i + 1);

      // Backtrack: Remove the last element to explore other possibilities
      combination.pop();
    }
  }

  backtrack([], 0);
  return result;
}
