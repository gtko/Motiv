import React, { useState } from 'react';
import { ApiClient } from '../lib/api-client';
import { authClient } from '../lib/auth-client';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await ApiClient.login(formData.emailOrUsername, formData.password);
      
      if (result) {
        authClient.login(result.user, result.token);
        window.location.href = '/';
      } else {
        setError('Email/nom d\'utilisateur ou mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/assets/illustrations/login-w1280.png" 
          alt="Login background" 
          className="w-full h-full object-cover"
        />
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/50 via-neutral-800/40 to-neutral-700/30"></div>
      </div>
      
      {/* Main content - Full width creative design */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Welcome content */}
          <div className="text-center lg:text-left">
            <div className="mb-12">
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-12 leading-tight">
                Reprenez votre
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-accent-300">
                  aventure spatiale
                </span>
              </h1>
              
              {/* Platform features */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h3 className="font-bold text-white mb-6 text-lg">Connexion au Centre Spatial</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-300/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <span className="text-white/80">Retrouvez vos missions en cours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-300/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <span className="text-white/80">Suivez votre progression galactique</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-300/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-white/80">Connectez avec votre équipage</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent-300/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <span className="text-white/80">Accédez à vos récompenses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Login form */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-neutral-200 shadow-soft">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-800 mb-2">Connexion</h2>
                <p className="text-neutral-600">Entrez vos identifiants pour continuer</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="emailOrUsername" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email ou nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    id="emailOrUsername"
                    name="emailOrUsername"
                    required
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary-500 focus:bg-white transition-all outline-none text-neutral-800 placeholder-neutral-400"
                    placeholder="john@example.com ou @john_doe"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary-500 focus:bg-white transition-all outline-none text-neutral-800 placeholder-neutral-400"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-neutral-300 bg-white text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">Se souvenir de moi</span>
                  </label>
                  <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700 transition-colors">
                    Mot de passe oublié ?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-600">
                  Pas encore de compte ?
                  <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium ml-1 transition-colors">
                    Créer un compte
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </section>
  );
}