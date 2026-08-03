import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Shuffle,
  ArrowRight,
  Lightbulb,
  Globe,
  Zap,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import { WordEntry, UserWordProgress } from '../types';

interface WordOfTheDayProps {
  offlineWords: WordEntry[];
  userProgressList: UserWordProgress[];
  onToggleBookmark: (entry: WordEntry) => void;
  onSelectWord: (word: string) => void;
  onNavigateToPractice?: () => void;
}

export const WordOfTheDay: React.FC<WordOfTheDayProps> = ({
  offlineWords,
  userProgressList,
  onToggleBookmark,
  onSelectWord,
  onNavigateToPractice,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState<number | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Format date display (e.g., "Saturday, August 1")
  const dateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Deterministic daily word algorithm
  const dailyWordIndex = useMemo(() => {
    if (!offlineWords || offlineWords.length === 0) return 0;
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = todayStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % offlineWords.length;
  }, [offlineWords, todayStr]);

  const activeIndex = shuffleIndex !== null ? shuffleIndex : dailyWordIndex;
  const wordEntry: WordEntry | undefined = offlineWords[activeIndex] || offlineWords[0];

  const userProgress = useMemo(() => {
    if (!wordEntry) return null;
    return userProgressList.find((p) => p.word.toLowerCase() === wordEntry.word.toLowerCase()) || null;
  }, [wordEntry, userProgressList]);

  const isBookmarked = userProgress?.isBookmarked || false;

  // Speak word TTS
  const handlePlayAudio = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleDiscoverAnother = () => {
    if (!offlineWords || offlineWords.length <= 1) return;
    let newIdx = Math.floor(Math.random() * offlineWords.length);
    if (newIdx === activeIndex) {
      newIdx = (newIdx + 1) % offlineWords.length;
    }
    setShuffleIndex(newIdx);
  };

  if (!wordEntry) return null;

  const firstMeaning = wordEntry.meanings?.[0];
  const firstDefinition = firstMeaning?.definitions?.[0];

  return (
    <div className="w-full relative rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-all duration-300 flex flex-col">
      
      {/* Decorative Glow Element */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-amber-500/10 dark:bg-amber-400/15 rounded-full blur-xl pointer-events-none" />

      {/* Vertical Card Header Section */}
      <div className="px-4 py-3 bg-gradient-to-b from-indigo-900/10 via-sky-800/5 to-amber-900/10 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-amber-950/30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Word of the Day
                </span>
                {shuffleIndex !== null && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    Shuffled
                  </span>
                )}
              </div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                <Calendar className="w-2.5 h-2.5 text-indigo-400" />
                <span>{dateFormatted}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleDiscoverAnother}
            className="px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all border border-slate-200 dark:border-slate-700 flex items-center space-x-1 shadow-sm text-[11px] font-bold"
            title="Shuffle another word"
          >
            <Shuffle className="w-3 h-3 text-indigo-500" />
            <span>Random</span>
          </button>
        </div>
      </div>

      {/* Card Main Body */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        
        <div className="space-y-2.5">
          {/* CEFR Level Tag & Bookmark Button */}
          <div className="flex items-center justify-between">
            {wordEntry.lexicalInsights?.cefrLevel ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-indigo-600 text-white tracking-wide shadow-sm">
                CEFR {wordEntry.lexicalInsights.cefrLevel}
              </span>
            ) : (
              <span />
            )}

            <button
              onClick={() => onToggleBookmark(wordEntry)}
              className={`p-1.5 rounded-lg border transition-all ${
                isBookmarked
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 dark:text-amber-400'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title={isBookmarked ? 'Bookmarked' : 'Save word'}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              ) : (
                <Bookmark className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* Word Heading & Audio */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                {wordEntry.word}
              </h3>
              {wordEntry.phonetic && (
                <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {wordEntry.phonetic}
                </p>
              )}
            </div>

            <button
              onClick={() => handlePlayAudio(wordEntry.word)}
              className={`p-2 rounded-lg transition-all ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white scale-105 shadow-md shadow-indigo-500/30'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Part of Speech & Definition */}
          {firstDefinition && (
            <div className="space-y-1 pt-0.5">
              {firstMeaning?.partOfSpeech && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 inline-block">
                  {firstMeaning.partOfSpeech}
                </span>
              )}

              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug line-clamp-3">
                {firstDefinition.definition}
              </p>

              {firstDefinition.example && (
                <div className="bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border-l-2 border-indigo-500 text-[11px] italic text-slate-600 dark:text-slate-300">
                  "{firstDefinition.example}"
                </div>
              )}
            </div>
          )}

          {/* Thai Translation */}
          {wordEntry.translations?.thai && (
            <div className="p-2.5 rounded-lg bg-amber-500/5 dark:bg-slate-900/70 border border-amber-500/20 dark:border-slate-800 space-y-0.5">
              <div className="text-[9px] font-bold text-slate-400 flex items-center space-x-1">
                <span>🇹🇭</span>
                <span>Thai Translation</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300 font-thai">
                {wordEntry.translations.thai.translation}
              </p>
              {wordEntry.translations.thai.phonetic && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                  ({wordEntry.translations.thai.phonetic})
                </p>
              )}
            </div>
          )}

          {/* Memory Tip */}
          {wordEntry.lexicalInsights?.memoryTip && (
            <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-start space-x-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 dark:text-amber-100 font-medium leading-tight">
                <strong className="font-extrabold">Tip: </strong>
                {wordEntry.lexicalInsights.memoryTip}
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <button
            onClick={() => onSelectWord(wordEntry.word)}
            className="w-full py-2 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center space-x-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Full Word Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          {onNavigateToPractice && (
            <button
              onClick={onNavigateToPractice}
              className="w-full py-1.5 px-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-[11px] transition-all flex items-center justify-center space-x-1"
            >
              <Zap className="w-3 h-3" />
              <span>Practice Exercises</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
