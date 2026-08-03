import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Mic, History, Sparkles, CornerDownLeft, Command } from 'lucide-react';

interface QuickSearchBarProps {
  onSearch: (word: string) => void;
  isLoading: boolean;
  searchHistory: string[];
  isOfflineMode: boolean;
  onSelectHistory: (word: string) => void;
}

export const QuickSearchBar: React.FC<QuickSearchBarProps> = ({
  onSearch,
  isLoading,
  searchHistory,
  isOfflineMode,
  onSelectHistory,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut Ctrl/Cmd + K to focus search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch real-time autocompletion suggestions from Datamuse API when online
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      if (!isOfflineMode) {
        try {
          const res = await fetch(`https://api.datamuse.com/sug?s=${encodeURIComponent(query)}&max=6`);
          if (res.ok) {
            const data = await res.json();
            const words = data.map((item: any) => item.word);
            setSuggestions(words);
          }
        } catch (err) {
          console.warn('Autocompletion fetch failed:', err);
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, isOfflineMode]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (word: string) => {
    setQuery(word);
    onSearch(word);
    setShowDropdown(false);
  };

  // Voice speech-to-text recognition
  const handleVoiceSearch = () => {
    const windowObj = window as any;
    const SpeechRecognition = windowObj.SpeechRecognition || windowObj.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          onSearch(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const quickPopularWords = ['resilient', 'eloquent', 'meticulous', 'empathy', 'ubiquitous', 'pragmatic'];

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto my-6">
      
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-zinc-400 dark:text-zinc-500">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={isOfflineMode ? "Search offline dictionary (e.g. resilient, empathy)..." : "Search English word, synonyms, or definitions..."}
          className="w-full pl-12 pr-28 py-4 text-base sm:text-lg font-medium rounded-2xl bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 shadow-xl shadow-slate-200/50 dark:shadow-none outline-none transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500"
        />

        {/* Action Controls Inside Search Box */}
        <div className="absolute right-3 flex items-center space-x-1.5">
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Search by Voice Speech"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center space-x-1"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5 hidden sm:inline" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Keyboard Hint Pill */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
        <div className="flex items-center space-x-2 overflow-x-auto py-1 no-scrollbar">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Try:</span>
          {quickPopularWords.map((word) => (
            <button
              key={word}
              type="button"
              onClick={() => {
                setQuery(word);
                onSearch(word);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap text-xs border border-slate-200/50 dark:border-slate-700/50"
            >
              {word}
            </button>
          ))}
        </div>

        <div className="hidden sm:flex items-center space-x-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
          <Command className="w-3 h-3" />
          <span>K</span>
        </div>
      </div>

      {/* Dropdown Suggestions & History */}
      {showDropdown && (suggestions.length > 0 || searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          
          {/* Autocomplete Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Suggestions</span>
              </div>
              {suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSelectSuggestion(sug)}
                  className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-between"
                >
                  <span>{sug}</span>
                  <Search className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          )}

          {/* Recent Search History */}
          {searchHistory.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                <History className="w-3 h-3 text-slate-400" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5 p-1">
                {searchHistory.slice(0, 8).map((hist) => (
                  <button
                    key={hist}
                    onClick={() => {
                      setQuery(hist);
                      onSelectHistory(hist);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 hover:text-indigo-400 transition-colors flex items-center space-x-1 border border-slate-200/50 dark:border-slate-700/50"
                  >
                    <span>{hist}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
