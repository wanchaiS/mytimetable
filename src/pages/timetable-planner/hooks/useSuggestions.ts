import {
  ActivityType,
  SubjectType,
} from "@/pages/timetable-planner/hooks/useSearchSubjects";
import { Preference } from "@/pages/timetable-planner/types";
import { useCallback, useContext } from "react";
import { TimetableContext } from "../contexts/TimetableContext";
import { isTimeOverlap } from "../utils/dateHelpers";

interface ScoreBoard {
  preference: Preference;
  bestScore: number;
  bestCombination: ActivityType[];
  currentScore: number;
  currentCombination: ActivityType[];
}
type ActivityOptions = Map<string, ActivityType[]>;

/**
 * Custom hook that provides a suggestion handler for selecting activities
 * based on user preferences and available subjects.
 *
 * This hook uses the `TimetableContext` to access the list of subjects and
 * the function to select activities. It calculates the best combination of
 * activities that align with the user's preferences and updates the timetable
 * accordingly.
 *
 * @returns An object containing:
 * - `handleSuggest`: A function that takes a `Preference` and suggests the best
 *   combination of activities based on the given preference.
 */
export function useSuggestions() {
  const { subjects, onSelectActivities } = useContext(TimetableContext);

  const handleSuggest = useCallback(
    (preference: Preference) => {
      const suggestedTimeslots = suggest(subjects, preference);
      if (suggestedTimeslots.length === 0) {
        return;
      }

      onSelectActivities(suggestedTimeslots);
    },
    [onSelectActivities, subjects],
  );

  return { handleSuggest };
}

function suggest(
  subjects: SubjectType[],
  preference: Preference,
): ActivityType[] {
  // prepare activity options
  const activityOptions = getActivityOptions(subjects);

  const scoreBoard: ScoreBoard = {
    preference,
    bestScore: Infinity,
    bestCombination: [] as ActivityType[],
    currentScore: 0,
    currentCombination: [] as ActivityType[],
  };
  // start finding the best combination
  findBestCombination(activityOptions, 0, scoreBoard);

  return scoreBoard.bestCombination;
}

function getActivityOptions(subjects: SubjectType[]): ActivityOptions {
  const options = subjects
    .flatMap((sub) => sub.activities)
    .reduce((acc, activity) => {
      if (acc.has(activity.subjectActivityGroupId)) {
        const activities = acc.get(activity.subjectActivityGroupId);
        const activitySameTimeSlotIdx = activities!.findIndex(
          (ts) =>
            ts.day === activity.day &&
            ts.startTime === activity.startTime &&
            ts.duration === activity.duration,
        );
        // only add if not exist in the same time slot, some activities happening at the same time
        if (activitySameTimeSlotIdx === -1) {
          activities!.push(activity);
        }
      } else {
        acc.set(activity.subjectActivityGroupId, [activity]);
      }
      return acc;
    }, new Map<string, ActivityType[]>());

  return options;
}

function hasConflict(
  currentCombination: ActivityType[],
  newActivity: ActivityType,
): boolean {
  // find if it's overlap with the current conbination
  // to qualify as overlap
  // 1. activity is in the same day
  return currentCombination.some(
    (ac) =>
      ac.day === newActivity.day &&
      isTimeOverlap(
        ac.startTimeMins,
        ac.endTimeMins,
        newActivity.startTimeMins,
        newActivity.endTimeMins,
      ),
  );
}

function findBestCombination(
  activityOptions: ActivityOptions,
  groupIdx: number,
  scoreBoard: ScoreBoard,
): void {
  // --- Bounding Check ---
  // If the score for the current *partial* combination is already worse than
  // the best *complete* score we've found, STOP!
  if (scoreBoard.currentScore >= scoreBoard.bestScore) {
    return; // Short-circuit: This path is guaranteed to be worse.
  }

  // BASE CASE (Only update best score here)
  if (groupIdx === activityOptions.size) {
    // We can just use currentPartialScore as the final score!
    if (scoreBoard.currentScore < scoreBoard.bestScore) {
      scoreBoard.bestScore = scoreBoard.currentScore;
      scoreBoard.bestCombination = [...scoreBoard.currentCombination];
    }
    return;
  }

  const activityOptionsArray = Array.from(activityOptions.values());
  const activities = activityOptionsArray[groupIdx];

  // Select activity for the combination
  for (const activityOption of activities) {
    if (!hasConflict(scoreBoard.currentCombination, activityOption)) {
      // 1. CHOOSE
      scoreBoard.currentCombination.push(activityOption);
      // 2. Calculate the new current score for current combination
      scoreBoard.currentScore = calculateScore(
        scoreBoard.currentCombination,
        scoreBoard.preference,
      );

      // 3. EXPLORE
      findBestCombination(activityOptions, groupIdx + 1, scoreBoard);

      // 4. UNCHOOSE (BACKTRACK)
      scoreBoard.currentCombination.pop();
    }
  }
}

/**
 *
 * @param combination list of activities
 * @param preference how score should be weighted
 * @returns score of combination
 */
function calculateScore(
  combination: ActivityType[],
  preference: Preference,
): number {
  // Point based system

  const activeDays = [...new Set(combination.map((ac) => ac.day))].filter(
    (d) => d,
  );
  const totalGapMinutes = calculateGap(activeDays, combination);
  const totalSpanMinutes = calculateDailySpan(activeDays, combination);

  // Weights: W_DAYS > W_SPAN > W_GAP
  const W_DAYS = 1000;
  const W_SPAN = 200; // Penalize total time spent on campus
  const W_GAP = 100; // Penalize unused time within the span

  if (preference === "Compact") {
    const activeDaysPoints = activeDays.length * W_DAYS;
    const gapPoints = totalGapMinutes * W_GAP;
    const spanPoints = totalSpanMinutes * W_SPAN;

    return activeDaysPoints + gapPoints + spanPoints;
  }

  if (preference === "Relaxed") {
    const activeDaysPoints = activeDays.length * -W_DAYS;
    const gapPoints = totalGapMinutes * -W_GAP;
    return activeDaysPoints + gapPoints;
  }

  if (preference === "Late") {
    const latePoints = calculateLateScore(combination);
    return latePoints;
  }

  return 0;
}

function calculateDailySpan(
  activeDays: string[],
  combination: ActivityType[],
): number {
  let totalSpanMinutes = 0;
  activeDays.forEach((activeDay) => {
    const activitiesPd = combination.filter((ac) => ac.day === activeDay);
    if (activitiesPd.length > 0) {
      const minStart = Math.min(...activitiesPd.map((ac) => ac.startTimeMins));
      const maxEnd = Math.max(...activitiesPd.map((ac) => ac.endTimeMins));
      totalSpanMinutes += maxEnd - minStart;
    }
  });
  return totalSpanMinutes;
}

function calculateGap(
  activeDays: string[],
  combination: ActivityType[],
): number {
  let totalGapMinutesPw = 0;
  activeDays.forEach((activeDay) => {
    const activitiesPd = combination.filter((ac) => ac.day === activeDay);

    activitiesPd.sort((a, b) => a.startTimeMins - b.startTimeMins);

    // exlude the last one by -1
    let totalGapMinutesPd = 0;
    for (let i = 0; i < activitiesPd.length - 1; i++) {
      const nextAc = activitiesPd[i + 1];
      const curAc = activitiesPd[i];

      const gapInMins = nextAc.startTimeMins - curAc.endTimeMins;
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
    totalStartTime += activity.startTimeMins;
  });
  const averageStartTime = totalStartTime / weekActivities.length;

  // 1440 is minutes in a day
  return (1440 - averageStartTime) * 100;
}
