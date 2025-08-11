import axios from 'axios';

// Prefer environment variable in production (Render), fallback to localhost for dev
const baseURL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL,
});

export function setAuthToken(token?: string | null): void {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}


