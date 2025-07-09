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
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    icon: '☁️',
    label: 'SaaS'
  },
  tool: {
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    icon: '🛠',
    label: 'Outil'
  },
  game: {
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    icon: '🎮',
    label: 'Jeu'
  },
  website: {
    color: 'text-neutral-700',
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
    icon: '🌐',
    label: 'Site Web'
  },
  mobile: {
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    icon: '📱',
    label: 'Mobile'
  },
};

const statusConfig = {
  development: {
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
    label: 'En développement'
  },
  live: {
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    label: 'En production'
  },
  archived: {
    color: 'text-neutral-500',
    bgColor: 'bg-neutral-100',
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
      {/* Carte principale minimaliste */}
      <div className="relative bg-white rounded-xl p-8 border border-neutral-200 shadow-soft hover:shadow-soft-lg transition-all duration-200">
        {/* En-tête avec badges */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{type.icon}</span>
              <h3 className="text-xl font-bold text-neutral-800">
                {project.title}
              </h3>
            </div>
            <p className="text-neutral-600 leading-relaxed text-sm">{project.description}</p>
          </div>
          
          <div className="flex flex-col items-end gap-2 ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
              {status.label}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${type.bgColor} ${type.color} border ${type.borderColor}`}>
              {type.label}
            </span>
          </div>
        </div>

        {/* Grille de statistiques */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Points totaux */}
          <div className="text-center p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-center justify-center mb-1">
              <Zap className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="text-xl font-bold text-neutral-700">
              {project.totalPoints}
            </div>
            <div className="text-xs text-neutral-600">Points</div>
          </div>
          
          {/* GitHub Stars */}
          <div className="text-center p-4 rounded-lg bg-accent-50 border border-accent-200">
            <div className="flex items-center justify-center mb-1">
              <Star className="w-4 h-4 text-accent-600" />
            </div>
            <div className="text-xl font-bold text-accent-700">{project.githubStars}</div>
            <div className="text-xs text-neutral-600">Stars</div>
          </div>
          
          {/* Visiteurs */}
          <div className="text-center p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="text-xl font-bold text-neutral-700">
              {project.uniqueVisitors > 999 ? `${(project.uniqueVisitors/1000).toFixed(1)}k` : project.uniqueVisitors}
            </div>
            <div className="text-xs text-neutral-600">Visiteurs</div>
          </div>
          
          {/* Uptime */}
          <div className="text-center p-4 rounded-lg bg-neutral-50 border border-neutral-200">
            <div className="flex items-center justify-center mb-1">
              <Activity className="w-4 h-4 text-neutral-600" />
            </div>
            <div className="text-xl font-bold text-neutral-700">{project.uptime}%</div>
            <div className="text-xs text-neutral-600">Uptime</div>
          </div>
        </div>

        {/* Barre de progression des points */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-600">Progression vers le prochain niveau</span>
            <span className="text-xs font-semibold text-neutral-700">
              {Math.floor((project.totalPoints % 1000) / 10)}%
            </span>
          </div>
          <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-neutral-400 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.floor((project.totalPoints % 1000) / 10)}%` }}
            />
          </div>
        </div>

        {/* Pied de carte avec infos utilisateur et actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary-100 border border-primary-300 flex items-center justify-center">
                <span className="text-sm font-bold text-primary-700">
                  {project.user.name.charAt(0)}
                </span>
              </div>
              {/* Indicateur de statut */}
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="text-sm font-medium text-neutral-800">{project.user.name}</div>
              <div className="text-xs text-neutral-500">
                <TrendingUp className="w-3 h-3 inline mr-1 text-primary-500" />
                +23% cette semaine
              </div>
            </div>
          </div>
          
          {/* Boutons d'action */}
          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors"
              >
                <Github className="w-4 h-4 text-neutral-600" />
              </a>
            )}
            {project.liveUrl && (
              <a 
                href={project.liveUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-white" />
              </a>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}