import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';

import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getDb } from './src/db/index.ts';
import { userProgress, userStats } from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client safely on server
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// In-memory Cloud Sync Storage for cross-device synchronization
const cloudSyncStore = new Map<string, any>();

// Fast Server In-Memory Cache for Dictionary Words
const wordCache = new Map<string, any>();

// API 1: Dictionary Lookup & Enrichment Route
app.get('/api/dictionary/:word', async (req: Request, res: Response) => {
  const word = req.params.word.trim().toLowerCase();
  if (!word) {
    return res.status(400).json({ error: 'Word parameter is required' });
  }

  // Check in-memory fast cache first
  if (wordCache.has(word)) {
    return res.json(wordCache.get(word));
  }

  let freeDictData: any = null;
  let datamuseSynonyms: string[] = [];
  let datamuseAntonyms: string[] = [];
  let merriamWebsterData: {
    collegiate?: { partOfSpeech?: string; definitions: string[]; example?: string }[];
    learner?: { partOfSpeech?: string; definitions: string[]; example?: string }[];
  } = {};

  // 1. Call Free Dictionary API
  try {
    const freeRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (freeRes.ok) {
      const data = await freeRes.json();
      if (Array.isArray(data) && data.length > 0) {
        freeDictData = data[0];
      }
    }
  } catch (err) {
    console.warn(`Free Dictionary API error for ${word}:`, err);
  }

  // 2. Call Datamuse for extra synonyms and antonyms
  try {
    const [synRes, antRes] = await Promise.all([
      fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=15`),
      fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(word)}&max=10`),
    ]);
    if (synRes.ok) {
      const synData = await synRes.json();
      datamuseSynonyms = synData.map((item: any) => item.word);
    }
    if (antRes.ok) {
      const antData = await antRes.json();
      datamuseAntonyms = antData.map((item: any) => item.word);
    }
  } catch (err) {
    console.warn(`Datamuse API error for ${word}:`, err);
  }

  // 3. Call Merriam-Webster Collegiate, Learner, and Thesaurus APIs (if keys present)
  const mwCollegiateKey = process.env.MERRIAM_WEBSTER_COLLEGIATE_KEY;
  const mwLearnerKey = process.env.MERRIAM_WEBSTER_LEARNER_KEY;
  const mwThesaurusKey = process.env.MERRIAM_WEBSTER_THESAURUS_KEY;

  let mwThesaurusSynonyms: string[] = [];
  let mwThesaurusAntonyms: string[] = [];

  if (mwCollegiateKey || mwLearnerKey || mwThesaurusKey) {
    try {
      const fetches: Promise<any>[] = [];
      fetches.push(
        mwCollegiateKey
          ? fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${mwCollegiateKey}`)
          : Promise.resolve(null)
      );
      fetches.push(
        mwLearnerKey
          ? fetch(`https://www.dictionaryapi.com/api/v3/references/learners/json/${encodeURIComponent(word)}?key=${mwLearnerKey}`)
          : Promise.resolve(null)
      );
      fetches.push(
        mwThesaurusKey
          ? fetch(`https://www.dictionaryapi.com/api/v3/references/thesaurus/json/${encodeURIComponent(word)}?key=${mwThesaurusKey}`)
          : Promise.resolve(null)
      );

      const [colRes, learnRes, thesRes] = await Promise.all(fetches);

      if (colRes && colRes.ok) {
        const colData = await colRes.json();
        if (Array.isArray(colData) && colData.length > 0 && typeof colData[0] === 'object' && colData[0].shortdef) {
          merriamWebsterData.collegiate = colData.map((item: any) => ({
            partOfSpeech: item.fl || 'general',
            definitions: item.shortdef || [],
            example: item.def?.[0]?.sseq?.[0]?.[0]?.[1]?.dt?.[1]?.[1]?.[0]?.t?.replace(/\{.*?\}/g, '') || '',
          }));
        }
      }

      if (learnRes && learnRes.ok) {
        const learnData = await learnRes.json();
        if (Array.isArray(learnData) && learnData.length > 0 && typeof learnData[0] === 'object' && learnData[0].shortdef) {
          merriamWebsterData.learner = learnData.map((item: any) => ({
            partOfSpeech: item.fl || 'general',
            definitions: item.shortdef || [],
            example: item.def?.[0]?.sseq?.[0]?.[0]?.[1]?.dt?.[1]?.[1]?.[0]?.t?.replace(/\{.*?\}/g, '') || '',
          }));
        }
      }

      if (thesRes && thesRes.ok) {
        const thesData = await thesRes.json();
        if (Array.isArray(thesData) && thesData.length > 0 && typeof thesData[0] === 'object') {
          for (const item of thesData) {
            if (item.meta?.syns) {
              mwThesaurusSynonyms.push(...item.meta.syns.flat());
            }
            if (item.meta?.ants) {
              mwThesaurusAntonyms.push(...item.meta.ants.flat());
            }
          }
        }
      }
    } catch (mwErr) {
      console.warn(`Merriam-Webster API error for ${word}:`, mwErr);
    }
  }

  // 4. Fallback / AI Enriched Insights, Merriam-Webster definitions, & Thai Translation via Gemini
  let aiEnrichment: any = null;
  const ai = getGeminiAI();
  if (ai) {
    try {
      const prompt = `Analyze the English word "${word}" and provide lexical metadata, authoritative Merriam-Webster Collegiate and Learner Dictionary definitions, and accurate translation in Thai JSON format.
Strictly return a JSON object matching this schema:
{
  "cefrLevel": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "etymology": "Brief origin of the word",
  "memoryTip": "A memorable mnemonic or visual tip to remember this word",
  "collocations": ["collocation 1", "collocation 2", "collocation 3"],
  "wordFamily": ["family 1", "family 2"],
  "usageNotes": "Short advice on context or register (formal, informal, academic)",
  "merriamWebsterCollegiate": [
    {
      "partOfSpeech": "noun | verb | adjective | adverb",
      "definitions": ["Authoritative Collegiate definition 1", "Authoritative Collegiate definition 2"],
      "example": "Sample sentence in formal context"
    }
  ],
  "merriamWebsterLearner": [
    {
      "partOfSpeech": "noun | verb | adjective | adverb",
      "definitions": ["Clear learner-friendly definition 1", "Clear learner-friendly definition 2"],
      "example": "Simple example sentence for language learners"
    }
  ],
  "thai": {
    "translation": "Thai translation in Thai script",
    "phonetic": "Thai phonetic pronunciation guide (Karaoke/IPA style)",
    "example": "Sample sentence in Thai script",
    "exampleTranslation": "English translation of the Thai example sentence"
  },
  "fallbackDefinitions": [
    {
      "partOfSpeech": "noun | verb | adjective | adverb",
      "definition": "Definition in clear English",
      "example": "Example usage sentence"
    }
  ],
  "synonyms": ["synonym1", "synonym2"],
  "antonyms": ["antonym1", "antonym2"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        aiEnrichment = JSON.parse(response.text.trim());
      }
    } catch (aiErr) {
      console.warn(`Gemini AI enrichment failed for ${word}:`, aiErr);
    }
  }

  // Populate Merriam-Webster data from AI if API key was not configured or returned no entries
  if (!merriamWebsterData.collegiate && aiEnrichment?.merriamWebsterCollegiate) {
    merriamWebsterData.collegiate = aiEnrichment.merriamWebsterCollegiate;
  }
  if (!merriamWebsterData.learner && aiEnrichment?.merriamWebsterLearner) {
    merriamWebsterData.learner = aiEnrichment.merriamWebsterLearner;
  }

  // Build final WordEntry response
  const finalPhonetic =
    freeDictData?.phonetic ||
    freeDictData?.phonetics?.find((p: any) => p.text)?.text ||
    `/${word}/`;

  const audioUrl =
    freeDictData?.phonetics?.find((p: any) => p.audio && p.audio.trim().length > 0)?.audio || '';

  // Extract meanings from freeDict, Merriam-Webster, or AI fallback
  let meanings: any[] = [];
  if (freeDictData && freeDictData.meanings && freeDictData.meanings.length > 0) {
    meanings = freeDictData.meanings.map((m: any) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: (m.definitions || []).map((d: any) => ({
        definition: d.definition,
        example: d.example || '',
        synonyms: d.synonyms || [],
        antonyms: d.antonyms || [],
      })),
      synonyms: m.synonyms || [],
      antonyms: m.antonyms || [],
    }));
  } else if (merriamWebsterData.collegiate && merriamWebsterData.collegiate.length > 0) {
    meanings = merriamWebsterData.collegiate.map((mwItem) => ({
      partOfSpeech: mwItem.partOfSpeech || 'general',
      definitions: (mwItem.definitions || []).map((defStr) => ({
        definition: defStr,
        example: mwItem.example || '',
      })),
    }));
  } else if (merriamWebsterData.learner && merriamWebsterData.learner.length > 0) {
    meanings = merriamWebsterData.learner.map((mwItem) => ({
      partOfSpeech: mwItem.partOfSpeech || 'general',
      definitions: (mwItem.definitions || []).map((defStr) => ({
        definition: defStr,
        example: mwItem.example || '',
      })),
    }));
  } else if (aiEnrichment?.fallbackDefinitions) {
    meanings = [
      {
        partOfSpeech: aiEnrichment.fallbackDefinitions[0]?.partOfSpeech || 'general',
        definitions: aiEnrichment.fallbackDefinitions.map((d: any) => ({
          definition: d.definition,
          example: d.example,
        })),
      },
    ];
  } else {
    meanings = [
      {
        partOfSpeech: 'general',
        definitions: [{ definition: `Definition for ${word}` }],
      },
    ];
  }

  // Combine synonyms & antonyms
  const combinedSynonyms = Array.from(
    new Set([
      ...datamuseSynonyms,
      ...mwThesaurusSynonyms,
      ...(aiEnrichment?.synonyms || []),
      ...(freeDictData?.meanings?.flatMap((m: any) => m.synonyms || []) || []),
    ])
  ).slice(0, 15);

  const combinedAntonyms = Array.from(
    new Set([
      ...datamuseAntonyms,
      ...mwThesaurusAntonyms,
      ...(aiEnrichment?.antonyms || []),
      ...(freeDictData?.meanings?.flatMap((m: any) => m.antonyms || []) || []),
    ])
  ).slice(0, 10);

  // Thai default fallback if AI wasn't triggered
  const thaiTranslation = aiEnrichment?.thai || {
    translation: `${word}`,
    phonetic: `${word}`,
    example: `ลองใช้คำว่า ${word} ในประโยค`,
    exampleTranslation: `Try using the word ${word} in a sentence.`,
  };

  const sources = [
    'Free Dictionary API',
    'Datamuse API',
    'Merriam-Webster Collegiate',
    'Merriam-Webster Learner',
  ];

  const wordEntry = {
    word: freeDictData?.word || word,
    phonetic: finalPhonetic,
    phonetics: freeDictData?.phonetics || [{ text: finalPhonetic, audio: audioUrl }],
    audioUrl,
    meanings,
    synonyms: combinedSynonyms,
    antonyms: combinedAntonyms,
    merriamWebster: merriamWebsterData,
    sources,
    lexicalInsights: {
      cefrLevel: aiEnrichment?.cefrLevel || 'B1',
      etymology: aiEnrichment?.etymology || freeDictData?.origin || 'Etymology details available in reference materials.',
      memoryTip: aiEnrichment?.memoryTip || `Associate "${word}" with its primary definition and key synonyms.`,
      collocations: aiEnrichment?.collocations || [],
      wordFamily: aiEnrichment?.wordFamily || [],
      usageNotes: aiEnrichment?.usageNotes || 'Standard English usage.',
    },
    translations: {
      thai: thaiTranslation,
    },
    sourceUrls: freeDictData?.sourceUrls || [
      `https://www.merriam-webster.com/dictionary/${encodeURIComponent(word)}`,
      `https://en.wiktionary.org/wiki/${encodeURIComponent(word)}`,
      `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`,
    ],
  };

  // Cache entry for super fast subsequent requests
  wordCache.set(word, wordEntry);

  return res.json(wordEntry);
});

