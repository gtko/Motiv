// Authentification côté client avec localStorage
export interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedin?: string;
  totalPoints: number;
  monthlyPoints: number;
  projectCount: number;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthClient {
  private static instance: AuthClient;
  private authState: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false
  };
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  static getInstance(): AuthClient {
    if (!AuthClient.instance) {
      AuthClient.instance = new AuthClient();
    }
    return AuthClient.instance;
  }

  private loadFromStorage() {
    try {
      const token = localStorage.getItem('motiv_token');
      const userData = localStorage.getItem('motiv_user');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        this.authState = {
          user,
          token,
          isAuthenticated: true
        };
        
        // Cookie will be set by server-side API
      }
    } catch (error) {
      console.error('Erreur lors du chargement depuis localStorage:', error);
      this.logout();
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      if (this.authState.token && this.authState.user) {
        localStorage.setItem('motiv_token', this.authState.token);
        localStorage.setItem('motiv_user', JSON.stringify(this.authState.user));
      } else {
        localStorage.removeItem('motiv_token');
        localStorage.removeItem('motiv_user');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Appel immédiat avec l'état actuel
    listener(this.authState);
    
    // Retourne une fonction de désabonnement
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return { ...this.authState };
  }

  login(user: User, token: string) {
    this.authState = {
      user,
      token,
      isAuthenticated: true
    };
    this.saveToStorage();
    this.notifyListeners();
  }

  async logout() {
    // Call logout API to clear server-side session
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Error calling logout API:', error);
    }
    
    this.authState = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    this.saveToStorage();
    this.notifyListeners();
  }

  updateUser(updates: Partial<User>) {
    if (this.authState.user) {
      this.authState.user = { ...this.authState.user, ...updates };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  getAuthHeaders(): Record<string, string> {
    if (this.authState.token) {
      return {
        'Authorization': `Bearer ${this.authState.token}`
      };
    }
    return {};
  }
}

export const authClient = AuthClient.getInstance();