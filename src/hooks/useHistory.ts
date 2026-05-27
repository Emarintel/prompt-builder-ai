import { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

const STORAGE_KEY = 'pb-history';
const MAX_HISTORY = 20;

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as HistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      if (e instanceof DOMException && history.length > 0) {
        // QuotaExceededError: drop oldest item and retry once
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, -1)));
        } catch {
          console.warn('[useHistory] localStorage quota exceeded; history not persisted.');
        }
      }
    }
  }, [history]);

  const addItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev].slice(0, MAX_HISTORY));
  };

  const removeItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return { history, addItem, removeItem, clearHistory };
}
