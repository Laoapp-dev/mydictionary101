import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Calendar,
  Shuffle,
  ArrowRight,
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
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [shuffleIndex, setShuffleIndex] = useState<number | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Format date display (e.g., "Sat, Aug 1")
  const dateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
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

  return (
    <div className="w-full rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-all duration-300">
      {/* Compact single-row header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-500/10 via-transparent to-amber-500/10 dark:from-indigo-950/40 dark:to-amber-950/20 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-3 h-3 fill-amber-400 text-amber-500" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 truncate">
            Word of the Day
          </span>
          {shuffleIndex !== null && (
            <span className="hidden sm:inline px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 shrink-0">
              Shuffled
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <span className="hidden xs:flex items-center space-x-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            <Calendar className="w-2.5 h-2.5 text-indigo-400" />
            <span>{dateFormatted}</span>
          </span>
          <button
            onClick={handleDiscoverAnother}
            className="p-1 rounded-md bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-indigo-500 transition-all border border-slate-200 dark:border-slate-700"
            title="Shuffle another word"
          >
            <Shuffle className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Compact body: Word, pronunciation, part of speech only */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2">
          {/* Word + phonetic + part of speech */}
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white capitalize tracking-tight truncate">
                {wordEntry.word}
              </h3>
              {firstMeaning?.partOfSpeech && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 shrink-0">
                  {firstMeaning.partOfSpeech}
                </span>
              )}
            </div>
            {wordEntry.phonetic && (
              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {wordEntry.phonetic}
              </p>
            )}
          </div>

          {/* Action icons: audio, bookmark */}
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => handlePlayAudio(wordEntry.word)}
              className={`p-1.5 rounded-lg transition-all ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white scale-105 shadow-sm shadow-indigo-500/30'
                  : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
              }`}
              title="Listen to pronunciation"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>

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
        </div>

        {/* View full details link */}
        <button
          onClick={() => onSelectWord(wordEntry.word)}
          className="mt-2.5 w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] transition-all shadow-sm shadow-indigo-600/20 flex items-center justify-center space-x-1"
        >
          <span>View Full Word Details</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
