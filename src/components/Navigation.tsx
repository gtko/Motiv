import React, { useState, useEffect } from 'react';
import { authClient, type AuthState } from '../lib/auth-client';

export default function Navigation() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLightBackground, setIsLightBackground] = useState(false);

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

  useEffect(() => {
    // Détecter si on est sur une page avec fond clair
    const path = window.location.pathname;
    const lightPages = ['/projects/', '/profile', '/settings'];
    setIsLightBackground(lightPages.some(page => path.includes(page)));
  }, []);

  const handleLogout = () => {
    authClient.logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMobileMenuOpen && !target.closest('nav')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  // Handle site wrapper transform
  useEffect(() => {
    const wrapper = document.getElementById('site-wrapper');
    if (wrapper) {
      if (isMobileMenuOpen) {
        wrapper.style.transform = 'translateX(-160px) scale(0.95)';
        wrapper.style.borderRadius = '20px';
        wrapper.style.overflow = 'hidden';
      } else {
        wrapper.style.transform = 'translateX(0) scale(1)';
        wrapper.style.borderRadius = '0';
        wrapper.style.overflow = 'visible';
      }
    }
  }, [isMobileMenuOpen]);

  // Déterminer si le header doit avoir un fond et des couleurs sombres
  const needsDarkText = isScrolled || isLightBackground;

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className={`
            relative rounded-xl px-6 py-3 flex items-center justify-between transition-all duration-300
            ${needsDarkText 
              ? 'bg-white/50 backdrop-blur-lg border border-neutral-200/50 shadow-soft' 
              : 'bg-transparent'
            }
          `}>
          {/* Logo simple */}
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <img src="/assets/logo-motiv-w200.png" alt="Motiv" className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg" />
            <span className={`text-lg sm:text-xl font-bold transition-colors ${needsDarkText ? 'text-neutral-800' : 'text-white'}`}>Motiv</span>
          </a>
          
          {/* Menu central - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="/" className={`text-sm font-medium transition-colors ${needsDarkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>Accueil</a>
            <a href="/projects" className={`text-sm font-medium transition-colors ${needsDarkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>Projets</a>
            <a href="/leaderboard" className={`text-sm font-medium transition-colors ${needsDarkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>Classement</a>
            <a href="/about" className={`text-sm font-medium transition-colors ${needsDarkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>À propos</a>
          </div>
          
          {/* Actions utilisateur - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {authState.isAuthenticated && authState.user ? (
              <>
                <button className={`relative p-2 rounded-lg transition-all ${needsDarkText ? 'hover:bg-neutral-100' : 'hover:bg-white/10'}`}>
                  <svg className={`w-5 h-5 transition-colors ${needsDarkText ? 'text-neutral-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <a href="/login" className={`text-sm font-medium transition-colors ${needsDarkText ? 'text-neutral-600 hover:text-neutral-900' : 'text-white/90 hover:text-white'}`}>
                  Connexion
                </a>
                <a href="/register" className="btn-primary text-sm">
                  S'inscrire
                </a>
              </>
            )}
          </div>
          
          {/* Burger Menu Button - Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-all ${needsDarkText ? 'hover:bg-neutral-100' : 'hover:bg-white/10'}`}
          >
            <svg className={`w-6 h-6 transition-colors ${needsDarkText ? 'text-neutral-700' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
    </nav>
    
    {/* Overlay */}
    <div 
      className={`fixed inset-0 bg-gradient-to-br from-primary-900/40 via-neutral-900/30 to-accent-900/40 backdrop-blur-md z-40 lg:hidden transition-all duration-300 ${
        isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={() => setIsMobileMenuOpen(false)}
    />
    
    {/* Mobile Menu Slide-in */}
    <div className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white backdrop-blur-sm shadow-2xl z-50 lg:hidden transition-all duration-300 ease-out transform ${
      isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      {/* Menu Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-800">Menu</h2>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-neutral-100 transition-all duration-300 group"
          >
            <svg className="w-6 h-6 text-neutral-600 group-hover:text-neutral-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Menu Content */}
      <div className="overflow-y-auto h-[calc(100%-80px)]">
        <div className="p-6 space-y-1">
          {/* Navigation Links */}
          <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-all duration-300 group">
            <svg className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-neutral-700 font-medium group-hover:text-primary-600 transition-colors">Accueil</span>
          </a>
          
          <a href="/projects" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-all duration-300 group">
            <svg className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-neutral-700 font-medium group-hover:text-primary-600 transition-colors">Projets</span>
          </a>
          
          <a href="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-all duration-300 group">
            <svg className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-neutral-700 font-medium group-hover:text-primary-600 transition-colors">Classement</span>
          </a>
          
          <a href="/about" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-neutral-100 transition-all duration-300 group">
            <svg className="w-5 h-5 text-neutral-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-neutral-700 font-medium group-hover:text-primary-600 transition-colors">À propos</span>
          </a>
          
          <div className="py-4">
            <div className="h-px bg-gradient-to-r from-transparent via-neutral-300/50 to-transparent" />
          </div>
          
          {/* User Actions */}
          {authState.isAuthenticated && authState.user ? (
            <>
              <a href="/projects/new" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 border border-white/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Nouveau projet
              </a>
              
              <div className="pt-4 space-y-1">
                <a href={`/profile/${authState.user.username}`} className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/25 backdrop-blur transition-all duration-300 group transform hover:scale-[1.02] border border-white/0 hover:border-white/20">
                  <svg className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-neutral-700 font-medium group-hover:text-primary-600 transition-colors">Mon profil</span>
                </a>
                
                <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/25 backdrop-blur transition-all duration-300 group transform hover:scale-[1.02] border border-white/0 hover:border-white/20">
                  <svg className="w-5 h-5 text-neutral-500 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-neutral-700 font-medium group-hover:text-primary-600 transition-colors">Paramètres</span>
                </a>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50/20 hover:bg-red-50/40 backdrop-blur transition-all duration-300 group transform hover:scale-[1.02] border border-red-200/30 hover:border-red-300/50"
                >
                  <svg className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-red-600 font-medium group-hover:text-red-700 transition-colors">Déconnexion</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <a href="/login" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white/20 backdrop-blur-xl text-neutral-700 rounded-2xl font-bold hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-white/40 transform hover:scale-[1.02]">
                Connexion
              </a>
              
              <a href="/register" className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.03] transition-all duration-300 border border-white/20">
                S'inscrire gratuitement
              </a>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}