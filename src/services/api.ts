import axios from 'axios';
import { auth } from './firebase';

// Override via EXPO_PUBLIC_API_URL (see .env.example) for staging/production builds.
// Falls back to the local Spring Boot dev server, which only works on the same machine.
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach the current Firebase ID token to every outgoing request. getIdToken() returns the
// cached token and only hits the network to refresh it once it's close to expiring.
apiClient.interceptors.request.use(async (config) => {
  const token = await auth.currentUser?.getIdToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Account not found.',
  'auth/email-already-in-use': 'An account with that email already exists.',
  'auth/weak-password': 'Password is too weak. Please choose a stronger one.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

/** Turns an API/network failure into a message safe to show a user. */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error && typeof error === 'object' && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
    const code = (error as { code: string }).code;
    if (code in FIREBASE_AUTH_ERROR_MESSAGES) return FIREBASE_AUTH_ERROR_MESSAGES[code];
  }
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Network error. Check your connection and try again.';
    }
    const serverMessage = (error.response.data as { message?: string } | undefined)?.message;
    if (serverMessage) return serverMessage;
    switch (error.response.status) {
      case 401:
        return 'Incorrect email or password.';
      case 404:
        return 'Account not found.';
      case 409:
        return 'An account with that email already exists.';
      case 429:
        return 'Too many attempts. Please wait a moment and try again.';
      default:
        if (error.response.status >= 500) return 'Server error. Please try again in a moment.';
    }
  }
  return fallback;
}

export interface User {
  id?: number;
  username: string;
  email: string;
  avatarUri?: string;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  content: string; // JSON string containing content_blocks
  duration: number;
  mediaUrl?: string;
  cloudinaryPublicId?: string;
}

export interface Module {
  id: number;
  moduleId: string;
  moduleOrder: number;
  title: string;
  description: string;
  lessons?: Lesson[]; // Optional client-side field for mapping nested lessons
}

export interface UserProgress {
  id?: number;
  username: string;
  lessonId: number;
  completed: boolean;
  completionDate?: string;
}

export const apiService = {
  // Auth endpoints
  /**
   * Syncs the signed-in Firebase user with the backend: creates the account on first sign-in
   * (identified by the bearer token) or fetches the existing profile otherwise. `username` is
   * only meaningful on first sync — the backend ignores it for an already-synced account.
   */
  syncUser: async (username?: string): Promise<User> => {
    const response = await apiClient.post<User>('/auth/sync', username ? { username } : {});
    return response.data;
  },

  // Users endpoints
  createUser: async (username: string, email: string): Promise<User> => {
    const response = await apiClient.post<User>('/users', { username, email });
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.data;
  },

  updateUser: async (id: number, updates: Partial<User>): Promise<User> => {
    const response = await apiClient.put<User>(`/users/${id}`, updates);
    return response.data;
  },

  // Modules endpoints
  getModules: async (): Promise<Module[]> => {
    const response = await apiClient.get<Module[]>('/modules');
    return response.data;
  },

  getModuleById: async (id: number): Promise<Module> => {
    const response = await apiClient.get<Module>(`/modules/${id}`);
    return response.data;
  },

  // Lessons endpoints
  getLesson: async (id: number): Promise<Lesson> => {
    const response = await apiClient.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },

  getAllLessons: async (): Promise<Lesson[]> => {
    const response = await apiClient.get<Lesson[]>('/lessons');
    return response.data;
  },


  // Progress endpoints
  saveProgress: async (username: string, lessonId: number, completed: boolean): Promise<UserProgress> => {
    const response = await apiClient.post<UserProgress>('/progress', {
      username,
      lessonId,
      completed,
      completionDate: new Date().toISOString(),
    });
    return response.data;
  },
  

  getProgress: async (username: string): Promise<UserProgress[]> => {
    try {
      const response = await apiClient.get<UserProgress[]>(`/progress/${username}`);
      return response.data;
    } catch (error) {
      // Fallback if the endpoint is /progress or has different structure
      const response = await apiClient.get<UserProgress[]>('/progress');
      return response.data.filter(p => p.username === username);
    }
  },
};