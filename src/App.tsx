import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { QuickSearchBar } from './components/QuickSearchBar';
import { WordCard } from './components/WordCard';
import { PracticeSection } from './components/PracticeSection';
import { ProgressDashboard } from './components/ProgressDashboard';
import { WordOfTheDay } from './components/WordOfTheDay';
import { SettingsView } from './components/SettingsView';

import { WordEntry, UserWordProgress, StudyStats } from './types';
import { localDb } from './lib/indexedDb';
import { INITIAL_OFFLINE_WORDS } from './data/offlinePacks';
import { parseWordCsv, parseWordJson } from './utils/wordImport';

export default function App() {
  const [activeTab, setActiveTab] = useState<'search' | 'daily' | 'practice' | 'dashboard' | 'settings'>('search');
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Display Theme & Network Status
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('lexilearn_theme_mode');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    const legacy = localStorage.getItem('lexilearn_theme');
    if (legacy === 'dark') return 'dark';
    if (legacy === 'light') return 'light';
    return 'system';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const mode = localStorage.getItem('lexilearn_theme_mode') || localStorage.getItem('lexilearn_theme');
    if (mode === 'dark') return true;
    if (mode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isOfflineModeForce, setIsOfflineModeForce] = useState<boolean>(false);

  // Active Word Search & Dictionary State
  const [currentWord, setCurrentWord] = useState<string>('resilient');
  const [wordEntry, setWordEntry] = useState<WordEntry | null>(null);
  const [isLoadingWord, setIsLoadingWord] = useState<boolean>(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // User Progress, Saved Words, Stats
  const [userProgressList, setUserProgressList] = useState<UserWordProgress[]>([]);
  const [wordMap, setWordMap] = useState<Map<string, WordEntry>>(new Map());
  const [stats, setStats] = useState<StudyStats>({
    totalSearched: 0,
    totalSaved: 0,
    masteredCount: 0,
    learningCount: 0,
    reviewingCount: 0,
    streakDays: 1,
    lastActiveDate: new Date().toISOString(),
    practiceAccuracy: 100,
    totalExercisesCompleted: 0,
  });

  // Cloud Sync Code
  const [syncCode, setSyncCode] = useState<string>(() => {
    const saved = localStorage.getItem('lexilearn_sync_code');
    if (saved) return saved;
    const newCode = `LEXI-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('lexilearn_sync_code', newCode);
    return newCode;
  });

  // Apply Dark / Light Theme Mode Class to HTML Root & Body
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let dark = false;
      if (themeMode === 'dark') {
        dark = true;
      } else if (themeMode === 'light') {
        dark = false;
      } else {
        dark = mediaQuery.matches;
      }

      setIsDarkMode(dark);
      if (dark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
      localStorage.setItem('lexilearn_theme_mode', themeMode);
      localStorage.setItem('lexilearn_theme', dark ? 'dark' : 'light');
    };

    applyTheme();

    const handleSystemThemeChange = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [themeMode]);

  // Network Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize IndexedDB & Seed Initial Offline Dictionary Words
  useEffect(() => {
    const initDb = async () => {
      try {
        await localDb.init();
        await localDb.saveBatchWords(INITIAL_OFFLINE_WORDS);

        // Load saved progress & stats
        const progressList = await localDb.getAllUserProgress();
        if (progressList && progressList.length > 0) {
          setUserProgressList(progressList);
        } else {
          // Pre-seed user progress with real dictionary words so practice mode has initial content
          const initialProgress: UserWordProgress[] = INITIAL_OFFLINE_WORDS.map((w, idx) => ({
            word: w.word,
            masteryScore: idx % 3 === 0 ? 45 : 20,
            masteryLevel: idx % 3 === 0 ? 'Reviewing' : 'Learning',
            lastReviewed: new Date().toISOString(),
            nextReviewDate: new Date().toISOString(),
            reviewCount: idx % 3 === 0 ? 2 : 0,
            correctCount: idx % 3 === 0 ? 2 : 0,
            incorrectCount: 0,
            tags: ['essential'],
            isBookmarked: true,
            addedAt: new Date().toISOString(),
          }));
          setUserProgressList(initialProgress);
          for (const p of initialProgress) {
            await localDb.saveWordProgress(p);
          }
        }

        const loadedStats = await localDb.getStats();
        setStats(loadedStats);

        // Build word map for practice exercises
        const map = new Map<string, WordEntry>();
        for (const w of INITIAL_OFFLINE_WORDS) {
          map.set(w.word.toLowerCase(), w);
        }
        setWordMap(map);

        // Check URL parameters for shared word
        const urlParams = new URLSearchParams(window.location.search);
        const sharedWord = urlParams.get('word');
        if (sharedWord) {
          handleSearchWord(sharedWord);
        } else {
          handleSearchWord('resilient');
        }
      } catch (err) {
        console.error('Failed to initialize local IndexedDB:', err);
      }
    };

    initDb();
  }, []);

  // Main Word Search Handler
  const handleSearchWord = useCallback(async (searchQuery: string) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return;

    setCurrentWord(q);
    setIsLoadingWord(true);

    // Update Search History
    setSearchHistory((prev) => Array.from(new Set([q, ...prev])).slice(0, 10));

    const isEffectiveOffline = !isOnline || isOfflineModeForce;

    try {
      // 1. First check local IndexedDB
      const localWord = await localDb.getWord(q);
      if (localWord) {
        setWordEntry(localWord);
        setWordMap((prev) => new Map(prev).set(q, localWord));
        setIsLoadingWord(false);
        return;
      }

      // 2. If online and not forced offline, call Express server API or static fallback
      if (!isEffectiveOffline) {
        try {
          const res = await fetch(`/api/dictionary/${encodeURIComponent(q)}`);
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            const remoteEntry: WordEntry = await res.json();
            setWordEntry(remoteEntry);
            setWordMap((prev) => new Map(prev).set(q, remoteEntry));
            
            // Save fetched word to IndexedDB for offline access in the future!
            await localDb.saveWord(remoteEntry);
            setIsLoadingWord(false);
            return;
          }
        } catch (serverErr) {
          console.warn('Server API not reachable, trying client-side public API fallback (e.g. GitHub Pages hosting)');
        }

        // Client-side API Fallback for static hosting (GitHub Pages) & Offline API sync
        try {
          const [freeDictRes, synRes, antRes] = await Promise.all([
            fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(q)}`),
            fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(q)}`),
            fetch(`https://api.datamuse.com/words?rel_ant=${encodeURIComponent(q)}`),
          ]);

          let freeDictData: any = null;
          if (freeDictRes.ok) {
            const arr = await freeDictRes.json();
            if (arr && arr[0]) freeDictData = arr[0];
          }

          let thesaurusSynonyms: string[] = [];
          if (synRes.ok) {
            const synArr = await synRes.json();
            if (Array.isArray(synArr)) thesaurusSynonyms = synArr.map((item: any) => item.word);
          }

          let thesaurusAntonyms: string[] = [];
          if (antRes.ok) {
            const antArr = await antRes.json();
            if (Array.isArray(antArr)) thesaurusAntonyms = antArr.map((item: any) => item.word);
          }

          if (freeDictData || thesaurusSynonyms.length > 0) {
            const data = freeDictData || {};
            const phonetic = data.phonetic || data.phonetics?.find((p: any) => p.text)?.text || `/${q}/`;
            const audioUrl = data.phonetics?.find((p: any) => p.audio && p.audio.trim().length > 0)?.audio || '';

            const meanings = (data.meanings || []).map((m: any) => ({
              partOfSpeech: m.partOfSpeech,
              definitions: (m.definitions || []).map((d: any) => ({
                definition: d.definition,
                example: d.example || '',
              })),
              synonyms: m.synonyms || [],
              antonyms: m.antonyms || [],
            }));

            const combinedSyns = Array.from(
              new Set([
                ...thesaurusSynonyms,
                ...(data.meanings || []).flatMap((m: any) => m.synonyms || []),
              ])
            ).slice(0, 15);

            const combinedAnts = Array.from(
              new Set([
                ...thesaurusAntonyms,
                ...(data.meanings || []).flatMap((m: any) => m.antonyms || []),
              ])
            ).slice(0, 10);

            // Construct Merriam-Webster Dictionary fallback structure
            const mwCollegiate = meanings.map((m: any) => ({
              partOfSpeech: m.partOfSpeech || 'general',
              definitions: m.definitions.map((d: any) => d.definition),
              example: m.definitions.find((d: any) => d.example)?.example || '',
            }));

            const clientEntry: WordEntry = {
              word: data.word || q,
              phonetic,
              phonetics: data.phonetics || [{ text: phonetic, audio: audioUrl }],
              meanings: meanings.length > 0 ? meanings : [
                {
                  partOfSpeech: 'general',
                  definitions: [{ definition: `Definition and usage for ${q}` }],
                },
              ],
              synonyms: combinedSyns,
              antonyms: combinedAnts,
              audioUrl,
              merriamWebster: {
                collegiate: mwCollegiate,
              },
              sources: ['Free Dictionary API', 'Datamuse Thesaurus API', 'Merriam-Webster Reference'],
              lexicalInsights: {
                cefrLevel: 'B1',
                etymology: data.origin || 'Etymology and word origins available in reference materials.',
                memoryTip: `To remember "${q}", connect it to its primary definition: ${meanings[0]?.definitions[0]?.definition || q}.`,
                collocations: [`common ${q}`, `use ${q}`, `study ${q}`],
                wordFamily: [q],
                usageNotes: 'Standard usage in modern English vocabulary.',
              },
              translations: {
                thai: {
                  translation: `${q}`,
                  phonetic: `${q}`,
                  example: `Usage example for ${q}.`,
                  exampleTranslation: `Example translation for ${q}.`,
                },
              },
              sourceUrls: [
                `https://www.merriam-webster.com/dictionary/${encodeURIComponent(q)}`,
                `https://en.wiktionary.org/wiki/${encodeURIComponent(q)}`,
              ],
            };

            setWordEntry(clientEntry);
            setWordMap((prev) => new Map(prev).set(q, clientEntry));
            await localDb.saveWord(clientEntry);
            setIsLoadingWord(false);
            return;
          }
        } catch (clientApiErr) {
          console.warn('Client-side API fallback failed:', clientApiErr);
        }
      }

      // 3. Offline fallback search in local IndexedDB
      const offlineMatches = await localDb.searchOfflineWords(q, 1);
      if (offlineMatches.length > 0) {
        setWordEntry(offlineMatches[0]);
      } else {
        // Fallback placeholder for unknown term
        const fallbackEntry: WordEntry = {
          word: q,
          phonetic: `/${q}/`,
          phonetics: [{ text: `/${q}/` }],
          meanings: [
            {
              partOfSpeech: 'general',
              definitions: [
                {
                  definition: `Detailed dictionary definition for "${q}". Connect to internet or download offline packs to access full lexical analysis.`,
                  example: `They studied the meaning of ${q}.`,
                },
              ],
            },
          ],
          synonyms: [],
          antonyms: [],
          translations: {
            thai: { translation: q, phonetic: q },
          },
        };
        setWordEntry(fallbackEntry);
      }
    } catch (err) {
      console.warn('Word search failed:', err);
    } finally {
      setIsLoadingWord(false);
    }
  }, [isOnline, isOfflineModeForce]);

  // Bookmark / Unbookmark Word for Practice List
  const handleToggleBookmark = async (entry: WordEntry) => {
    const existing = userProgressList.find((w) => w.word.toLowerCase() === entry.word.toLowerCase());

    if (existing) {
      const updatedList = userProgressList.filter((w) => w.word.toLowerCase() !== entry.word.toLowerCase());
      setUserProgressList(updatedList);
      await localDb.removeWordProgress(entry.word);
    } else {
      const newProgress: UserWordProgress = {
        word: entry.word,
        masteryScore: 20,
        masteryLevel: 'Learning',
        lastReviewed: new Date().toISOString(),
        nextReviewDate: new Date().toISOString(),
        reviewCount: 0,
        correctCount: 0,
        incorrectCount: 0,
        tags: ['practice'],
        isBookmarked: true,
        addedAt: new Date().toISOString(),
      };

      const updatedList = [newProgress, ...userProgressList];
      setUserProgressList(updatedList);
      await localDb.saveWordProgress(newProgress);
    }
  };

  // Update Progress from Practice Exercises
  const handleUpdateProgress = async (updated: UserWordProgress) => {
    const nextList = userProgressList.map((p) =>
      p.word.toLowerCase() === updated.word.toLowerCase() ? updated : p
    );
    setUserProgressList(nextList);
    await localDb.saveWordProgress(updated);

    // Update stats
    const nextStats: StudyStats = {
      ...stats,
      totalExercisesCompleted: stats.totalExercisesCompleted + 1,
      lastActiveDate: new Date().toISOString(),
    };
    setStats(nextStats);
    await localDb.saveStats(nextStats);
  };

  const handleImportCsv = (csvStr: string): boolean => {
    try {
      const lines = csvStr.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length < 2) return false;

      const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
      const wordIdx = headers.indexOf('word');
      if (wordIdx === -1) return false;

      const scoreIdx = headers.indexOf('masteryscore');
      const levelIdx = headers.indexOf('masterylevel');

      const importedList: UserWordProgress[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/"/g, '').trim());
        const word = cols[wordIdx];
        if (!word) continue;

        const score = scoreIdx !== -1 && !isNaN(Number(cols[scoreIdx])) ? Number(cols[scoreIdx]) : 20;
        const levelVal = levelIdx !== -1 ? cols[levelIdx] : 'Learning';
        const level: 'Learning' | 'Reviewing' | 'Mastered' =
          levelVal === 'Mastered' || levelVal === 'Reviewing' ? levelVal : 'Learning';

        const item: UserWordProgress = {
          word,
          masteryScore: score,
          masteryLevel: level,
          lastReviewed: new Date().toISOString(),
          nextReviewDate: new Date().toISOString(),
          reviewCount: 1,
          correctCount: level === 'Mastered' ? 1 : 0,
          incorrectCount: 0,
          tags: ['imported'],
          isBookmarked: true,
          addedAt: new Date().toISOString(),
        };

        importedList.push(item);
        localDb.saveWordProgress(item);
      }

      if (importedList.length > 0) {
        setUserProgressList((prev) => {
          const map = new Map<string, UserWordProgress>();
          for (const item of importedList) map.set(item.word.toLowerCase(), item);
          for (const item of prev) {
            if (!map.has(item.word.toLowerCase())) map.set(item.word.toLowerCase(), item);
          }
          return Array.from(map.values());
        });
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  // Import full vocabulary content (word, definition, partOfSpeech, cefrLevel,
  // exampleSentence, synonym, antonym, category, difficulty, laoTranslation,
  // thaiTranslation) from the Word Content template, in CSV or JSON format.
  const handleImportWordContent = async (
    content: string,
    fileType: 'csv' | 'json'
  ): Promise<{ success: boolean; count: number; errors: string[] }> => {
    const { entries, errors } = fileType === 'csv' ? parseWordCsv(content) : parseWordJson(content);

    if (entries.length === 0) {
      return { success: false, count: 0, errors: errors.length ? errors : ['No valid rows found.'] };
    }

    // Persist full word entries so they're searchable & usable offline.
    await localDb.saveBatchWords(entries);
    setWordMap((prev) => {
      const next = new Map(prev);
      for (const e of entries) next.set(e.word.toLowerCase(), e);
      return next;
    });

    // Also add them to the user's practice list so they immediately show up
    // on the practice / flip cards.
    const now = new Date().toISOString();
    const newProgressItems: UserWordProgress[] = entries.map((e) => ({
      word: e.word,
      masteryScore: 20,
      masteryLevel: 'Learning',
      lastReviewed: now,
      nextReviewDate: now,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      tags: ['imported', e.category].filter(Boolean) as string[],
      isBookmarked: true,
      addedAt: now,
    }));

    setUserProgressList((prev) => {
      const map = new Map<string, UserWordProgress>();
      for (const item of prev) map.set(item.word.toLowerCase(), item);
      for (const item of newProgressItems) {
        if (!map.has(item.word.toLowerCase())) map.set(item.word.toLowerCase(), item);
      }
      return Array.from(map.values());
    });
    for (const item of newProgressItems) {
      await localDb.saveWordProgress(item);
    }

    return { success: true, count: entries.length, errors };
  };

  const handleFactoryReset = async () => {
    await localDb.clearAllData();
    setUserProgressList([]);
    const initialStats: StudyStats = {
      totalSearched: 0,
      totalSaved: 0,
      masteredCount: 0,
      learningCount: 0,
      reviewingCount: 0,
      streakDays: 1,
      lastActiveDate: new Date().toISOString(),
      practiceAccuracy: 100,
      totalExercisesCompleted: 0,
    };
    setStats(initialStats);
    await localDb.saveStats(initialStats);
  };

  const currentWordUserProgress = userProgressList.find(
    (w) => w.word.toLowerCase() === currentWord.toLowerCase()
  ) || null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20 md:pb-8">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setThemeMode(isDarkMode ? 'light' : 'dark')}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        isOnline={isOnline}
        isOfflineModeForce={isOfflineModeForce}
        toggleOfflineForce={() => setIsOfflineModeForce(!isOfflineModeForce)}
        bookmarkedCount={userProgressList.length}
        deferredPrompt={deferredPrompt}
        onInstallPwa={handleInstallPwa}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: DICTIONARY & SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <QuickSearchBar
              onSearch={handleSearchWord}
              isLoading={isLoadingWord}
              searchHistory={searchHistory}
              isOfflineMode={!isOnline || isOfflineModeForce}
              onSelectHistory={handleSearchWord}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Main Column: Searched Word Card */}
              <div className="lg:col-span-8 xl:col-span-8 space-y-6">
                {isLoadingWord ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">Searching definitions & translations...</p>
                  </div>
                ) : wordEntry ? (
                  <WordCard
                    entry={wordEntry}
                    userProgress={currentWordUserProgress}
                    onToggleBookmark={handleToggleBookmark}
                    onSelectWord={handleSearchWord}
                  />
                ) : null}
              </div>

              {/* Right Column: Sleek Compact Vertical Card for Word of the Day on Desktop */}
              <div className="hidden lg:block lg:col-span-4 xl:col-span-4 space-y-6 max-w-sm ml-auto w-full">
                <WordOfTheDay
                  offlineWords={INITIAL_OFFLINE_WORDS}
                  userProgressList={userProgressList}
                  onToggleBookmark={handleToggleBookmark}
                  onSelectWord={(word) => {
                    handleSearchWord(word);
                    setActiveTab('search');
                  }}
                  onNavigateToPractice={() => setActiveTab('practice')}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WORD OF THE DAY (Dedicated View for Mobile & Nav Menu) */}
        {activeTab === 'daily' && (
          <div className="max-w-md mx-auto space-y-6 py-2 animate-in fade-in duration-200">
            <div className="text-center space-y-1 mb-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center space-x-2">
                <span>Daily Vocabulary Spotlight</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expand your lexicon daily with curated insights & Thai translations
              </p>
            </div>

            <WordOfTheDay
              offlineWords={INITIAL_OFFLINE_WORDS}
              userProgressList={userProgressList}
              onToggleBookmark={handleToggleBookmark}
              onSelectWord={(word) => {
                setActiveTab('search');
                handleSearchWord(word);
              }}
              onNavigateToPractice={() => setActiveTab('practice')}
            />
          </div>
        )}

        {/* TAB 2: REAL-TIME PRACTICE EXERCISES */}
        {activeTab === 'practice' && (
          <PracticeSection
            savedProgress={userProgressList}
            wordMap={wordMap}
            onUpdateProgress={handleUpdateProgress}
            onSelectWord={handleSearchWord}
          />
        )}

        {/* TAB 3: LEARNER PROGRESS DASHBOARD */}
        {activeTab === 'dashboard' && (
          <ProgressDashboard
            userProgressList={userProgressList}
            stats={stats}
            onSelectWord={(word) => {
              setActiveTab('search');
              handleSearchWord(word);
            }}
            onRefreshStats={async () => {
              const freshStats = await localDb.getStats();
              setStats(freshStats);
            }}
            onNavigateToPractice={() => setActiveTab('practice')}
          />
        )}

        {/* TAB 4: APPLICATION PREFERENCES & SETTINGS */}
        {activeTab === 'settings' && (
          <SettingsView
            userProgressList={userProgressList}
            stats={stats}
            themeMode={themeMode}
            onSetThemeMode={setThemeMode}
            deferredPrompt={deferredPrompt}
            onInstallPwa={handleInstallPwa}
            onImportWordContent={handleImportWordContent}
            onImportJson={(jsonStr) => {
              try {
                const parsed = JSON.parse(jsonStr);
                let importedProgress: UserWordProgress[] = [];

                if (Array.isArray(parsed)) {
                  importedProgress = parsed;
                } else if (parsed && Array.isArray(parsed.userProgressList)) {
                  importedProgress = parsed.userProgressList;
                }

                if (importedProgress.length > 0) {
                  setUserProgressList((prev) => {
                    const map = new Map<string, UserWordProgress>();
                    for (const item of importedProgress) {
                      if (item.word) map.set(item.word.toLowerCase(), item);
                    }
                    for (const item of prev) {
                      if (!map.has(item.word.toLowerCase())) map.set(item.word.toLowerCase(), item);
                    }
                    return Array.from(map.values());
                  });

                  for (const p of importedProgress) {
                    if (p.word) localDb.saveWordProgress(p);
                  }

                  if (parsed.stats) {
                    setStats(parsed.stats);
                    localDb.saveStats(parsed.stats);
                  }
                  return true;
                }
              } catch (err) {
                return false;
              }
              return false;
            }}
            onImportCsv={handleImportCsv}
            onFactoryReset={handleFactoryReset}
          />
        )}

      </main>
    </div>
  );
}
