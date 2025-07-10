import React, { useState, useEffect } from 'react';
import { authClient, type AuthState } from '../lib/auth-client';

export default function Navigation() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = authClient.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    authClient.logout();
    setIsDropdownOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'py-2' : 'py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className={`
          relative rounded-xl px-6 py-3 flex items-center justify-between transition-all duration-300
          ${isScrolled 
            ? 'bg-white/50 backdrop-blur-lg border border-neutral-200/50 shadow-soft' 
            : 'bg-transparent'
          }
        `}>
          {/* Logo simple */}
          <a href="/" className="flex items-center gap-3">
            <img src="/assets/logo-motiv-w200.png" alt="Motiv" className="w-10 h-10 rounded-lg" />
            <span className={`text-xl font-bold transition-colors ${isScrolled ? 'text-neutral-800' : 'text-white'}`}>Motiv</span>
          </a>
          
          {/* Menu central */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>Accueil</a>
            <a href="/projects" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>Projets</a>
            <a href="/leaderboard" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>Classement</a>
            <a href="/about" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>À propos</a>
          </div>
          
          {/* Actions utilisateur */}
          <div className="flex items-center gap-4">
            {authState.isAuthenticated && authState.user ? (
              <>
                <button className={`relative p-2 rounded-lg transition-all ${isScrolled ? 'hover:bg-neutral-100' : 'hover:bg-white/10'}`}>
                  <svg className={`w-5 h-5 transition-colors ${isScrolled ? 'text-neutral-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full"></span>
                </button>
                
                <a href="/projects/new" className="btn-primary text-sm">
                  Nouveau projet
                </a>
                
                {/* Menu dropdown utilisateur */}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary-100 border border-primary-300 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-700">
                        {authState.user.name ? authState.user.name.charAt(0) : authState.user.username.charAt(0)}
                      </span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-primary-500 rounded-full border-2 border-white"></span>
                  </button>
                  
                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-soft-lg border border-neutral-200">
                      <a 
                        href={`/profile/${authState.user.username}`} 
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Mon profil
                      </a>
                      <a 
                        href="/settings" 
                        className="block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Paramètres
                      </a>
                      <hr className="my-2 border-neutral-200" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                      >
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <a href="/login" className={`text-sm font-medium transition-colors ${isScrolled ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>
                  Connexion
                </a>
                <a href="/register" className="btn-primary text-sm">
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