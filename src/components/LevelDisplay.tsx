import { Rank } from '@/hooks/useLevelSystem';

interface LevelDisplayProps {
  level: number;
  xp: number;
  rank: Rank;
  levelProgress: number;
  compact?: boolean;
}

export function LevelDisplay({ level, xp, rank, levelProgress, compact = false }: LevelDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 glass glow-border px-3 py-1.5 rounded-lg">
        <span 
          className="text-sm font-bold"
          style={{ color: rank.color }}
        >
          {rank.icon}
        </span>
        <span className="text-xs font-medium text-foreground">Lv.{level}</span>
        <div className="w-12 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${levelProgress}%`,
              background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})`
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="glass glow-border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold animate-pulse-glow"
            style={{ 
              background: `${rank.color}20`,
              color: rank.color,
              boxShadow: `0 0 20px ${rank.color}40`
            }}
          >
            {rank.icon}
          </div>
          <div>
            <div 
              className="text-lg font-bold"
              style={{ color: rank.color }}
            >
              {rank.name}
            </div>
            <div className="text-sm text-muted-foreground">
              Level {level}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-foreground">{xp.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total XP</div>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level {level}</span>
          <span>Level {level + 1}</span>
        </div>
        <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500 rounded-full"
            style={{ 
              width: `${levelProgress}%`,
              background: `linear-gradient(90deg, ${rank.color}80, ${rank.color})`
            }}
          />
        </div>
        <div className="text-xs text-center text-muted-foreground">
          {Math.round(levelProgress)}% to next level
        </div>
      </div>
    </div>
  );
}
