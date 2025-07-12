// Client API pour Cloudflare Workers
import { authClient } from './auth-client';

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8787/api';

export interface ApiError {
  error: string;
  details?: any;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

class ApiClientCF {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Ajouter le token d'authentification si disponible
      const authState = authClient.getState();
      if (authState.token) {
        headers['Authorization'] = `Bearer ${authState.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data };
      }

      return { data };
    } catch (error) {
      console.error('Erreur API:', error);
      return { 
        error: { 
          error: 'Erreur de connexion au serveur' 
        } 
      };
    }
  }

  // Auth endpoints
  async register(data: {
    email: string;
    username: string;
    password: string;
    name?: string;
  }) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    if (response.data) {
      authClient.login(response.data.user, response.data.token);
    }

    return response;
  }

  async login(email: string, password: string) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }
    );

    if (response.data) {
      authClient.login(response.data.user, response.data.token);
    }

    return response;
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });

    authClient.logout();
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Project endpoints
  async getProjects(params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.request<{ projects: any[] }>(
      `/projects${query ? `?${query}` : ''}`
    );
  }

  async getProject(id: string) {
    return this.request<{ project: any }>(`/projects/${id}`);
  }

  async createProject(data: {
    title: string;
    description?: string;
    content?: string;
    category?: string;
    difficulty?: string;
    techStack?: string[];
    demoUrl?: string;
    githubUrl?: string;
    imageUrl?: string;
  }) {
    return this.request<{ project: any }>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: any) {
    return this.request<{ project: any }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  async voteProject(id: string, voteType: 'up' | 'down') {
    return this.request(`/projects/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  // User endpoints
  async getUserProfile(username: string) {
    return this.request<{
      user: any;
      projects: any[];
      badges: any[];
      stats: any;
    }>(`/users/${username}`);
  }

  async updateProfile(data: {
    name?: string;
    bio?: string;
    avatarUrl?: string;
    coverUrl?: string;
  }) {
    return this.request<{ user: any }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getLeaderboard(limit?: number) {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<{ users: any[] }>(`/users/leaderboard${query}`);
  }

  async getUserBadges(userId: string) {
    return this.request<{ badges: any[] }>(`/users/${userId}/badges`);
  }

  // Media endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const authState = authClient.getState();
      const response = await fetch(`${API_BASE_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data };
      }

      return { data };
    } catch (error) {
      console.error('Erreur upload:', error);
      return {
        error: { error: 'Erreur lors de l\'upload' },
      };
    }
  }

  // Utility method to get media URL
  getMediaUrl(key: string) {
    return `${API_BASE_URL}/media/${key}`;
  }
}

class ApiClientCompat extends ApiClientCF {
  // Compatibility methods for old API
  async getUser(username: string) {
    const response = await this.getUserProfile(username);
    if (response.error) return null;
    return response.data?.user;
  }

  async getProjects(params?: any) {
    const response = await super.getProjects(params);
    if (response.error) return [];
    return response.data?.projects || [];
  }

  async getUserBadges(userId: string) {
    const response = await super.getUserBadges(userId);
    if (response.error) return [];
    return response.data?.badges || [];
  }

  async login(emailOrUsername: string, password: string) {
    const response = await this.request<{ user: any; token: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ emailOrUsername, password }),
      }
    );

    if (response.data) {
      authClient.login(response.data.user, response.data.token);
      return response.data;
    }

    return null;
  }

  async register(email: string, username: string, password: string, name?: string) {
    const response = await super.register({ email, username, password, name });
    if (response.error) return null;
    return response.data;
  }
}

export const apiClient = new ApiClientCompat();
export const ApiClient = {
  getUser: (username: string) => apiClient.getUser(username),
  getProjects: (params?: any) => apiClient.getProjects(params),
  getUserBadges: (userId: string) => apiClient.getUserBadges(userId),
  login: (emailOrUsername: string, password: string) => apiClient.login(emailOrUsername, password),
  register: (email: string, username: string, password: string, name?: string) => apiClient.register(email, username, password, name)
};