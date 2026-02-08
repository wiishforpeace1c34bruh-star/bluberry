import { useState, useEffect, useCallback } from 'react';

export interface UserProgress {
  xp: number;
  level: number;
  gamesPlayed: number;
  totalPlayTime: number; // in seconds
}

export interface Rank {
  name: string;
  minLevel: number;
  color: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { name: 'Newbie', minLevel: 1, color: '#6b7280', icon: '○' },
  { name: 'Rookie', minLevel: 5, color: '#84cc16', icon: '◇' },
  { name: 'Player', minLevel: 10, color: '#22c55e', icon: '□' },
  { name: 'Gamer', minLevel: 20, color: '#06b6d4', icon: '△' },
  { name: 'Pro', minLevel: 35, color: '#8b5cf6', icon: '☆' },
  { name: 'Elite', minLevel: 50, color: '#f59e0b', icon: '◆' },
  { name: 'Master', minLevel: 75, color: '#ef4444', icon: '★' },
  { name: 'Legend', minLevel: 100, color: '#ec4899', icon: '⬡' },
  { name: 'BlackHat', minLevel: 150, color: '#ffffff', icon: '⬢' },
];

const STORAGE_KEY = 'blackhat_progress';
const XP_PER_GAME = 25;
const XP_PER_MINUTE = 5;

function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function xpForLevel(level: number): number {
  // XP needed to reach a level
  return Math.pow(level - 1, 2) * 100;
}

function xpToNextLevel(currentXp: number, currentLevel: number): number {
  const nextLevelXp = xpForLevel(currentLevel + 1);
  return nextLevelXp - currentXp;
}

function getRank(level: number): Rank {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (level >= rank.minLevel) {
      currentRank = rank;
    }
  }
  return currentRank;
}

export function useLevelSystem() {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { xp: 0, level: 1, gamesPlayed: 0, totalPlayTime: 0 };
      }
    }
    return { xp: 0, level: 1, gamesPlayed: 0, totalPlayTime: 0 };
  });

  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const addXp = useCallback((amount: number) => {
    setProgress(prev => {
      const newXp = prev.xp + amount;
      const newLevel = calculateLevel(newXp);
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, []);

  const startGame = useCallback(() => {
    setGameStartTime(Date.now());
    setProgress(prev => ({ ...prev, gamesPlayed: prev.gamesPlayed + 1 }));
    addXp(XP_PER_GAME);
  }, [addXp]);

  const endGame = useCallback(() => {
    if (gameStartTime) {
      const playTimeSeconds = Math.floor((Date.now() - gameStartTime) / 1000);
      const playTimeMinutes = Math.floor(playTimeSeconds / 60);
      const bonusXp = playTimeMinutes * XP_PER_MINUTE;
      
      setProgress(prev => ({
        ...prev,
        totalPlayTime: prev.totalPlayTime + playTimeSeconds,
      }));
      
      if (bonusXp > 0) {
        addXp(bonusXp);
      }
      
      setGameStartTime(null);
    }
  }, [gameStartTime, addXp]);

  const exportData = useCallback(() => {
    const data = JSON.stringify(progress, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blackhat_progress.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [progress]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as UserProgress;
        if (typeof data.xp === 'number' && typeof data.level === 'number') {
          setProgress({
            xp: data.xp,
            level: calculateLevel(data.xp),
            gamesPlayed: data.gamesPlayed || 0,
            totalPlayTime: data.totalPlayTime || 0,
          });
        }
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ xp: 0, level: 1, gamesPlayed: 0, totalPlayTime: 0 });
  }, []);

  const currentRank = getRank(progress.level);
  const nextRank = RANKS.find(r => r.minLevel > progress.level);
  const xpNeeded = xpToNextLevel(progress.xp, progress.level);
  const currentLevelXp = xpForLevel(progress.level);
  const nextLevelXp = xpForLevel(progress.level + 1);
  const levelProgress = ((progress.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;

  return {
    progress,
    currentRank,
    nextRank,
    xpNeeded,
    levelProgress,
    startGame,
    endGame,
    addXp,
    exportData,
    importData,
    resetProgress,
  };
}
