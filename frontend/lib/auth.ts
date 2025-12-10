// Authentication utilities
const API_URL = 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  username: string;
  subscription_tier: string;
  credits_remaining: number;
  total_donated: number;
  total_generations: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Register new user
export async function register(email: string, username: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Registration failed');
  }

  const data = await response.json();
  saveAuthData(data);
  return data;
}

// Login user
export async function login(username: string, password: string): Promise<AuthResponse> {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  const data = await response.json();
  saveAuthData(data);
  return data;
}

// Save auth data to localStorage
export function saveAuthData(data: AuthResponse): void {
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
}

// Get current user
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Get auth token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

// Logout user
export function logout(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
}

// Check subscription status
export function hasActiveSubscription(): boolean {
  const user = getUser();
  return user?.subscription_tier === 'premium';
}

// Get remaining credits
export function getRemainingCredits(): number {
  const user = getUser();
  return user?.credits_remaining || 0;
}

// Make authenticated API request
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    logout();
    throw new Error('Session expired');
  }

  return response;
}

// Refresh user data from backend
export async function refreshUserData(): Promise<User | null> {
  try {
    const response = await authFetch('/profile');
    if (!response.ok) return null;
    
    const data = await response.json();
    const user = data.user;
    
    // Update localStorage
    const currentUser = getUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    
    return user;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    return null;
  }
}