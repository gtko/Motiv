import React, { useState } from 'react';
import { Trophy, TrendingUp, Crown, Medal, Flame, Sparkles, Zap } from 'lucide-react';

interface LeaderboardEntry {
  position: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
  totalPoints: number;
  projectCount: number;
  trend: 'up' | 'down' | 'stable';
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export default function Leaderboard({ entries }: LeaderboardProps) {
  const [hoveredEntry, setHoveredEntry] = useState<string | null>(null);

  const getMedalComponent = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-accent-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-neutral-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-accent-400" />;
      default:
        return <span className="text-lg font-bold text-neutral-500">#{position}</span>;
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') {
      return <TrendingUp className="w-3 h-3 text-primary-500" />;
    }
    if (trend === 'down') {
      return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
    }
    return <div className="w-3 h-3" />;
  };


  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-soft overflow-hidden">
        {/* En-tête simple */}
        <div className="p-5 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-500" />
              <h2 className="text-lg font-semibold text-neutral-800">
                Top contributeurs
              </h2>
            </div>
            <span className="text-xs text-neutral-500 bg-white px-2 py-1 rounded-full">
              Cette semaine
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-neutral-200">
          {entries.map((entry, index) => (
            <div
              key={entry.user.id}
              className={`
                relative p-5 transition-all duration-200
                ${hoveredEntry === entry.user.id ? 'bg-neutral-50' : 'bg-white'}
                ${index < entries.length - 1 ? '' : 'rounded-b-xl'}
              `}
              onMouseEnter={() => setHoveredEntry(entry.user.id)}
              onMouseLeave={() => setHoveredEntry(null)}
            >
              <div className="relative flex items-center gap-4">
                {/* Position avec style */}
                <div className="flex items-center justify-center">
                  {entry.position === 1 ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">1</span>
                    </div>
                  ) : entry.position === 2 ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-neutral-300 to-neutral-400 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">2</span>
                    </div>
                  ) : entry.position === 3 ? (
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">3</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <span className="text-base text-neutral-400">{entry.position}</span>
                    </div>
                  )}
                </div>
                
                {/* Avatar et infos utilisateur */}
                <div className="flex-1 flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      ${entry.position === 1 ? 'bg-gradient-to-br from-accent-400 to-accent-600 text-white' : 
                        entry.position <= 3 ? 'bg-neutral-100 text-neutral-700 border border-neutral-200' :
                        'bg-neutral-50 text-neutral-600'}
                    `}>
                      {entry.user.name.charAt(0)}
                    </div>
                    {entry.position === 1 && (
                      <div className="absolute -top-1 -right-1">
                        <Sparkles className="w-4 h-4 text-accent-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-800">
                      {entry.user.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span>{entry.projectCount} projets</span>
                      {entry.trend === 'up' && (
                        <span className="text-primary-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          En progression
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Points et niveau */}
                <div className="text-right">
                  <div className={`
                    font-bold
                    ${entry.position === 1 ? 'text-accent-600 text-xl' : 'text-neutral-800 text-lg'}
                  `}>
                    {entry.totalPoints.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Niveau {Math.floor(entry.totalPoints / 1000)}
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>
        
        {/* Pied de page avec plus d'infos */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 text-center">
          <a 
            href="/leaderboard" 
            className="inline-flex items-center gap-2 text-sm text-neutral-700 hover:text-primary-600 font-medium transition-colors"
          >
            <span>Voir le classement complet</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
  );
}