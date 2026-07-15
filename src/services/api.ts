import axios from 'axios';

// The Spring Boot backend runs on port 8080 by default with /api prefix
const API_BASE_URL = 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export interface User {
  id?: number;
  username: string;
  email: string;
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
  // Users endpoints
  createUser: async (username: string, email: string): Promise<User> => {
    const response = await apiClient.post<User>('/users', { username, email });
    return response.data;
  },

  getUsers: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
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
