export interface Contact {
  id: string;
  name: string;
  photoUri: string;
  contextNotes: string;
  mnemonicHook: string;
  lastReviewDate: string;
  nextReviewDate: string;
  easinessFactor: number;
  repetitionCount?: number;
  intervalDays?: number;
}

export interface QuizRating {
  contactId: string;
  rating: number;
  timestamp: string;
}
