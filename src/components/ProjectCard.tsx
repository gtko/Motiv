import React, { useState } from 'react';
import { ExternalLink, Github, Star, Users, Activity, Zap, TrendingUp, Code2 } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    type: string;
    status: string;
    totalPoints: number;
    githubStars: number;
    uniqueVisitors: number;
    uptime: number;
    liveUrl?: string;
    githubUrl?: string;
    user: {
      name: string;
      avatar?: string;
    };
  };
}

const typeConfig = {
  saas: {
    gradient: 'from-blue-500 to-cyan-500',
    icon: '☁️',
    label: 'SaaS'
  },
  tool: {
    gradient: 'from-green-500 to-emerald-500',
    icon: '🛠',
    label: 'Outil'
  },
  game: {
    gradient: 'from-purple-500 to-pink-500',
    icon: '🎮',
    label: 'Jeu'
  },
  website: {
    gradient: 'from-orange-500 to-red-500',
    icon: '🌐',
    label: 'Site Web'
  },
  mobile: {
    gradient: 'from-pink-500 to-rose-500',
    icon: '📱',
    label: 'Mobile'
  },
};

const statusConfig = {
  development: {
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    label: 'En développement'
  },
  live: {
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
    label: 'En production'
  },
  archived: {
    color: 'text-gray-400',
    bgColor: 'bg-gray-400/10',
    label: 'Archivé'
  },
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const type = typeConfig[project.type as keyof typeof typeConfig] || typeConfig.website;
  const status = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.development;

  return (
    <div 
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Effet de glow au hover */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${type.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
      
      {/* Carte principale */}
      <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-10 border border-white/10 hover:border-white/20 transition-all duration-300">
        {/* En-tête avec badges */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">{type.icon}</span>
              <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                {project.title}
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed">{project.description}</p>
          </div>
          
          <div className="flex flex-col items-end gap-3 ml-6">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color} backdrop-blur-sm`}>
              {status.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${type.gradient} text-white`}>
              {type.label}
            </span>
          </div>
        </div>

        {/* Grille de statistiques */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {/* Points totaux avec animation */}
          <div className="text-center p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 group/stat hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {project.totalPoints}
            </div>
            <div className="text-xs text-gray-500 mt-1">Points</div>
          </div>
          
          {/* GitHub Stars */}
          <div className="text-center p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 group/stat hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-2xl font-black text-yellow-400">{project.githubStars}</div>
            <div className="text-xs text-gray-500 mt-1">Stars</div>
          </div>
          
          {/* Visiteurs */}
          <div className="text-center p-5 rounded-xl bg-blue-500/10 border border-blue-500/20 group/stat hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-2">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">
              {project.uniqueVisitors > 999 ? `${(project.uniqueVisitors/1000).toFixed(1)}k` : project.uniqueVisitors}
            </div>
            <div className="text-xs text-gray-500 mt-1">Visiteurs</div>
          </div>
          
          {/* Uptime */}
          <div className="text-center p-5 rounded-xl bg-green-500/10 border border-green-500/20 group/stat hover:scale-105 transition-transform">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-2xl font-black text-green-400">{project.uptime}%</div>
            <div className="text-xs text-gray-500 mt-1">Uptime</div>
          </div>
        </div>

        {/* Barre de progression des points */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-400">Progression vers le prochain niveau</span>
            <span className="text-xs font-semibold text-purple-400">
              {Math.floor((project.totalPoints % 1000) / 10)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.floor((project.totalPoints % 1000) / 10)}%` }}
            />
          </div>
        </div>

        {/* Pied de carte avec infos utilisateur et actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#0f0f23] flex items-center justify-center text-sm font-bold text-white">
                  {project.user.name.charAt(0)}
                </div>
              </div>
              {/* Indicateur de statut */}
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f23]"></span>
            </div>
            <div>
              <div className="text-sm font-medium text-white">{project.user.name}</div>
              <div className="text-xs text-gray-500">
                <TrendingUp className="w-3 h-3 inline mr-1 text-green-400" />
                +23% cette semaine
              </div>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex items-center gap-4">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all group/btn"
              >
                <Github className="w-5 h-5 text-gray-400 group-hover/btn:text-white transition-colors" />
              </a>
            )}
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
              >
                <ExternalLink className="w-5 h-5 text-white" />
              </a>
            )}
          </div>
        </div>

        {/* Effet de particules au hover */}
        {isHovered && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '200ms' }}></div>
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
          </div>
        )}
      </div>
    </div>
  );
}