import { WordEntry, UserWordProgress, OfflinePack, StudyStats } from '../types';

const DB_NAME = 'LexiLearnDictionaryDB';
const DB_VERSION = 1;

export class DictionaryDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store offline dictionary words
        if (!db.objectStoreNames.contains('words')) {
          const wordStore = db.createObjectStore('words', { keyPath: 'word' });
          wordStore.createIndex('synonyms', 'synonyms', { multiEntry: true });
        }

        // Store user word progress
        if (!db.objectStoreNames.contains('userProgress')) {
          const progressStore = db.createObjectStore('userProgress', { keyPath: 'word' });
          progressStore.createIndex('masteryLevel', 'masteryLevel', { unique: false });
          progressStore.createIndex('isBookmarked', 'isBookmarked', { unique: false });
        }

        // Store downloaded offline packs
        if (!db.objectStoreNames.contains('offlinePacks')) {
          db.createObjectStore('offlinePacks', { keyPath: 'id' });
        }

        // Store user study stats
        if (!db.objectStoreNames.contains('userStats')) {
          db.createObjectStore('userStats', { keyPath: 'id' });
        }
      };
    });
  }

  // Words API
  async saveWord(entry: WordEntry): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('words', 'readwrite');
      const store = tx.objectStore('words');
      store.put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async saveBatchWords(entries: WordEntry[]): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('words', 'readwrite');
      const store = tx.objectStore('words');
      for (const entry of entries) {
        store.put(entry);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getWord(word: string): Promise<WordEntry | null> {
    const db = await this.init();
    return new Promise((resolve) => {
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const request = store.get(word.toLowerCase().trim());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async searchOfflineWords(query: string, limit = 20): Promise<WordEntry[]> {
    const db = await this.init();
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return new Promise((resolve) => {
      const tx = db.transaction('words', 'readonly');
      const store = tx.objectStore('words');
      const results: WordEntry[] = [];
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor && results.length < limit) {
          const entry: WordEntry = cursor.value;
          if (entry.word.toLowerCase().includes(q)) {
            results.push(entry);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  // User Progress API
  async getWordProgress(word: string): Promise<UserWordProgress | null> {
    const db = await this.init();
    return new Promise((resolve) => {
      const tx = db.transaction('userProgress', 'readonly');
      const store = tx.objectStore('userProgress');
      const request = store.get(word.toLowerCase().trim());
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  }

  async getAllUserProgress(): Promise<UserWordProgress[]> {
    const db = await this.init();
    return new Promise((resolve) => {
      const tx = db.transaction('userProgress', 'readonly');
      const store = tx.objectStore('userProgress');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async saveWordProgress(progress: UserWordProgress): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('userProgress', 'readwrite');
      const store = tx.objectStore('userProgress');
      store.put(progress);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async removeWordProgress(word: string): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('userProgress', 'readwrite');
      const store = tx.objectStore('userProgress');
      store.delete(word.toLowerCase().trim());
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Offline Packs API
  async getOfflinePacks(): Promise<OfflinePack[]> {
    const db = await this.init();
    return new Promise((resolve) => {
      const tx = db.transaction('offlinePacks', 'readonly');
      const store = tx.objectStore('offlinePacks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  }

  async saveOfflinePack(pack: OfflinePack): Promise<void> {
    const db = await this.init();
    await this.saveBatchWords(pack.words);
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offlinePacks', 'readwrite');
      const store = tx.objectStore('offlinePacks');
      store.put(pack);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  // Study Stats
  async getStats(): Promise<StudyStats> {
    const db = await this.init();
    return new Promise((resolve) => {
      const tx = db.transaction('userStats', 'readonly');
      const store = tx.objectStore('userStats');
      const request = store.get('main_stats');
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.data);
        } else {
          const defaultStats: StudyStats = {
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
          resolve(defaultStats);
        }
      };
      request.onerror = () => {
        resolve({
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
      };
    });
  }

  async saveStats(stats: StudyStats): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('userStats', 'readwrite');
      const store = tx.objectStore('userStats');
      store.put({ id: 'main_stats', data: stats });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = await this.init();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['userProgress', 'userStats', 'offlinePacks'], 'readwrite');
      tx.objectStore('userProgress').clear();
      tx.objectStore('userStats').clear();
      tx.objectStore('offlinePacks').clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const localDb = new DictionaryDB();
