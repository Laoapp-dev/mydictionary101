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
    <div className="w-full max-w-4xl mx-auto my-4 relative rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
      
      {/* Decorative Glow Element */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      {/* Top Banner Header Section */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-900/10 via-sky-800/5 to-amber-900/10 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-amber-950/30 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300 flex items-center justify-center font-bold shadow-sm">
              <Sparkles className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Word of the Day
                </span>
                {shuffleIndex !== null && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30">
                    Explored
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center space-x-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{dateFormatted}</span>
              </p>
            </div>
          </div>

          {/* CEFR Level Tag & Shuffle Button */}
          <div className="flex items-center space-x-2">
            {wordEntry.lexicalInsights?.cefrLevel && (
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-600 text-white shadow-sm shadow-indigo-600/20">
                Level {wordEntry.lexicalInsights.cefrLevel}
              </span>
            )}

            <button
              onClick={handleDiscoverAnother}
              className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center space-x-1.5 shadow-sm"
              title="Discover another word"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-500" />
              <span>Shuffle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Body Section */}
      <div className="p-6 sm:p-8 space-y-6">
        
        {/* Word & Audio Speaker Row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                {wordEntry.word}
              </h2>

              <button
                onClick={() => handlePlayAudio(wordEntry.word)}
                className={`p-2.5 rounded-2xl transition-all ${
                  isPlayingAudio
                    ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30'
                    : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                }`}
                title="Listen to pronunciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {wordEntry.phonetic && (
              <p className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mt-1">
                {wordEntry.phonetic}
              </p>
            )}
          </div>

          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(wordEntry)}
            className={`p-3 rounded-2xl border transition-all ${
              isBookmarked
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 dark:text-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
            title={isBookmarked ? 'Bookmarked' : 'Save word'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 fill-amber-500 text-amber-500" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Main Definition & Usage Example */}
        {firstDefinition && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {firstMeaning?.partOfSpeech && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                  {firstMeaning.partOfSpeech}
                </span>
              )}
            </div>

            <p className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {firstDefinition.definition}
            </p>

            {firstDefinition.example && (
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border-l-4 border-indigo-500 my-1.5 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                  Example Sentence
                </span>
                <p className="text-sm italic font-medium text-slate-800 dark:text-slate-200">
                  "{firstDefinition.example}"
                </p>
              </div>
            )}
          </div>
        )}

        {/* Memory Tip or Lexical Insight */}
        {wordEntry.lexicalInsights?.memoryTip && (
          <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-extrabold text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                Memory Tip
              </p>
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-100 font-medium mt-0.5">
                {wordEntry.lexicalInsights.memoryTip}
              </p>
            </div>
          </div>
        )}

        {/* Thai Translation Preview */}
        {wordEntry.translations?.thai && (
          <div className="w-full">
            <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 dark:border-slate-800 space-y-1">
              <div className="flex items-center space-x-1.5 text-slate-400 font-bold text-xs">
                <span>🇹🇭</span>
                <span>Thai Translation (ภาษาไทย)</span>
              </div>
              <p className="text-lg font-extrabold text-amber-900 dark:text-amber-300 font-thai">
                {wordEntry.translations.thai.translation}
              </p>
              {wordEntry.translations.thai.phonetic && (
                <p className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                  Pronunciation: ({wordEntry.translations.thai.phonetic})
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Footer Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onSelectWord(wordEntry.word)}
            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-600/20 flex items-center space-x-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Study Full Word Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onNavigateToPractice && (
            <button
              onClick={onNavigateToPractice}
              className="px-4 py-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-bold text-xs transition-all flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Practice Exercises</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
