import React, { useState } from 'react';
import { ApiClient } from '../lib/api-client';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // TODO: Implement password reset in ApiClient
      // await ApiClient.resetPassword(email);
      
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess(true);
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-primary-50/30 py-20">
      <div className="w-full max-w-md mx-auto px-6">
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-soft border border-neutral-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-neutral-800 mb-2">Mot de passe oublié ?</h1>
            <p className="text-neutral-600">
              Pas de panique ! Entrez votre email et nous vous enverrons 
              <br className="hidden sm:block" />
              les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>

          {/* Success Message */}
          {success ? (
            <div className="text-center">
              <div className="mb-6 p-4 rounded-xl bg-primary-50 border border-primary-200">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-neutral-800 mb-2">Email envoyé !</h2>
                <p className="text-sm text-neutral-600">
                  Vérifiez votre boîte de réception et suivez les instructions 
                  pour réinitialiser votre mot de passe.
                </p>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-neutral-500">
                  Vous n'avez pas reçu l'email ?
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-all"
                >
                  Renvoyer l'email
                </button>
                <a
                  href="/login"
                  className="block w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all"
                >
                  Retour à la connexion
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 focus:border-primary-500 focus:bg-white transition-all outline-none text-neutral-800 placeholder-neutral-400"
                    placeholder="votre@email.com"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Entrez l'adresse email associée à votre compte
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    'Envoyer le lien de réinitialisation'
                  )}
                </button>
              </form>

              {/* Links */}
              <div className="mt-8 text-center space-y-3">
                <p className="text-sm text-neutral-600">
                  Vous vous souvenez de votre mot de passe ?
                  <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium ml-1 transition-colors">
                    Se connecter
                  </a>
                </p>
                <p className="text-sm text-neutral-600">
                  Pas encore de compte ?
                  <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium ml-1 transition-colors">
                    S'inscrire
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Connexion sécurisée • Vos données sont protégées
          </p>
        </div>
      </div>
    </section>
  );
}