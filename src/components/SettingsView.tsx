import React, { useState, useRef } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HardDrive,
  ShieldCheck,
  Database,
  Library,
  Table
} from 'lucide-react';
import { UserWordProgress, StudyStats } from '../types';
import { WORD_TEMPLATE_HEADERS } from '../utils/wordImport';

interface SettingsViewProps {
  userProgressList: UserWordProgress[];
  stats: StudyStats;
  themeMode: 'light' | 'dark' | 'system';
  onSetThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  onImportJson: (jsonStr: string) => boolean;
  onImportCsv: (csvStr: string) => boolean;
  onImportWordContent: (
    content: string,
    fileType: 'csv' | 'json'
  ) => Promise<{ success: boolean; count: number; errors: string[] }>;
  onFactoryReset: () => Promise<void>;
  deferredPrompt?: any;
  onInstallPwa?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProgressList,
  stats,
  themeMode,
  onSetThemeMode,
  onImportJson,
  onImportCsv,
  onImportWordContent,
  onFactoryReset,
  deferredPrompt,
  onInstallPwa,
}) => {
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [wordDragActive, setWordDragActive] = useState<boolean>(false);
  const [isImportingWords, setIsImportingWords] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Export JSON Backup
  const handleExportJson = () => {
    try {
      const exportData = {
        app: 'MyDictionary101',
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        stats,
        userProgressList,
        totalWords: userProgressList.length,
      };

      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `mydictionary101_backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', `Exported ${userProgressList.length} vocabulary words to JSON backup file!`);
    } catch (err) {
      showToast('error', 'Failed to generate JSON backup file.');
    }
  };

  // Export CSV Format
  const handleExportCsv = () => {
    try {
      if (userProgressList.length === 0) {
        showToast('error', 'No vocabulary progress to export yet.');
        return;
      }

      let csv = 'Word,Mastery Score,Mastery Level,Review Count,Correct Count,Added At\n';
      userProgressList.forEach((item) => {
        const word = `"${item.word.replace(/"/g, '""')}"`;
        const score = item.masteryScore || 0;
        const level = `"${item.masteryLevel || 'Learning'}"`;
        const reviewCount = item.reviewCount || 0;
        const correctCount = item.correctCount || 0;
        const addedAt = `"${item.addedAt || ''}"`;
        csv += `${word},${score},${level},${reviewCount},${correctCount},${addedAt}\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `mydictionary101_vocabulary_${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', `Exported ${userProgressList.length} words to CSV spreadsheet!`);
    } catch (err) {
      showToast('error', 'Failed to generate CSV export file.');
    }
  };

  // Process Imported File
  const handleFileChange = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) {
        showToast('error', 'The uploaded file is empty.');
        return;
      }

      if (file.name.endsWith('.json')) {
        const success = onImportJson(content);
        if (success) {
          showToast('success', 'Successfully restored vocabulary data from JSON backup!');
        } else {
          showToast('error', 'Invalid JSON backup format. Please check your backup file.');
        }
      } else if (file.name.endsWith('.csv')) {
        const success = onImportCsv(content);
        if (success) {
          showToast('success', 'Successfully imported vocabulary words from CSV file!');
        } else {
          showToast('error', 'Invalid CSV structure. CSV must contain a "Word" column.');
        }
      } else {
        showToast('error', 'Unsupported file type. Please upload a .json or .csv backup file.');
      }
    };

    reader.onerror = () => {
      showToast('error', 'Error reading uploaded file.');
    };

    reader.readAsText(file);
  };

  // ---- Word Content Import Template (word/definition/partOfSpeech/etc.) ----

  const wordTemplateSampleRows = [
    {
      word: 'resilient',
      definition: 'Able to withstand or recover quickly from difficult conditions.',
      partOfSpeech: 'adjective',
      cefrLevel: 'B2',
      exampleSentence: 'She showed a remarkably resilient spirit after the setback.',
      synonym: 'adaptable; tough; tenacious',
      antonym: 'fragile; vulnerable',
      category: 'Personality',
      difficulty: 'Medium',
      laoTranslation: 'ທົນທານ',
      thaiTranslation: 'ยืดหยุ่น',
    },
    {
      word: 'empathy',
      definition: 'The capacity to understand and share the feelings of another.',
      partOfSpeech: 'noun',
      cefrLevel: 'B2',
      exampleSentence: 'Showing empathy towards teammates fosters trust.',
      synonym: 'compassion; understanding',
      antonym: 'apathy; indifference',
      category: 'Emotions',
      difficulty: 'Medium',
      laoTranslation: 'ຄວາມເຫັນອົກເຫັນໃຈ',
      thaiTranslation: 'ความเห็นอกเห็นใจ',
    },
  ];

  const handleDownloadCsvTemplate = () => {
    const headerRow = WORD_TEMPLATE_HEADERS.join(',');
    const dataRows = wordTemplateSampleRows.map((row) =>
      WORD_TEMPLATE_HEADERS.map((h) => `"${String((row as any)[h] ?? '').replace(/"/g, '""')}"`).join(',')
    );
    const csv = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mydictionary101_word_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJsonTemplate = () => {
    const jsonStr = JSON.stringify({ words: wordTemplateSampleRows }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mydictionary101_word_import_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleWordContentFileChange = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) {
        showToast('error', 'The uploaded file is empty.');
        return;
      }
      const fileType: 'csv' | 'json' | null = file.name.endsWith('.csv')
        ? 'csv'
        : file.name.endsWith('.json')
        ? 'json'
        : null;
      if (!fileType) {
        showToast('error', 'Unsupported file type. Please upload a .csv or .json word template file.');
        return;
      }

      setIsImportingWords(true);
      try {
        const result = await onImportWordContent(content, fileType);
        if (result.success) {
          const errSuffix = result.errors.length ? ` (${result.errors.length} row(s) skipped)` : '';
          showToast('success', `Imported ${result.count} word(s) from the template${errSuffix}.`);
        } else {
          showToast('error', result.errors[0] || 'Import failed. Please check the template format.');
        }
      } finally {
        setIsImportingWords(false);
      }
    };
    reader.onerror = () => showToast('error', 'Error reading uploaded file.');
    reader.readAsText(file);
  };

  const handleWordDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWordDragActive(true);
  };
  const handleWordDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWordDragActive(false);
  };
  const handleWordDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWordDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleWordContentFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Perform Factory Reset
  const confirmFactoryReset = async () => {
    try {
      setIsResetting(true);
      await onFactoryReset();
      setShowResetConfirmModal(false);
      showToast('success', 'Factory reset completed. All vocabulary and study data restored to default state.');
    } catch (err) {
      showToast('error', 'Failed to perform factory reset.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 sm:right-8 z-50 flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-500/95 text-white border-emerald-400'
              : 'bg-rose-500/95 text-white border-rose-400'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold">
              <Settings className="w-3.5 h-3.5" />
              <span>Application Preferences & Local Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Settings & Data Management
            </h1>
            <p className="text-indigo-100 text-sm max-w-xl">
              Customize interface display themes, export or import offline data backups, and manage application reset.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <Database className="w-8 h-8 text-indigo-200" />
            <div>
              <div className="text-xs text-indigo-200">Local Database</div>
              <div className="text-lg font-bold">{userProgressList.length} Saved Words</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION PWA: Progressive Web App & Offline Mobile Support */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Progressive Web App (PWA)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Ready Offline
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install MyDictionary101 on your smartphone or desktop for full offline access & native app feel
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>PWA Native Installation</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Install as a full standalone app without browser controls. Features launch icons, fast caching, and full offline search.
              </p>
            </div>

            {deferredPrompt && onInstallPwa ? (
              <button
                onClick={onInstallPwa}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Install App on Device Now</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-700 dark:text-indigo-300 font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>Service Worker & Offline Cache Active</span>
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Manual Installation Steps:
            </div>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white">Android / Chrome:</span> Tap browser menu <span className="font-bold">⋮</span> &rarr; select <span className="font-bold text-indigo-600 dark:text-indigo-400">"Install App"</span> or <span className="font-bold text-indigo-600 dark:text-indigo-400">"Add to Home Screen"</span>.
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                <span className="font-bold text-slate-900 dark:text-white">iPhone / Safari:</span> Tap Share icon <span className="font-bold">⎘</span> &rarr; scroll down & select <span className="font-bold text-indigo-600 dark:text-indigo-400">"Add to Home Screen"</span>.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Display & Theme Appearance Settings */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Display & Theme Mode
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select visual interface appearance for light, dark, or automatic system matching
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onSetThemeMode('light')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col space-y-3 ${
              themeMode === 'light'
                ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400 font-bold ring-2 ring-amber-500/20'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sun className="w-6 h-6 text-amber-500" />
              {themeMode === 'light' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-extrabold uppercase">
                  Active
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-bold">Light Mode</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Clean, high-contrast light background
              </div>
            </div>
          </button>

          <button
            onClick={() => onSetThemeMode('dark')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col space-y-3 ${
              themeMode === 'dark'
                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold ring-2 ring-indigo-500/20'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <Moon className="w-6 h-6 text-indigo-400" />
              {themeMode === 'dark' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-extrabold uppercase">
                  Active
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-bold">Dark Mode</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Eye-friendly dark atmosphere
              </div>
            </div>
          </button>

          <button
            onClick={() => onSetThemeMode('system')}
            className={`p-5 rounded-2xl border text-left transition-all flex flex-col space-y-3 ${
              themeMode === 'system'
                ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 font-bold ring-2 ring-sky-500/20'
                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <Laptop className="w-6 h-6 text-sky-500" />
              {themeMode === 'system' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500 text-white font-extrabold uppercase">
                  Active
                </span>
              )}
            </div>
            <div>
              <div className="text-sm font-bold">System (Auto)</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                Automatically matches OS theme preference
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 2: Import / Export Data Management */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Data Import & Export
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Backup your vocabulary progress to JSON or CSV file, or restore from a backup
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Options */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Download className="w-4 h-4" />
              <span>Export Vocabulary Data</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Save your word list, practice history, and study stats to your local device.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportJson}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center space-x-2">
                  <FileJson className="w-4 h-4" />
                  <span>Export Complete JSON Backup</span>
                </div>
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportCsv}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                  <span>Export Vocabulary as CSV</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Import File Drag & Drop Zone */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Upload className="w-4 h-4" />
              <span>Import & Restore Data</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore vocabulary and practice records from a previously saved .json or .csv backup.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-[#1E293B]'
              }`}
            >
              <Upload className="w-7 h-7 text-indigo-500 mb-1" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Click or drag & drop backup file (.json, .csv)
              </span>
              <span className="text-[10px] text-slate-400">
                Supports MyDictionary101 JSON & CSV spreadsheet files
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2B: Word Content Import Template (full vocabulary entries) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-700/60 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">
              Word Content Import Template
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bulk-add new vocabulary entries (word, definition, part of speech, CEFR level, example,
              synonym, antonym, category, difficulty, Lao & Thai translation) via CSV or JSON.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Template Download */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Table className="w-4 h-4" />
              <span>1. Download the Template</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Columns: word, definition, partOfSpeech, cefrLevel, exampleSentence, synonym, antonym,
              category, difficulty, laoTranslation, thaiTranslation. Separate multiple synonyms/antonyms
              with a semicolon (;).
            </p>
            <div className="space-y-3 pt-2">
              <button
                onClick={handleDownloadCsvTemplate}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md active:scale-[0.98]"
              >
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download CSV Template</span>
                </div>
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleDownloadJsonTemplate}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-[0.98]"
              >
                <div className="flex items-center space-x-2">
                  <FileJson className="w-4 h-4 text-indigo-500" />
                  <span>Download JSON Template</span>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Word Content Upload */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Upload className="w-4 h-4" />
              <span>2. Upload Filled-in Template</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New words are added to your local dictionary and immediately available for search & practice cards.
            </p>

            <input
              type="file"
              ref={wordFileInputRef}
              accept=".json,.csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleWordContentFileChange(e.target.files[0]);
                }
              }}
            />

            <div
              onDragOver={handleWordDragOver}
              onDragLeave={handleWordDragLeave}
              onDrop={handleWordDrop}
              onClick={() => wordFileInputRef.current?.click()}
              className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                wordDragActive
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-300 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 bg-white dark:bg-[#1E293B]'
              }`}
            >
              {isImportingWords ? (
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Importing words…</span>
              ) : (
                <>
                  <Library className="w-7 h-7 text-emerald-500 mb-1" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Click or drag & drop filled template (.csv, .json)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Uses the Word Content Import Template columns above
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: Factory Reset / Reset All Data */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-500/5 border border-rose-500/20 dark:border-rose-500/30 shadow-xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-rose-500/10 dark:border-rose-500/20 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-rose-700 dark:text-rose-400">
              Reset Factory Settings & Clear Data
            </h2>
            <p className="text-xs text-rose-600/80 dark:text-rose-300/80">
              Wipe all custom vocabulary progress, practice statistics, and restore defaults
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40">
          <div className="space-y-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              Factory Reset Application
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              This will clear all saved words, bookmarks, practice history, and reset settings back to initial factory defaults.
            </div>
          </div>

          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="flex-shrink-0 flex items-center space-x-2 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Factory</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirm Factory Reset</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Are you absolutely sure?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              This action will permanently delete <strong className="text-slate-900 dark:text-white">{userProgressList.length} saved words</strong>, study history, and practice scores from this device. You cannot undo this step unless you have an exported JSON backup file.
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowResetConfirmModal(false)}
                disabled={isResetting}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <button
                onClick={confirmFactoryReset}
                disabled={isResetting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md"
              >
                {isResetting ? (
                  <span>Resetting...</span>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>Yes, Reset All Data</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
