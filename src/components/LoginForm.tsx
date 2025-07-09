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
      {/* Animated background with particles */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-[#0f0f23] to-blue-900/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float-slow"></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-purple-400/30 rotate-45 animate-bounce"></div>
        <div className="absolute bottom-20 right-20 w-3 h-3 bg-blue-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-40 w-2 h-2 bg-pink-400/30 rounded-full animate-pulse"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-l border-white/10 h-full"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main content - Full width creative design */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Welcome content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 mb-6 shadow-2xl">
                <img src="/assets/logo-motiv.png" alt="Motiv" className="w-14 h-14" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                Bon retour
                <br />
                <span className="gradient-text">créateur</span> !
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Reconnectez-vous à votre espace de création et continuez à transformer vos idées en réalité.
              </p>
              
              {/* Stats preview */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">2.5k</div>
                  <div className="text-sm text-gray-400">Projets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">890</div>
                  <div className="text-sm text-gray-400">Créateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">15M</div>
                  <div className="text-sm text-gray-400">Vues</div>
                </div>
              </div>
            </div>
            
            {/* Features preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300">Tableau de bord personnalisé</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300">Analytics en temps réel</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span className="text-gray-300">Communauté active</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Login form */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-20"></div>
            <div className="relative glass-effect rounded-3xl p-8 lg:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Connexion</h2>
                <p className="text-gray-400">Entrez vos identifiants pour continuer</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-400 mb-2">
                    Email ou nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    id="emailOrUsername"
                    name="emailOrUsername"
                    required
                    value={formData.emailOrUsername}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 transition-all outline-none text-white placeholder-gray-400"
                    placeholder="john@example.com ou @john_doe"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:bg-white/10 transition-all outline-none text-white placeholder-gray-400"
                    placeholder="••••••••"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-400">Se souvenir de moi</span>
                  </label>
                  <a href="/forgot-password" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                    Mot de passe oublié ?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-400">
                  Pas encore de compte ?
                  <a href="/register" className="text-purple-400 hover:text-purple-300 font-medium ml-1 transition-colors">
                    Créer un compte
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-40px); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}