import React, { useState } from 'react';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  Globe,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Share2,
  Check,
  Layers,
  Lightbulb,
  History,
} from 'lucide-react';
import { WordEntry, UserWordProgress } from '../types';

interface WordCardProps {
  entry: WordEntry;
  userProgress: UserWordProgress | null;
  onToggleBookmark: (entry: WordEntry) => void;
  onSelectWord: (word: string) => void;
  onOpenAiDeepDive?: (word: string) => void;
}

export const WordCard: React.FC<WordCardProps> = ({
  entry,
  userProgress,
  onToggleBookmark,
  onSelectWord,
  onOpenAiDeepDive,
}) => {
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [activeTab, setActiveTab] = useState<'meanings' | 'translations'>('meanings');
  const [copiedLink, setCopiedLink] = useState(false);

  const isBookmarked = userProgress?.isBookmarked || false;

  // Speak word using Web Speech API or Audio Element
  const handlePlayAudio = (textToSpeak: string, lang = 'en-US') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = lang;
      utterance.rate = speechRate;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else if (entry.audioUrl) {
      const audio = new Audio(entry.audioUrl);
      audio.playbackRate = speechRate;
      audio.play();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?word=${entry.word}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const thaiTrans = entry.translations?.thai;
  const insights = entry.lexicalInsights;

  // External Dictionary Links
  const externalLinks = [
    {
      name: 'Cambridge',
      url: `https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(entry.word)}`,
      bg: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900',
    },
    {
      name: 'Oxford',
      url: `https://www.oxfordlearnersdictionaries.com/definition/english/${encodeURIComponent(entry.word)}`,
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900',
    },
    {
      name: 'Merriam-Webster',
      url: `https://www.merriam-webster.com/dictionary/${encodeURIComponent(entry.word)}`,
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900',
    },
    {
      name: 'Wikimedia / Wiktionary',
      url: `https://en.wiktionary.org/wiki/${encodeURIComponent(entry.word)}`,
      bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900',
    },
    {
      name: 'Google Search',
      url: `https://www.google.com/search?q=definition+of+${encodeURIComponent(entry.word)}`,
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto my-4 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300">
      
      {/* Top Banner: Word Title, Phonetic & Speech Controls */}
      <div className="p-6 sm:p-8 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white capitalize tracking-tight">
                {entry.word}
              </h1>

              {/* CEFR Level Badge */}
              {insights?.cefrLevel && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm">
                  {insights.cefrLevel}
                </span>
              )}

              {/* User Mastery Pill */}
              {userProgress && (
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  userProgress.masteryLevel === 'Mastered'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : userProgress.masteryLevel === 'Reviewing'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30'
                }`}>
                  {userProgress.masteryLevel} ({userProgress.masteryScore}%)
                </span>
              )}
            </div>

            {/* Phonetic Pronunciation Text & Audio Phonetic Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {entry.phonetic && (
                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-mono text-sm font-semibold flex items-center space-x-1.5">
                  <span>🔊 {entry.phonetic}</span>
                </span>
              )}

              {/* Individual Audio Phonetics (e.g. US / UK variants) */}
              {entry.phonetics && entry.phonetics.length > 0 && entry.phonetics.map((p, idx) => {
                if (!p.text && !p.audio) return null;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      if (p.audio) {
                        const audio = new Audio(p.audio);
                        audio.playbackRate = speechRate;
                        audio.play();
                      } else {
                        handlePlayAudio(entry.word);
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-500/20 text-slate-700 dark:text-slate-300 font-mono text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1"
                    title={p.audio ? "Play phonetic audio track" : "Listen to pronunciation"}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{p.text || entry.word}</span>
                  </button>
                );
              })}
            </div>


          </div>

          {/* Action Buttons: Audio, Speed, Bookmark, Share */}
          <div className="flex items-center space-x-2">
            
            {/* Speed selector */}
            <button
              onClick={() => setSpeechRate(speechRate === 1.0 ? 0.75 : 1.0)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Pronunciation Speed (1.0x Normal / 0.75x Slow)"
            >
              {speechRate}x
            </button>

            {/* Audio Playback Button */}
            <button
              onClick={() => handlePlayAudio(entry.word)}
              disabled={isPlayingAudio}
              className={`p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center space-x-2 ${
                isPlayingAudio ? 'animate-pulse ring-2 ring-indigo-400' : ''
              }`}
              title="Listen to English Pronunciation"
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-xs font-semibold hidden sm:inline">Listen</span>
            </button>

            {/* Bookmark for Practice */}
            <button
              onClick={() => onToggleBookmark(entry)}
              className={`p-3 rounded-2xl border transition-all ${
                isBookmarked
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              title={isBookmarked ? "Remove from Practice List" : "Save for Vocabulary Practice"}
            >
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>

            {/* Share / Copy Button */}
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              title="Copy Word Link"
            >
              {copiedLink ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Content Body: Definitions & Part of Speech */}
      <div className="p-6 sm:p-8 space-y-8">
        
        {/* Meanings grouped by Part of Speech */}
        <div className="space-y-6">
          {entry.meanings.map((meaning, mIdx) => (
            <div key={mIdx} className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700">
                  {meaning.partOfSpeech}
                </span>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
              </div>

              {/* Definitions List */}
              <ol className="space-y-3 pl-2">
                {meaning.definitions.map((def, dIdx) => (
                  <li key={dIdx} className="text-slate-800 dark:text-slate-200 text-base leading-relaxed">
                    <div className="flex items-start space-x-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm mt-0.5">
                        {dIdx + 1}.
                      </span>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{def.definition}</p>

                        {/* Example Sentence */}
                        {def.example && (
                          <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-2xl border-l-4 border-indigo-500 my-1.5 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                              Example Sentence
                            </span>
                            <p className="text-sm italic font-medium text-slate-800 dark:text-slate-200">
                              "{def.example}"
                            </p>
                          </div>
                        )}

                        {/* Definition-level Synonyms/Antonyms if available */}
                        {def.synonyms && def.synonyms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Synonyms:</span>
                            {def.synonyms.map((s) => (
                              <button
                                key={s}
                                onClick={() => onSelectWord(s)}
                                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}

                        {def.antonyms && def.antonyms.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Antonyms:</span>
                            {def.antonyms.map((a) => (
                              <button
                                key={a}
                                onClick={() => onSelectWord(a)}
                                className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20"
                              >
                                {a}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        {/* Synonyms & Antonyms Interactive Chips */}
        {(entry.synonyms.length > 0 || entry.antonyms.length > 0) && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            
            {/* Synonyms */}
            {entry.synonyms.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Synonyms (Similar Words)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entry.synonyms.map((syn) => (
                    <button
                      key={syn}
                      onClick={() => onSelectWord(syn)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
                    >
                      {syn}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Antonyms */}
            {entry.antonyms.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-rose-500" />
                  <span>Antonyms (Opposite Words)</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entry.antonyms.map((ant) => (
                    <button
                      key={ant}
                      onClick={() => onSelectWord(ant)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors"
                    >
                      {ant}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Merriam-Webster Reference Section (Collegiate & Learner APIs) */}
        {entry.merriamWebster && (entry.merriamWebster.collegiate || entry.merriamWebster.learner) && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Merriam-Webster References
                </h3>
              </div>
              <a
                href={`https://www.merriam-webster.com/dictionary/${encodeURIComponent(entry.word)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center space-x-1"
              >
                <span>Official Webster Entry</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Collegiate Reference Box */}
              {entry.merriamWebster.collegiate && entry.merriamWebster.collegiate.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-slate-900/80 border border-emerald-500/20 dark:border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                      Collegiate Dictionary
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {entry.merriamWebster.collegiate.map((mw, idx) => (
                      <div key={idx} className="space-y-1 pb-2 border-b border-emerald-500/10 dark:border-slate-800 last:border-0 last:pb-0">
                        {mw.partOfSpeech && (
                          <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mr-2">
                            [{mw.partOfSpeech}]
                          </span>
                        )}
                        <ul className="list-disc list-inside space-y-1">
                          {mw.definitions.map((d, dIdx) => (
                            <li key={dIdx} className="font-medium text-slate-900 dark:text-slate-100">
                              {d}
                            </li>
                          ))}
                        </ul>
                        {mw.example && (
                          <p className="italic text-slate-500 dark:text-slate-400 pl-3">
                            "{mw.example}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learner's Reference Box */}
              {entry.merriamWebster.learner && entry.merriamWebster.learner.length > 0 && (
                <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-slate-900/80 border border-teal-500/20 dark:border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-500/20 text-teal-700 dark:text-teal-300">
                      Learner's Dictionary
                    </span>
                  </div>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {entry.merriamWebster.learner.map((mw, idx) => (
                      <div key={idx} className="space-y-1 pb-2 border-b border-teal-500/10 dark:border-slate-800 last:border-0 last:pb-0">
                        {mw.partOfSpeech && (
                          <span className="font-mono text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase mr-2">
                            [{mw.partOfSpeech}]
                          </span>
                        )}
                        <ul className="list-disc list-inside space-y-1">
                          {mw.definitions.map((d, dIdx) => (
                            <li key={dIdx} className="font-medium text-slate-900 dark:text-slate-100">
                              {d}
                            </li>
                          ))}
                        </ul>
                        {mw.example && (
                          <p className="italic text-slate-500 dark:text-slate-400 pl-3">
                            "{mw.example}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lexical Insights Section (Etymology, Memory Tip, Word Families) */}
        {insights && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/50 dark:bg-slate-900/40">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left font-bold text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Lexical Insights & Memory Tips</span>
              </div>
              {showInsights ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showInsights && (
              <div className="px-5 pb-5 space-y-4 pt-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border-t border-slate-200/50 dark:border-slate-800">
                
                {/* Memory Tip */}
                {insights.memoryTip && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-amber-900 dark:text-amber-200">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">Mnemonic Memory Tip: </span>
                      <span>{insights.memoryTip}</span>
                    </div>
                  </div>
                )}

                {/* Etymology */}
                {insights.etymology && (
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Etymology & Origin: </span>
                    <span>{insights.etymology}</span>
                  </div>
                )}

                {/* Collocations & Word Family */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {insights.collocations && insights.collocations.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Common Collocations:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400">
                        {insights.collocations.map((col, cIdx) => (
                          <li key={cIdx}>{col}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.wordFamily && insights.wordFamily.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">Word Family:</span>
                      <div className="flex flex-wrap gap-1">
                        {insights.wordFamily.map((fam, fIdx) => (
                          <span key={fIdx} className="px-2 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs">
                            {fam}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOTTOM OF WORD CARD: Thai (ไทย) Translation for Learners */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Thai Translation for Southeast Asian Learners
            </h2>
          </div>

          {/* Full Width Thai Translation Box */}
          <div className="w-full p-5 rounded-2xl bg-amber-500/5 dark:bg-slate-900/80 border border-amber-500/20 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">🇹🇭</span>
                <div>
                  <span className="font-bold text-base text-slate-900 dark:text-slate-100">Thai Translation</span>
                  <span className="ml-2 text-xs font-thai text-amber-700 dark:text-amber-400">(ภาษาไทย)</span>
                </div>
              </div>

              {thaiTrans?.translation && (
                <button
                  onClick={() => handlePlayAudio(thaiTrans.translation, 'th-TH')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-colors font-medium text-xs border border-amber-500/20"
                  title="Speak Thai Translation"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Listen Thai</span>
                </button>
              )}
            </div>

            {thaiTrans ? (
              <div className="space-y-3">
                <p className="text-xl sm:text-2xl font-bold font-thai text-amber-950 dark:text-amber-200">
                  {thaiTrans.translation}
                </p>
                {thaiTrans.phonetic && (
                  <p className="text-sm font-mono text-amber-700 dark:text-amber-400">
                    Pronunciation Guide: <span className="font-semibold">{thaiTrans.phonetic}</span>
                  </p>
                )}
                {thaiTrans.example && (
                  <div className="pt-3 border-t border-amber-500/20 dark:border-slate-800 text-xs sm:text-sm">
                    <p className="font-medium text-slate-800 dark:text-slate-200">Example: "{thaiTrans.example}"</p>
                    {thaiTrans.exampleTranslation && (
                      <p className="text-slate-500 dark:text-slate-400 mt-1 italic">({thaiTrans.exampleTranslation})</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">Thai translation loading...</p>
            )}
          </div>
        </div>

        {/* EXTERNAL OUTSOURCES LINK BUTTONS */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            External Lexical Resources & Outsources
          </p>
          <div className="flex flex-wrap gap-2">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex items-center space-x-1.5 shadow-sm"
              >
                <span>{link.name}</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
