import { OfflinePack, WordEntry } from '../types';
import { REAL_DICTIONARY_WORDS } from './lessonsData';

export const INITIAL_OFFLINE_WORDS: WordEntry[] = REAL_DICTIONARY_WORDS;

export const PRESET_OFFLINE_PACKS: OfflinePack[] = [
  {
    id: 'pack_essential_3000',
    title: 'Essential English Vocabulary Pack',
    description: 'Core vocabulary for everyday conversation, reading, and fluency with Thai offline translations.',
    wordCount: REAL_DICTIONARY_WORDS.length,
    sizeMb: '4.2 MB',
    category: 'essential',
    isDownloaded: true,
    downloadDate: new Date().toISOString(),
    words: REAL_DICTIONARY_WORDS
  },
  {
    id: 'pack_toefl_ielts_1500',
    title: 'TOEFL & IELTS Band 8+ Masterpack',
    description: 'High-frequency academic and analytical vocabulary required for international English proficiency exams.',
    wordCount: 1500,
    sizeMb: '2.8 MB',
    category: 'toefl_ielts',
    isDownloaded: false,
    words: REAL_DICTIONARY_WORDS.filter(w => w.lexicalInsights?.cefrLevel === 'C1' || w.lexicalInsights?.cefrLevel === 'C2')
  },
  {
    id: 'pack_academic_awl_1000',
    title: 'Academic Word List (AWL)',
    description: 'University-level lexical terms essential for essay writing, research papers, and technical publications.',
    wordCount: 1000,
    sizeMb: '2.1 MB',
    category: 'academic',
    isDownloaded: false,
    words: REAL_DICTIONARY_WORDS
  },
  {
    id: 'pack_travel_daily_800',
    title: 'Travel & Conversational English',
    description: 'Practical phrases and situational vocabulary for airports, dining, medical emergencies, and local transit.',
    wordCount: 800,
    sizeMb: '1.5 MB',
    category: 'travel',
    isDownloaded: false,
    words: REAL_DICTIONARY_WORDS
  }
];
