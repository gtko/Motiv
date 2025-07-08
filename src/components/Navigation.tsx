import React, { useState, useEffect } from 'react';
import { authClient, type AuthState } from '../lib/auth-client';

export default function Navigation() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = authClient.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  const handleLogout = () => {
    authClient.logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-effect rounded-2xl px-6 py-4 flex items-center justify-between">
          {/* Logo avec effet de hover magnétique */}
          <a href="/" className="flex items-center gap-3 magnetic-hover group">
            <div className="relative">
              <img src="/assets/logo-motiv.png" alt="Motiv" className="w-12 h-12 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
            </div>
            <span className="text-2xl font-bold gradient-text">Motiv</span>
          </a>
          
          {/* Menu central avec indicateur actif */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-full p-1">
            <a href="/" className="px-6 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-all">Accueil</a>
            <a href="/projects" className="px-6 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-all">Projets</a>
            <a href="/leaderboard" className="px-6 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-all">Classement</a>
          </div>
          
          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            {authState.isAuthenticated && authState.user ? (
              <>
                <button className="relative p-2 rounded-lg hover:bg-white/10 transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></span>
                </button>
                
                <a href="/projects/new" className="btn-glow bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Nouveau projet
                </a>
                
                {/* Menu dropdown utilisateur */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                      <div className="w-full h-full rounded-full bg-[#0f0f23] flex items-center justify-center text-sm font-bold">
                        {authState.user.name ? authState.user.name.charAt(0) : authState.user.username.charAt(0)}
                      </div>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f23]"></span>
                  </button>
                  
                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 glass-effect rounded-xl">
                      <a 
                        href={`/profile/${authState.user.username}`} 
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Mon profil
                      </a>
                      <a 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Paramètres
                      </a>
                      <hr className="my-2 border-white/10" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="px-6 py-2.5 rounded-full text-sm font-semibold text-white hover:text-purple-400 transition-colors">
                  Connexion
                </a>
                <a href="/register" className="btn-glow bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all">
                  S'inscrire
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}