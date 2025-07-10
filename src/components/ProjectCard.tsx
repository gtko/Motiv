import React, { useState } from 'react';
import { ExternalLink, Github, Star, Users, Activity, Zap, Sparkles, Rocket, Lock, Eye, TrendingUp } from 'lucide-react';

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
    iconColor: 'text-primary-600',
    label: 'SaaS'
  },
  tool: {
    color: 'text-primary-600',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
    iconColor: 'text-primary-600',
    label: 'Outil'
  },
  game: {
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    iconColor: 'text-accent-600',
    label: 'Jeu'
  },
  website: {
    color: 'text-neutral-700',
    bgColor: 'bg-neutral-50',
    borderColor: 'border-neutral-200',
    iconColor: 'text-neutral-700',
    label: 'Site Web'
  },
  mobile: {
    color: 'text-accent-600',
    bgColor: 'bg-accent-50',
    borderColor: 'border-accent-200',
    iconColor: 'text-accent-600',
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

  const handleCardClick = (e: React.MouseEvent) => {
    // Empêcher la navigation si on clique sur un lien
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    // Rediriger vers la page du projet
    window.location.href = `/projects/${project.id}`;
  };

  return (
    <div 
      className="group relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Carte avec dégradé coloré dynamique */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        {/* Fond dégradé dynamique selon le type */}
        <div className="absolute inset-0 opacity-90">
          <div className={`absolute inset-0 bg-gradient-to-br ${
            project.type === 'saas' ? 'from-emerald-50 via-green-50 to-teal-50' :
            project.type === 'tool' ? 'from-blue-50 via-indigo-50 to-purple-50' :
            project.type === 'game' ? 'from-orange-50 via-amber-50 to-yellow-50' :
            project.type === 'mobile' ? 'from-pink-50 via-rose-50 to-purple-50' :
            'from-slate-50 via-gray-50 to-zinc-50'
          }`}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
        </div>
        
        {/* Motif géométrique subtil */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="absolute top-8 right-8 w-32 h-32 rounded-full border-4 border-current"></div>
          <div className="absolute top-16 right-16 w-48 h-48 rounded-full border-4 border-current"></div>
        </div>
        
        <div className="relative z-10">
          {/* En-tête épuré avec grand titre */}
          <div className="mb-6">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight group-hover:text-primary-700 transition-colors duration-300">
                  {project.title}
                </h3>
                {!project.githubUrl && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                    <Lock className="w-3.5 h-3.5 text-neutral-600" />
                    <span className="text-xs font-medium text-neutral-700">Privé</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/80 ${status.color} backdrop-blur-sm shadow-sm`}>
                  {status.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/80 ${type.color} border ${type.borderColor} backdrop-blur-sm shadow-sm`}>
                  {type.label}
                </span>
              </div>
            </div>
            <p className="text-neutral-700 leading-relaxed text-base font-medium">{project.description}</p>
          </div>

          {/* Grille de statistiques avec fond blanc translucide */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* Points totaux */}
            <div className="relative group/stat">
              <div className="relative flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-800">
                    {project.totalPoints}
                  </div>
                  <div className="text-xs text-neutral-600 font-medium">Points gagnés</div>
                </div>
              </div>
            </div>
            
            {/* GitHub Stars OU Vues privées selon si open source */}
            {project.githubUrl ? (
              <div className="relative group/stat">
                <div className="relative flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-800">{project.githubStars}</div>
                    <div className="text-xs text-neutral-600 font-medium">Stars GitHub</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group/stat">
                <div className="relative flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-sm">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-800">
                      {project.uniqueVisitors > 999 ? `${(project.uniqueVisitors/1000).toFixed(1)}k` : project.uniqueVisitors}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">Vues du projet</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Engagement OU Uptime selon si open source */}
            {project.githubUrl ? (
              <div className="relative group/stat">
                <div className="relative flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-sm">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-800">
                      {project.uniqueVisitors > 999 ? `${(project.uniqueVisitors/1000).toFixed(1)}k` : project.uniqueVisitors}
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">Contributeurs</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative group/stat">
                <div className="relative flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-sm">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-neutral-800">+47%</div>
                    <div className="text-xs text-neutral-600 font-medium">Croissance</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Uptime */}
            <div className="relative group/stat">
              <div className="relative flex items-center gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm shadow-sm hover:shadow-md transition-all hover:bg-white/90">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-sm">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-800">{project.uptime}%</div>
                  <div className="text-xs text-neutral-600 font-medium">Disponibilité</div>
                </div>
              </div>
            </div>
          </div>

          {/* Barre de progression avec effet de brillance */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-semibold text-neutral-700">Niveau suivant</span>
              </div>
              <span className="text-xs font-bold text-primary-600">
                {Math.floor((project.totalPoints % 1000) / 10)}%
              </span>
            </div>
            <div className="relative h-2 bg-white/50 backdrop-blur-sm rounded-full overflow-hidden shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 -skew-x-12 animate-shimmer"></div>
              <div 
                className="relative h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.floor((project.totalPoints % 1000) / 10)}%` }}
              />
            </div>
          </div>

          {/* Pied de carte avec infos utilisateur et actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-sm font-bold text-primary-700">
                    {project.user.name.charAt(0)}
                  </span>
                </div>
                {/* Indicateur de statut avec animation */}
                <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500 border-2 border-white shadow-sm"></span>
                </span>
              </div>
              <div>
                <div className="text-sm font-semibold text-neutral-800">{project.user.name}</div>
                <div className="flex items-center gap-1 text-xs text-neutral-600">
                  <Sparkles className="w-3 h-3 text-primary-500" />
                  <span className="text-primary-600 font-semibold">+23%</span>
                  <span className="font-medium">cette semaine</span>
                </div>
              </div>
            </div>
            
            {/* Boutons d'action avec effets */}
            <div className="flex items-center gap-2">
              {project.githubUrl && (
                <a 
                  href={project.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/btn p-2.5 rounded-xl bg-white/70 backdrop-blur-sm hover:bg-neutral-900 transition-all duration-200 hover:scale-110 shadow-sm"
                >
                  <Github className="w-4 h-4 text-neutral-700 group-hover/btn:text-white transition-colors" />
                </a>
              )}
              {project.liveUrl && (
                <a 
                  href={project.liveUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group/btn flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <ExternalLink className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">Voir</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}