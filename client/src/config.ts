const API_HOST = import.meta.env.VITE_API_HOST ?? '127.0.0.1';
const API_PORT = import.meta.env.VITE_API_PORT ?? '8000';

export const API_BASE = `http://${API_HOST}:${API_PORT}/api/v1`;

export const DEV_SERVER_HOST = import.meta.env.VITE_DEV_SERVER_HOST ?? 'localhost';
export const DEV_SERVER_PORT = import.meta.env.VITE_DEV_SERVER_PORT ?? '4173';

export default {
  API_BASE,
  API_HOST,
  API_PORT,
  DEV_SERVER_HOST,
  DEV_SERVER_PORT,
};
