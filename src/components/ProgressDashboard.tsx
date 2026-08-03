import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  CheckCircle,
  Flame,
  Award,
  BookMarked,
  BrainCircuit,
  TrendingUp,
  Clock,
  RefreshCw,
  Search,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  Target,
  Sparkles,
  Zap,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { UserWordProgress, StudyStats, MasteryLevel } from '../types';

interface ProgressDashboardProps {
  userProgressList: UserWordProgress[];
  stats: StudyStats;
  onSelectWord: (word: string) => void;
  onRefreshStats: () => void;
  onNavigateToPractice?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  userProgressList,
  stats,
  onSelectWord,
  onRefreshStats,
  onNavigateToPractice,
}) => {
  const [filterLevel, setFilterLevel] = useState<'ALL' | MasteryLevel | 'BOOKMARKED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'score_desc' | 'score_asc' | 'reviews'>('recent');

  // Calculated Stats
  const totalSaved = userProgressList.length;
  const masteredList = useMemo(() => userProgressList.filter((w) => w.masteryLevel === 'Mastered'), [userProgressList]);
  const reviewingList = useMemo(() => userProgressList.filter((w) => w.masteryLevel === 'Reviewing'), [userProgressList]);
  const learningList = useMemo(() => userProgressList.filter((w) => w.masteryLevel === 'Learning'), [userProgressList]);

  const masteredPct = totalSaved > 0 ? Math.round((masteredList.length / totalSaved) * 100) : 0;
  const reviewingPct = totalSaved > 0 ? Math.round((reviewingList.length / totalSaved) * 100) : 0;
  const learningPct = totalSaved > 0 ? Math.round((learningList.length / totalSaved) * 100) : 0;

  // Words due for spaced repetition review
  const dueForReviewList = useMemo(() => {
    const now = new Date();
    return userProgressList.filter((w) => {
      if (!w.nextReviewDate) return true;
      return new Date(w.nextReviewDate) <= now || w.masteryScore < 80;
    });
  }, [userProgressList]);

  // Aggregate exercise accuracy
  const totalCorrect = useMemo(
    () => userProgressList.reduce((acc, curr) => acc + (curr.correctCount || 0), 0),
    [userProgressList]
  );
  const totalAttempts = useMemo(
    () => userProgressList.reduce((acc, curr) => acc + (curr.correctCount || 0) + (curr.incorrectCount || 0), 0),
    [userProgressList]
  );
  const calculatedAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : stats.practiceAccuracy || 100;

  // Filtered & Sorted Word History List
  const filteredWords = useMemo(() => {
    let result = [...userProgressList];

    // Filter level
    if (filterLevel === 'BOOKMARKED') {
      result = result.filter((w) => w.isBookmarked);
    } else if (filterLevel !== 'ALL') {
      result = result.filter((w) => w.masteryLevel === filterLevel);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastReviewed || b.addedAt || 0).getTime() - new Date(a.lastReviewed || a.addedAt || 0).getTime();
      }
      if (sortBy === 'score_desc') {
        return b.masteryScore - a.masteryScore;
      }
      if (sortBy === 'score_asc') {
        return a.masteryScore - b.masteryScore;
      }
      if (sortBy === 'reviews') {
        return b.reviewCount - a.reviewCount;
      }
      return 0;
    });

    return result;
  }, [userProgressList, filterLevel, searchQuery, sortBy]);

  // Relative time helper
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Not reviewed yet';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 2) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-5xl mx-auto my-6 p-4 sm:p-6 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white shadow-xl relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-7 h-7" />
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Learner Progress Dashboard
            </h1>
          </div>
          <p className="text-indigo-100 text-sm max-w-xl">
            Real-time tracking for vocabulary mastery, practice accuracy, spaced repetition schedule, and daily learning habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10 self-stretch md:self-auto">
          {onNavigateToPractice && (
            <button
              onClick={onNavigateToPractice}
              className="px-5 py-3 rounded-2xl bg-white text-indigo-700 hover:bg-sky-50 font-extrabold text-xs transition-all shadow-lg flex items-center justify-center space-x-2 flex-1 md:flex-none"
            >
              <Zap className="w-4 h-4 text-indigo-600" />
              <span>Practice Exercises</span>
            </button>
          )}

          <button
            onClick={onRefreshStats}
            className="px-4 py-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center justify-center space-x-1.5"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Primary Key Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Daily Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-500">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Flame className="w-6 h-6 fill-amber-500 text-amber-500" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Streak</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.streakDays} <span className="text-sm font-semibold text-slate-500">Days</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-amber-500" />
              <span>Last active: {formatRelativeTime(stats.lastActiveDate)}</span>
            </p>
          </div>
        </div>

        {/* Total Words Saved & Learned */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-indigo-500">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <BookMarked className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Saved</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {totalSaved} <span className="text-sm font-semibold text-slate-500">Terms</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active vocabulary bank
            </p>
          </div>
        </div>

        {/* Mastered Count */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-emerald-500">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Mastered</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {masteredList.length} <span className="text-sm font-semibold text-slate-500">({masteredPct}%)</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Score ≥ 80% accuracy
            </p>
          </div>
        </div>

        {/* Practice Exercise Accuracy */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between text-sky-500">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Accuracy</span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {calculatedAccuracy}%
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.totalExercisesCompleted || totalAttempts} exercises done
            </p>
          </div>
        </div>

      </div>

      {/* Vocabulary Mastery Distribution & Spaced Repetition */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-indigo-500" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Vocabulary Mastery & Spaced Repetition
            </h2>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Due for Review: <strong className="text-indigo-600 dark:text-indigo-400">{dueForReviewList.length} words</strong></span>
          </div>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Progress Breakdown</span>
            <span>{totalSaved} Total Words Saved</span>
          </div>

          <div className="w-full h-5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden flex p-1 border border-slate-200 dark:border-slate-700/60">
            <div
              className="bg-emerald-500 h-full rounded-l-xl transition-all duration-500"
              style={{ width: `${masteredPct}%` }}
              title={`Mastered: ${masteredList.length} (${masteredPct}%)`}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${reviewingPct}%` }}
              title={`Reviewing: ${reviewingList.length} (${reviewingPct}%)`}
            />
            <div
              className="bg-sky-500 h-full rounded-r-xl transition-all duration-500"
              style={{ width: `${learningPct}%` }}
              title={`Learning: ${learningList.length} (${learningPct}%)`}
            />
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-200 font-bold text-sm">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Mastered (80-100%)</span>
              </span>
              <span className="text-base">{masteredList.length}</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              High retention & automatic recall. Keep it up!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-200 font-bold text-sm">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Reviewing (40-79%)</span>
              </span>
              <span className="text-base">{reviewingList.length}</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Developing vocabulary terms needing periodic quiz practice.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 space-y-1">
            <div className="flex items-center justify-between text-sky-800 dark:text-sky-200 font-bold text-sm">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>Learning (0-39%)</span>
              </span>
              <span className="text-base">{learningList.length}</span>
            </div>
            <p className="text-xs text-sky-700 dark:text-sky-400">
              Newly saved words requiring initial flashcard drills.
            </p>
          </div>
        </div>
      </div>

      {/* Vocabulary Study History Table & Search Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-6 h-6 text-indigo-500" />
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Vocabulary Study History & Practice List
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredWords.length} of {totalSaved} saved words
              </p>
            </div>
          </div>

          {/* Search Bar inside History */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter words..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setFilterLevel('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLevel === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({totalSaved})
            </button>

            <button
              onClick={() => setFilterLevel('Learning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLevel === 'Learning'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Learning ({learningList.length})
            </button>

            <button
              onClick={() => setFilterLevel('Reviewing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLevel === 'Reviewing'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Reviewing ({reviewingList.length})
            </button>

            <button
              onClick={() => setFilterLevel('Mastered')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLevel === 'Mastered'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mastered ({masteredList.length})
            </button>

            <button
              onClick={() => setFilterLevel('BOOKMARKED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterLevel === 'BOOKMARKED'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ★ Bookmarked
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center space-x-2 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold outline-none cursor-pointer"
            >
              <option value="recent">Recently Reviewed</option>
              <option value="score_desc">Highest Mastery</option>
              <option value="score_asc">Lowest Mastery</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>

        </div>

        {/* Word History List Table */}
        {filteredWords.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No vocabulary terms match your filter criteria
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Search words in the main dictionary tab or change your filter selection to view tracked study items.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto pr-1">
            {filteredWords.map((prog) => {
              const attempts = (prog.correctCount || 0) + (prog.incorrectCount || 0);
              const accuracyPct = attempts > 0 ? Math.round((prog.correctCount / attempts) * 100) : 100;

              return (
                <div
                  key={prog.word}
                  className="py-3.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-2xl transition-all"
                >
                  {/* Left: Word, Badge, & Stats */}
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span
                        onClick={() => onSelectWord(prog.word)}
                        className="font-extrabold text-base text-slate-900 dark:text-white capitalize cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {prog.word}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          prog.masteryLevel === 'Mastered'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : prog.masteryLevel === 'Reviewing'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30'
                        }`}
                      >
                        {prog.masteryLevel}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 dark:text-slate-400">
                      <span>{prog.reviewCount} reviews</span>
                      <span>•</span>
                      <span>{prog.correctCount}/{attempts} correct ({accuracyPct}%)</span>
                      <span>•</span>
                      <span>Last reviewed: {formatRelativeTime(prog.lastReviewed)}</span>
                    </div>
                  </div>

                  {/* Right: Mastery Score Bar & Practice Button */}
                  <div className="flex items-center space-x-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="w-28 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/60">
                        <div
                          className={`h-full transition-all ${
                            prog.masteryLevel === 'Mastered'
                              ? 'bg-emerald-500'
                              : prog.masteryLevel === 'Reviewing'
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          }`}
                          style={{ width: `${prog.masteryScore}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                        {prog.masteryScore}% Score
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectWord(prog.word)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all flex items-center space-x-1"
                    >
                      <span>Study</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
