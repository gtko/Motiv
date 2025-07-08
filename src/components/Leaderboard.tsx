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
        return (
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
            <div className="absolute inset-0 animate-pulse">
              <Crown className="w-8 h-8 text-yellow-400 blur-md opacity-50" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="relative">
            <Medal className="w-7 h-7 text-gray-300 drop-shadow-lg" />
            <div className="absolute inset-0 animate-pulse">
              <Medal className="w-7 h-7 text-gray-300 blur-md opacity-50" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="relative">
            <Medal className="w-7 h-7 text-orange-400 drop-shadow-lg" />
            <div className="absolute inset-0 animate-pulse">
              <Medal className="w-7 h-7 text-orange-400 blur-md opacity-50" />
            </div>
          </div>
        );
      default:
        return (
          <span className="text-2xl font-black text-gray-600">#{position}</span>
        );
    }
  };

  const getTrendIcon = (trend: string, isTop3: boolean) => {
    if (trend === 'up') {
      return (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4 text-green-400" />
          {isTop3 && <Flame className="w-4 h-4 text-orange-400 animate-pulse" />}
        </div>
      );
    }
    if (trend === 'down') {
      return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
    }
    return <div className="w-4 h-4" />;
  };

  const getPositionGradient = (position: number) => {
    switch (position) {
      case 1:
        return 'from-yellow-500/20 to-amber-500/20';
      case 2:
        return 'from-gray-400/20 to-slate-400/20';
      case 3:
        return 'from-orange-500/20 to-red-500/20';
      default:
        return 'from-transparent to-transparent';
    }
  };

  return (
    <div className="relative">
      {/* Effet de brillance en arrière-plan */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-pink-600/10 rounded-2xl blur-2xl"></div>
      
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {/* En-tête avec effet gradient */}
        <div className="relative p-6 border-b border-white/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
          <div className="relative flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="relative">
                <Trophy className="w-8 h-8 text-yellow-400" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
              Classement
            </h2>
            <span className="text-xs text-gray-400 font-medium bg-white/5 px-3 py-1.5 rounded-full">
              Top 5 cette semaine
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-white/5">
          {entries.map((entry, index) => (
            <div
              key={entry.user.id}
              className={`
                relative p-6 transition-all duration-300 cursor-pointer
                ${hoveredEntry === entry.user.id ? 'bg-white/5' : ''}
                ${entry.position <= 3 ? 'bg-gradient-to-r ' + getPositionGradient(entry.position) : ''}
              `}
              onMouseEnter={() => setHoveredEntry(entry.user.id)}
              onMouseLeave={() => setHoveredEntry(null)}
            >
              {/* Effet de particules pour le top 3 */}
              {entry.position <= 3 && hoveredEntry === entry.user.id && (
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-2 left-10 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-2 right-10 w-1 h-1 bg-purple-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
                  <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                </div>
              )}
              
              <div className="relative flex items-center gap-4">
                {/* Position avec médaille */}
                <div className="flex items-center justify-center w-12">
                  {getMedalComponent(entry.position)}
                </div>
                
                {/* Avatar et informations utilisateur */}
                <div className="flex-1 flex items-center gap-4">
                  <div className="relative">
                    <div className={`
                      w-12 h-12 rounded-full p-[2px]
                      ${entry.position === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 
                        entry.position === 2 ? 'bg-gradient-to-br from-gray-300 to-slate-400' :
                        entry.position === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                        'bg-gradient-to-br from-purple-500 to-pink-500'}
                    `}>
                      <div className="w-full h-full rounded-full bg-[#0f0f23] flex items-center justify-center text-sm font-bold text-white">
                        {entry.user.avatar ? (
                          <img src={entry.user.avatar} alt={entry.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          entry.user.name.charAt(0)
                        )}
                      </div>
                    </div>
                    {/* Badge de niveau */}
                    {entry.position <= 3 && (
                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-1">
                        <Zap className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all">
                      {entry.user.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{entry.projectCount} projets</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-purple-400 font-medium">
                        Niveau {Math.floor(entry.totalPoints / 1000)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Points et tendance */}
                <div className="flex items-center gap-4">
                  {getTrendIcon(entry.trend, entry.position <= 3)}
                  <div className="text-right">
                    <div className={`
                      text-3xl font-black
                      ${entry.position === 1 ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400' :
                        entry.position === 2 ? 'text-gray-300' :
                        entry.position === 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' :
                        'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400'}
                    `}>
                      {entry.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">points</div>
                  </div>
                </div>
              </div>
              
              {/* Barre de progression pour chaque utilisateur */}
              {hoveredEntry === entry.user.id && (
                <div className="mt-4 space-y-2">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min((entry.totalPoints / 5000) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Prochain objectif</span>
                    <span className="text-purple-400">{5000 - entry.totalPoints} pts restants</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Pied de page avec action */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-r from-purple-600/5 to-pink-600/5">
          <a 
            href="/leaderboard" 
            className="flex items-center justify-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Voir le classement complet</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}