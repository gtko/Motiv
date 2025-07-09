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
    <section className="relative min-h-screen flex items-center justify-center bg-white">
      {/* Simple pattern background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30"></div>
        
        {/* Simple geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-accent-100 rounded-full opacity-20"></div>
        
        {/* Dot pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e5e5 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
      </div>
      
      {/* Main content - Full width creative design */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Welcome content */}
          <div className="text-center lg:text-left">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-primary-600 mb-6 shadow-soft">
                <img src="/assets/logo-motiv.png" alt="Motiv" className="w-14 h-14" />
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-neutral-900 mb-4 leading-tight">
                Bon retour
                <br />
                <span className="text-primary-600">créateur</span> !
              </h1>
              <p className="text-xl text-neutral-600 mb-8">
                Reconnectez-vous à votre espace de création et continuez à transformer vos idées en réalité.
              </p>
              
              {/* Stats preview */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">2.5k</div>
                  <div className="text-sm text-neutral-500">Projets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent-500">890</div>
                  <div className="text-sm text-neutral-500">Créateurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-500">15M</div>
                  <div className="text-sm text-neutral-500">Vues</div>
                </div>
              </div>
            </div>
            
            {/* Features preview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-neutral-600">Tableau de bord personnalisé</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                <span className="text-neutral-600">Analytics en temps réel</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-neutral-600">Communauté active</span>
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