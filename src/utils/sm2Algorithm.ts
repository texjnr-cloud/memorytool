/**
 * SuperMemo 2 (SM-2) Algorithm Implementation
 *
 * This algorithm calculates the next review date based on the user's performance.
 *
 * @param rating - User's recall quality (0-5)
 *   0: Complete blackout
 *   1: Incorrect response; correct one seemed familiar
 *   2: Incorrect response; correct one seemed easy to recall
 *   3: Correct response recalled with serious difficulty
 *   4: Correct response after some hesitation
 *   5: Perfect response
 *
 * @param currentEasinessFactor - Current easiness factor (minimum 1.3)
 * @param currentInterval - Current interval in days (default 0 for new items)
 * @param repetitionCount - Number of consecutive correct responses (default 0)
 *
 * @returns Object containing new easiness factor, interval, and repetition count
 */

export interface SM2Result {
  easinessFactor: number;
  intervalDays: number;
  repetitionCount: number;
  nextReviewDate: string;
}

export function calculateSM2(
  rating: number,
  currentEasinessFactor: number = 2.5,
  currentInterval: number = 0,
  repetitionCount: number = 0
): SM2Result {
  let newEasinessFactor = currentEasinessFactor;
  let newInterval = currentInterval;
  let newRepetitionCount = repetitionCount;

  // Update easiness factor based on rating
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  newEasinessFactor = currentEasinessFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));

  // Ensure easiness factor doesn't go below 1.3
  if (newEasinessFactor < 1.3) {
    newEasinessFactor = 1.3;
  }

  // Calculate new interval based on rating
  if (rating < 3) {
    // If rating is below 3, restart the learning process
    newRepetitionCount = 0;
    newInterval = 1; // Review tomorrow
  } else {
    // Rating >= 3: increment repetition count
    newRepetitionCount = repetitionCount + 1;

    if (newRepetitionCount === 1) {
      newInterval = 1; // First review: 1 day
    } else if (newRepetitionCount === 2) {
      newInterval = 6; // Second review: 6 days
    } else {
      // Subsequent reviews: multiply previous interval by easiness factor
      newInterval = Math.round(currentInterval * newEasinessFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easinessFactor: Math.round(newEasinessFactor * 100) / 100, // Round to 2 decimal places
    intervalDays: newInterval,
    repetitionCount: newRepetitionCount,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}

/**
 * Check if a contact is due for review
 */
export function isDueForReview(nextReviewDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= today;
}

/**
 * Get the number of days until next review
 */
export function getDaysUntilReview(nextReviewDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reviewDate = new Date(nextReviewDate);
  reviewDate.setHours(0, 0, 0, 0);

  const diffTime = reviewDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
