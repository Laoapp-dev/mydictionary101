import React, { useState, useEffect } from 'react';
import {
  Target,
  Volume2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trophy,
  Award,
  Zap,
  HelpCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { WordEntry, UserWordProgress, PracticeType } from '../types';

interface PracticeSectionProps {
  savedProgress: UserWordProgress[];
  wordMap: Map<string, WordEntry>;
  onUpdateProgress: (progress: UserWordProgress) => void;
  onSelectWord: (word: string) => void;
}

export const PracticeSection: React.FC<PracticeSectionProps> = ({
  savedProgress,
  wordMap,
  onUpdateProgress,
  onSelectWord,
}) => {
  const [activeMode, setActiveMode] = useState<PracticeType>('flashcard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const practiceWords = savedProgress.length > 0 ? savedProgress : [];

  const currentProgress = practiceWords[currentIndex] || null;
  const currentWordEntry = currentProgress ? wordMap.get(currentProgress.word.toLowerCase()) : null;

  // Reset state on word index change
  useEffect(() => {
    setIsFlipped(false);
    setUserAnswer('');
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowHint(false);
  }, [currentIndex, activeMode]);

  const speak = (text: string, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      window.speechSynthesis.speak(u);
    }
  };

  const handleNextWord = () => {
    if (currentIndex < practiceWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const handleSelfEvaluate = (grade: 'easy' | 'good' | 'hard' | 'again') => {
    if (!currentProgress) return;

    let scoreDelta = 0;
    let nextMastery = currentProgress.masteryScore;

    if (grade === 'easy') {
      scoreDelta = 15;
      setStreak((s) => s + 1);
      setScore((sc) => sc + 20);
    } else if (grade === 'good') {
      scoreDelta = 10;
      setStreak((s) => s + 1);
      setScore((sc) => sc + 10);
    } else if (grade === 'hard') {
      scoreDelta = 3;
    } else {
      scoreDelta = -10;
      setStreak(0);
    }

    nextMastery = Math.min(100, Math.max(0, nextMastery + scoreDelta));
    let level: 'Learning' | 'Reviewing' | 'Mastered' = 'Learning';
    if (nextMastery >= 80) level = 'Mastered';
    else if (nextMastery >= 40) level = 'Reviewing';

    const updated: UserWordProgress = {
      ...currentProgress,
      masteryScore: nextMastery,
      masteryLevel: level,
      reviewCount: currentProgress.reviewCount + 1,
      correctCount: grade === 'easy' || grade === 'good' ? currentProgress.correctCount + 1 : currentProgress.correctCount,
      incorrectCount: grade === 'again' || grade === 'hard' ? currentProgress.incorrectCount + 1 : currentProgress.incorrectCount,
      lastReviewed: new Date().toISOString(),
    };

    onUpdateProgress(updated);
    handleNextWord();
  };

  const handleCheckAnswer = (selected: string) => {
    if (!currentProgress || isAnswerSubmitted) return;
    setSelectedOption(selected);
    setIsAnswerSubmitted(true);

    const isCorrect = selected.toLowerCase().trim() === currentProgress.word.toLowerCase().trim();
    if (isCorrect) {
      setStreak((s) => s + 1);
      setScore((sc) => sc + 15);
      handleSelfEvaluate('good');
    } else {
      setStreak(0);
    }
  };

  if (practiceWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl text-center shadow-xl space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          No Saved Words in Your Practice List Yet
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Search any English word in the dictionary tab and click the bookmark icon to add words to your real-time vocabulary practice exercises.
        </p>
      </div>
    );
  }

  // Generate options for multiple choice
  const options = React.useMemo(() => {
    if (!currentProgress) return [];
    const correctWord = currentProgress.word;
    const distractors = practiceWords
      .filter((w) => w.word !== correctWord)
      .map((w) => w.word);

    const pool = ['resilient', 'eloquent', 'meticulous', 'empathy', 'pragmatic', 'tenacious', ...distractors];
    const shuffled = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
    return [correctWord, ...shuffled].sort(() => 0.5 - Math.random());
  }, [currentProgress, practiceWords]);

  return (
    <div className="max-w-4xl mx-auto my-6 p-4 sm:p-6 space-y-6">
      
      {/* Header Bar: Score, Streak, Mode Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-sm">
        
        {/* Practice Mode Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setActiveMode('flashcard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'flashcard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎴 Flashcards
          </button>

          <button
            onClick={() => setActiveMode('multiple-choice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'multiple-choice'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎯 Quiz
          </button>

          <button
            onClick={() => setActiveMode('fill-blank')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'fill-blank'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📝 Fill in Blanks
          </button>

          <button
            onClick={() => setActiveMode('synonym-match')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'synonym-match'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔗 Synonyms & Antonyms
          </button>

          <button
            onClick={() => setActiveMode('spelling')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === 'spelling'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ✍️ Spelling
          </button>
        </div>

        {/* Gamification Counters: Streak & Score */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Streak: {streak}</span>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-indigo-500/30">
            <Trophy className="w-4 h-4 text-indigo-400" />
            <span>Score: {score}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / practiceWords.length) * 100}%` }}
        />
      </div>

      {/* MODE 1: FLASHCARDS */}
      {activeMode === 'flashcard' && currentProgress && (
        <div className="space-y-6">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full min-h-[320px] p-8 rounded-3xl bg-white dark:bg-[#1E293B] border-2 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:scale-[1.01] relative overflow-hidden"
          >
            <span className="absolute top-4 right-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              Click to Flip Card
            </span>

            {!isFlipped ? (
              /* Front of Card: Word & Audio */
              <div className="text-center space-y-4">
                <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white capitalize">
                  {currentProgress.word}
                </h2>
                {currentWordEntry?.phonetic && (
                  <p className="text-lg font-mono text-indigo-600 dark:text-indigo-400">
                    {currentWordEntry.phonetic}
                  </p>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(currentProgress.word);
                  }}
                  className="p-3.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Volume2 className="w-6 h-6" />
                </button>
              </div>
            ) : (
              /* Back of Card: Definitions & Translations */
              <div className="text-center space-y-4 max-w-lg">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 uppercase tracking-widest">
                  {currentWordEntry?.meanings[0]?.partOfSpeech || 'definition'}
                </span>
                <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                  {currentWordEntry?.meanings[0]?.definitions[0]?.definition || `Definition for ${currentProgress.word}`}
                </p>

                {currentWordEntry?.translations?.thai?.translation && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-800 dark:text-amber-300">
                    🇹🇭 Thai: {currentWordEntry.translations.thai.translation}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Self-Rating Controls */}
          {isFlipped && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleSelfEvaluate('again')}
                className="py-3 px-4 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30 hover:bg-rose-500/20 transition-all text-xs"
              >
                🔴 Again (Reset)
              </button>
              <button
                onClick={() => handleSelfEvaluate('hard')}
                className="py-3 px-4 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30 hover:bg-amber-500/20 transition-all text-xs"
              >
                🟡 Hard
              </button>
              <button
                onClick={() => handleSelfEvaluate('good')}
                className="py-3 px-4 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/30 hover:bg-sky-500/20 transition-all text-xs"
              >
                🔵 Good
              </button>
              <button
                onClick={() => handleSelfEvaluate('easy')}
                className="py-3 px-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 hover:bg-emerald-500/20 transition-all text-xs"
              >
                🟢 Easy (+Mastery)
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: MULTIPLE CHOICE QUIZ */}
      {activeMode === 'multiple-choice' && currentProgress && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Which word matches this definition?
            </span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              "{currentWordEntry?.meanings[0]?.definitions[0]?.definition || `Word related to ${currentProgress.word}`}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrectOpt = opt.toLowerCase() === currentProgress.word.toLowerCase();

              let btnStyle = "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20";
              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  btnStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 font-bold";
                } else if (isSelected) {
                  btnStyle = "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50 font-bold";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleCheckAnswer(opt)}
                  disabled={isAnswerSubmitted}
                  className={`p-4 rounded-2xl border text-left font-bold capitalize transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {isAnswerSubmitted && (
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextWord}
                className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center space-x-2"
              >
                <span>Next Exercise</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: FILL IN THE BLANKS */}
      {activeMode === 'fill-blank' && currentProgress && (() => {
        const example = currentWordEntry?.meanings[0]?.definitions[0]?.example;
        const definition = currentWordEntry?.meanings[0]?.definitions[0]?.definition || '';
        const regex = new RegExp(`\\b${currentProgress.word}\\b`, 'gi');
        const sentenceWithBlank = example && regex.test(example)
          ? example.replace(regex, '___________')
          : `Fill in missing term: "___________" refers to: ${definition}`;

        return (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="space-y-3 text-center sm:text-left">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Complete the Sentence
              </span>
              <p className="text-xl font-bold text-slate-900 dark:text-white leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                "{sentenceWithBlank}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt.toLowerCase() === currentProgress.word.toLowerCase();

                let btnStyle = "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20";
                if (isAnswerSubmitted) {
                  if (isCorrectOpt) {
                    btnStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50 font-bold";
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleCheckAnswer(opt)}
                    disabled={isAnswerSubmitted}
                    className={`p-4 rounded-2xl border text-left font-bold capitalize transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswerSubmitted && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextWord}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <span>Next Exercise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* MODE 4: SYNONYMS & ANTONYMS MATCHING */}
      {activeMode === 'synonym-match' && currentProgress && (() => {
        const syns = currentWordEntry?.synonyms || [];
        const ants = currentWordEntry?.antonyms || [];
        const isSynonymQuestion = syns.length > 0 || ants.length === 0;
        const targetRelation = isSynonymQuestion ? 'SYNONYM (Similar meaning)' : 'ANTONYM (Opposite meaning)';
        const targetAnswers = isSynonymQuestion ? syns : ants;
        const correctAnswer = targetAnswers[0] || (isSynonymQuestion ? 'similar concept' : 'opposite concept');

        // Distractor options
        const matchOptions = [
          correctAnswer,
          'unrelated term',
          'contrasting idea',
          'distinct phrase'
        ].sort(() => 0.5 - Math.random());

        return (
          <div className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            <div className="space-y-2 text-center sm:text-left">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                Synonym & Antonym Matching
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                Target Word: <span className="text-indigo-600 dark:text-indigo-400">{currentProgress.word}</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select the correct <span className="font-bold text-slate-900 dark:text-white">{targetRelation}</span> for "{currentProgress.word}":
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchOptions.map((opt) => {
                const isSelected = selectedOption === opt;
                const isCorrectOpt = opt.toLowerCase() === correctAnswer.toLowerCase();

                let btnStyle = "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/20";
                if (isAnswerSubmitted) {
                  if (isCorrectOpt) {
                    btnStyle = "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/50 font-bold";
                  } else if (isSelected) {
                    btnStyle = "bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/50 font-bold";
                  }
                }

                return (
                  <button
                    key={opt}
                    onClick={() => {
                      if (!currentProgress || isAnswerSubmitted) return;
                      setSelectedOption(opt);
                      setIsAnswerSubmitted(true);
                      if (opt.toLowerCase() === correctAnswer.toLowerCase()) {
                        setStreak((s) => s + 1);
                        setScore((sc) => sc + 15);
                        handleSelfEvaluate('good');
                      } else {
                        setStreak(0);
                      }
                    }}
                    disabled={isAnswerSubmitted}
                    className={`p-4 rounded-2xl border text-left font-bold capitalize transition-all ${btnStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            {isAnswerSubmitted && (
              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleNextWord}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <span>Next Exercise</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* MODE 5: SPELLING BEE */}
      {activeMode === 'spelling' && currentProgress && (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
              Listen & Spell the Word
            </span>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => speak(currentProgress.word)}
                className="p-4 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/30"
              >
                <Volume2 className="w-8 h-8" />
              </button>
            </div>
            <p className="text-xs text-slate-500">Click audio button to listen to pronunciation</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckAnswer(userAnswer);
            }}
            className="max-w-md mx-auto space-y-4"
          >
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type exact spelling..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-xl font-bold tracking-widest text-slate-900 dark:text-white outline-none focus:border-indigo-500"
            />

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors"
            >
              Submit Answer
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
