export interface Phonetic {
  text?: string;
  audio?: string;
}

export interface Definition {
  definition: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
}

export interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms?: string[];
  antonyms?: string[];
}

export interface LanguageTranslation {
  translation: string;
  phonetic?: string;
  example?: string;
  exampleTranslation?: string;
}

export interface WordTranslations {
  thai?: LanguageTranslation;
}

export interface LexicalInsights {
  etymology?: string;
  memoryTip?: string;
  cefrLevel?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  wordFamily?: string[];
  collocations?: string[];
  usageNotes?: string;
}

export interface MerriamWebsterEntry {
  partOfSpeech?: string;
  definitions: string[];
  example?: string;
}

export interface WordEntry {
  word: string;
  phonetic?: string;
  phonetics?: Phonetic[];
  meanings: Meaning[];
  synonyms: string[];
  antonyms: string[];
  lexicalInsights?: LexicalInsights;
  translations?: WordTranslations;
  sourceUrls?: string[];
  sources?: string[];
  merriamWebster?: {
    collegiate?: MerriamWebsterEntry[];
    learner?: MerriamWebsterEntry[];
  };
  audioUrl?: string;
  origin?: string;
}

export type MasteryLevel = 'Learning' | 'Reviewing' | 'Mastered';

export interface UserWordProgress {
  word: string;
  masteryScore: number; // 0 to 100
  masteryLevel: MasteryLevel;
  lastReviewed: string; // ISO date string
  nextReviewDate: string; // ISO date string
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  tags: string[];
  isBookmarked: boolean;
  notes?: string;
  addedAt: string;
}

export type PracticeType = 'flashcard' | 'multiple-choice' | 'spelling' | 'fill-blank' | 'synonym-match';

export interface PracticeExercise {
  id: string;
  type: PracticeType;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  hint?: string;
  explanation?: string;
  sentenceWithBlank?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  description: string;
  iconName?: string;
  words: WordEntry[];
}

export interface OfflinePack {
  id: string;
  title: string;
  description: string;
  wordCount: number;
  sizeMb: string;
  category: 'essential' | 'academic' | 'travel' | 'business' | 'toefl_ielts';
  isDownloaded: boolean;
  downloadDate?: string;
  words: WordEntry[];
}

export interface CloudSyncProfile {
  syncCode: string;
  lastSyncedAt: string;
  deviceType: string;
  savedWordsCount: number;
  masteredCount: number;
  streakDays: number;
}

export interface StudyStats {
  totalSearched: number;
  totalSaved: number;
  masteredCount: number;
  learningCount: number;
  reviewingCount: number;
  streakDays: number;
  lastActiveDate: string;
  practiceAccuracy: number; // percentage
  totalExercisesCompleted: number;
}
