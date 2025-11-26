import { create } from 'zustand';

export interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: any) => void;
  clearAuth: () => void;
  loadAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token: string, user: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  loadAuth: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      set({ token, user: JSON.parse(user), isAuthenticated: true });
    }
  },
}));
