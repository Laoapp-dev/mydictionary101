import { WordEntry } from '../types';

/**
 * Flat row shape used by the MyDictionary101 "Word Content" import template
 * (both the .csv and .json versions use these exact column / key names).
 *
 * Multi-value fields (synonym, antonym) accept multiple values separated by
 * a semicolon, e.g.  "adaptable; tough; tenacious"
 */
export interface WordImportRow {
  word: string;
  definition: string;
  partOfSpeech: string;
  cefrLevel: string;
  exampleSentence: string;
  synonym: string;
  antonym: string;
  category: string;
  difficulty: string;
  laoTranslation: string;
  thaiTranslation: string;
}

export const WORD_TEMPLATE_HEADERS: (keyof WordImportRow)[] = [
  'word',
  'definition',
  'partOfSpeech',
  'cefrLevel',
  'exampleSentence',
  'synonym',
  'antonym',
  'category',
  'difficulty',
  'laoTranslation',
  'thaiTranslation',
];

const splitList = (value?: string): string[] =>
  (value || '')
    .split(/[;|]/)
    .map((v) => v.trim())
    .filter(Boolean);

const normalizeDifficulty = (value: string): 'Easy' | 'Medium' | 'Hard' | undefined => {
  const v = (value || '').trim().toLowerCase();
  if (v === 'easy') return 'Easy';
  if (v === 'medium') return 'Medium';
  if (v === 'hard') return 'Hard';
  return undefined;
};

const normalizeCefr = (value: string): 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | undefined => {
  const v = (value || '').trim().toUpperCase();
  return (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const).includes(v as any) ? (v as any) : undefined;
};

/** Converts one flat template row into the app's nested WordEntry format. */
export function rowToWordEntry(row: WordImportRow): WordEntry {
  const synonyms = splitList(row.synonym);
  const antonyms = splitList(row.antonym);

  return {
    word: (row.word || '').trim(),
    meanings: [
      {
        partOfSpeech: (row.partOfSpeech || '').trim() || 'unknown',
        definitions: [
          {
            definition: (row.definition || '').trim(),
            example: (row.exampleSentence || '').trim() || undefined,
            synonyms,
            antonyms,
          },
        ],
        synonyms,
        antonyms,
      },
    ],
    synonyms,
    antonyms,
    category: (row.category || '').trim() || undefined,
    difficulty: normalizeDifficulty(row.difficulty),
    lexicalInsights: {
      cefrLevel: normalizeCefr(row.cefrLevel),
    },
    translations: {
      thai: row.thaiTranslation
        ? { translation: row.thaiTranslation.trim() }
        : undefined,
      lao: row.laoTranslation
        ? { translation: row.laoTranslation.trim() }
        : undefined,
    },
  };
}

/** Parses a CSV string that follows the Word Content import template. */
export function parseWordCsv(csvStr: string): { entries: WordEntry[]; errors: string[] } {
  const errors: string[] = [];
  const lines = csvStr
    .split(/\r?\n/)
    .map((l) => l)
    .filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    return { entries: [], errors: ['CSV must contain a header row and at least one data row.'] };
  }

  // Simple CSV parser that supports quoted fields containing commas.
  const parseCsvLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cur += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        out.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };

  const headerCols = parseCsvLine(lines[0]).map((h) => h.trim());
  const headerIndex = new Map<string, number>();
  headerCols.forEach((h, idx) => headerIndex.set(h.toLowerCase(), idx));

  const requiredHeaders = ['word', 'definition'];
  for (const req of requiredHeaders) {
    if (!headerIndex.has(req)) {
      return { entries: [], errors: [`Missing required column "${req}" in CSV header.`] };
    }
  }

  const get = (cols: string[], key: string): string => {
    const idx = headerIndex.get(key.toLowerCase());
    return idx !== undefined ? (cols[idx] || '') : '';
  };

  const entries: WordEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const word = get(cols, 'word');
    if (!word) {
      errors.push(`Row ${i + 1}: skipped, missing "word".`);
      continue;
    }
    const row: WordImportRow = {
      word,
      definition: get(cols, 'definition'),
      partOfSpeech: get(cols, 'partOfSpeech'),
      cefrLevel: get(cols, 'cefrLevel'),
      exampleSentence: get(cols, 'exampleSentence'),
      synonym: get(cols, 'synonym'),
      antonym: get(cols, 'antonym'),
      category: get(cols, 'category'),
      difficulty: get(cols, 'difficulty'),
      laoTranslation: get(cols, 'laoTranslation'),
      thaiTranslation: get(cols, 'thaiTranslation'),
    };
    entries.push(rowToWordEntry(row));
  }

  return { entries, errors };
}

/** Parses a JSON string (array of WordImportRow objects) that follows the Word Content import template. */
export function parseWordJson(jsonStr: string): { entries: WordEntry[]; errors: string[] } {
  const errors: string[] = [];
  try {
    const data = JSON.parse(jsonStr);
    const rows: any[] = Array.isArray(data) ? data : data.words || data.entries || [];
    if (!Array.isArray(rows) || rows.length === 0) {
      return { entries: [], errors: ['JSON must be an array of word objects (or { "words": [...] }).'] };
    }

    const entries: WordEntry[] = [];
    rows.forEach((r, idx) => {
      if (!r.word) {
        errors.push(`Item ${idx + 1}: skipped, missing "word".`);
        return;
      }
      const row: WordImportRow = {
        word: r.word || '',
        definition: r.definition || '',
        partOfSpeech: r.partOfSpeech || '',
        cefrLevel: r.cefrLevel || '',
        exampleSentence: r.exampleSentence || '',
        synonym: Array.isArray(r.synonym) ? r.synonym.join('; ') : r.synonym || '',
        antonym: Array.isArray(r.antonym) ? r.antonym.join('; ') : r.antonym || '',
        category: r.category || '',
        difficulty: r.difficulty || '',
        laoTranslation: r.laoTranslation || '',
        thaiTranslation: r.thaiTranslation || '',
      };
      entries.push(rowToWordEntry(row));
    });

    return { entries, errors };
  } catch (e) {
    return { entries: [], errors: ['Invalid JSON file: ' + (e as Error).message] };
  }
}
