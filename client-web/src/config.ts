const API_HOST = import.meta.env.VITE_API_HOST ?? '127.0.0.1';
const API_PORT = import.meta.env.VITE_API_PORT ?? '8000';
const API_BASE_ENV = import.meta.env.VITE_API_BASE;

export const API_BASE = API_BASE_ENV ?? (import.meta.env.DEV ? '/api/v1' : `http://${API_HOST}:${API_PORT}/api/v1`);

export const DEV_SERVER_HOST = import.meta.env.VITE_DEV_SERVER_HOST ?? 'localhost';
export const DEV_SERVER_PORT = import.meta.env.VITE_DEV_SERVER_PORT ?? '4173';
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE ?? '10');

export default {
  API_BASE,
  API_HOST,
  API_PORT,
  DEV_SERVER_HOST,
  DEV_SERVER_PORT,
  DEFAULT_PAGE_SIZE,
};
