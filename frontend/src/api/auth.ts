import apiClient from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data).then((res) => res.data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data).then((res) => res.data),

  logout: (): Promise<{ message: string }> =>
    apiClient.post('/auth/logout', {}).then((res) => res.data),
};