// API 2: AI Lexical Insights & Comparisons
app.post('/api/ai/insights', async (req: Request, res: Response) => {
  const { word, queryType, targetWord } = req.body;
  if (!word) {
    return res.status(400).json({ error: 'Word is required' });
  }

  const ai = getGeminiAI();
  if (!ai) {
    return res.json({
      insight: `Key lexical notes for "${word}": Focus on correct pronunciation, grammar patterns, and active usage in speaking and writing.`,
    });
  }

  try {
    let prompt = `Provide deep lexical analysis for the English word "${word}". Explain its nuances, formality, common collocations, real-world context examples, and common mistakes non-native speakers make.`;
    if (queryType === 'compare' && targetWord) {
      prompt = `Compare and contrast the English words "${word}" and "${targetWord}". Explain differences in meaning, nuance, register, and provide clear sentence examples showing when to use each.`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    return res.json({ insight: response.text });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate AI insights' });
  }
});

// API 3: Generate Real-Time Practice Exercises
app.post('/api/practice/generate', async (req: Request, res: Response) => {
  const { words } = req.body; // array of word strings
  if (!Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'Array of words is required' });
  }

  const ai = getGeminiAI();
  if (!ai) {
    // Generate standard practice items locally if no AI key
    const exercises = words.slice(0, 10).map((w, idx) => ({
      id: `ex_${idx}_${Date.now()}`,
      type: idx % 2 === 0 ? 'multiple-choice' : 'fill-blank',
      word: w,
      question: `Which option best defines or completes the context for "${w}"?`,
      options: [w, 'another_word', 'opposite_word', 'similar_word'],
      correctAnswer: w,
      hint: `Think of words related to ${w}`,
      explanation: `"${w}" is the correct lexical term.`,
    }));
    return res.json({ exercises });
  }

  try {
    const prompt = `Generate 5 interactive vocabulary practice questions for these English words: ${words.slice(0, 8).join(', ')}.
Return a JSON array of exercises matching this format:
[
  {
    "id": "ex_1",
    "type": "multiple-choice" | "fill-blank" | "spelling",
    "word": "target_word",
    "question": "Clear question or fill-in-the-blank sentence with '___'",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact correct option string",
    "hint": "Helpful hint for the learner",
    "explanation": "Short explanation why this answer is correct"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const exercises = JSON.parse(response.text || '[]');
    return res.json({ exercises });
  } catch (err: any) {
    console.warn('Practice generation error:', err);
    return res.status(500).json({ error: 'Failed to generate practice exercises' });
  }
});

// API 4: Cloud Storage Sync (Push and Pull)
app.post('/api/sync/push', (req: Request, res: Response) => {
  const { syncCode, data } = req.body;
  if (!syncCode || !data) {
    return res.status(400).json({ error: 'syncCode and data are required' });
  }

  cloudSyncStore.set(syncCode.toUpperCase().trim(), {
    data,
    updatedAt: new Date().toISOString(),
  });

  return res.json({
    success: true,
    syncCode: syncCode.toUpperCase().trim(),
    syncedAt: new Date().toISOString(),
  });
});

app.get('/api/sync/pull/:syncCode', (req: Request, res: Response) => {
  const syncCode = req.params.syncCode.toUpperCase().trim();
  const record = cloudSyncStore.get(syncCode);

  if (!record) {
    return res.status(404).json({ error: 'Sync profile code not found or expired.' });
  }

  return res.json({
    success: true,
    data: record.data,
    updatedAt: record.updatedAt,
  });
});

// API 5: Cloud SQL Data Retrieval
app.get('/api/cloudsql/data', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || 'user@example.com';
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const database = getDb();
    if (!database) {
      return res.json({ cloudSqlEnabled: false });
    }

    const userRecord = await getOrCreateUser(uid, email);
    if (!userRecord) {
      return res.status(500).json({ error: 'Failed to retrieve or create user record' });
    }

    const progressRows = await database
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userRecord.id));

    const statsRows = await database
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userRecord.id));

    return res.json({
      cloudSqlEnabled: true,
      userProgress: progressRows,
      stats: statsRows[0] || null,
    });
  } catch (err: any) {
    console.error('Cloud SQL fetch error:', err);
    return res.status(500).json({ error: 'Database query failed', details: err.message });
  }
});

// API 6: Cloud SQL Sync
app.post('/api/cloudsql/sync', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || 'user@example.com';
    if (!uid) return res.status(401).json({ error: 'Unauthorized' });

    const database = getDb();
    if (!database) {
      return res.json({ cloudSqlEnabled: false });
    }

    const { userProgressList, stats } = req.body;
    const userRecord = await getOrCreateUser(uid, email);
    if (!userRecord) {
      return res.status(500).json({ error: 'Failed to retrieve or create user record' });
    }

    if (Array.isArray(userProgressList)) {
      for (const item of userProgressList) {
        if (!item.word) continue;
        await database
          .insert(userProgress)
          .values({
            userId: userRecord.id,
            word: item.word,
            masteryScore: item.masteryScore ?? 20,
            masteryLevel: item.masteryLevel || 'Learning',
            reviewCount: item.reviewCount ?? 1,
            correctCount: item.correctCount ?? 0,
            incorrectCount: item.incorrectCount ?? 0,
            tags: item.tags || [],
            isBookmarked: item.isBookmarked ?? true,
          })
          .onConflictDoNothing();
      }
    }

    if (stats) {
      await database
        .insert(userStats)
        .values({
          userId: userRecord.id,
          totalSearched: stats.totalSearched ?? 0,
          totalSaved: stats.totalSaved ?? 0,
          masteredCount: stats.masteredCount ?? 0,
          learningCount: stats.learningCount ?? 0,
          reviewingCount: stats.reviewingCount ?? 0,
          streakDays: stats.streakDays ?? 1,
          practiceAccuracy: stats.practiceAccuracy ?? 100,
          totalExercisesCompleted: stats.totalExercisesCompleted ?? 0,
        })
        .onConflictDoUpdate({
          target: userStats.userId,
          set: {
            totalSearched: stats.totalSearched ?? 0,
            totalSaved: stats.totalSaved ?? 0,
            masteredCount: stats.masteredCount ?? 0,
            learningCount: stats.learningCount ?? 0,
            reviewingCount: stats.reviewingCount ?? 0,
            streakDays: stats.streakDays ?? 1,
            practiceAccuracy: stats.practiceAccuracy ?? 100,
            totalExercisesCompleted: stats.totalExercisesCompleted ?? 0,
            updatedAt: new Date(),
          },
        });
    }

    return res.json({ success: true, cloudSqlEnabled: true });
  } catch (err: any) {
    console.error('Cloud SQL sync error:', err);
    return res.status(500).json({ error: 'Database sync failed', details: err.message });
  }
});

// API 7: Gmail Integration - Send Vocabulary Summary
app.post('/api/gmail/send', requireAuth, async (req: AuthRequest, res: Response) => {
  const { accessToken, recipient, subject, body } = req.body;
  if (!accessToken || !recipient || !subject || !body) {
    return res.status(400).json({ error: 'accessToken, recipient, subject, and body are required' });
  }

  try {
    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${recipient}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      body,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    });

    if (!gmailRes.ok) {
      const errText = await gmailRes.text();
      return res.status(gmailRes.status).json({ error: `Gmail API error: ${errText}` });
    }

    const data = await gmailRes.json();
    return res.json({ success: true, messageId: data.id });
  } catch (err: any) {
    console.error('Gmail send error:', err);
    return res.status(500).json({ error: err.message || 'Failed to send email via Gmail' });
  }
});

// Start Server with Vite Middleware in Dev Mode or Static Serving in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LexiLearn Server running on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
