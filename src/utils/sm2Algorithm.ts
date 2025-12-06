// SuperMemo 2 Algorithm Implementation
interface Card {
  easiness: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export function initializeCard(): Card {
  return {
    easiness: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: new Date(),
  };
}

export function updateCard(card: Card, quality: number): Card {
  // quality: 0-5 (0=blackout, 3=difficult, 5=perfect)
  let newEasiness = card.easiness + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  
  if (newEasiness < 1.3) {
    newEasiness = 1.3;
  }

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    newInterval = 1;
    newRepetitions = 0;
  } else {
    if (card.repetitions === 0) {
      newInterval = 1;
    } else if (card.repetitions === 1) {
      newInterval = 3;
    } else {
      newInterval = Math.round(card.interval * newEasiness);
    }
    newRepetitions = card.repetitions + 1;
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easiness: newEasiness,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  };
}