const API_HOST = import.meta.env.VITE_API_HOST ?? '127.0.0.1';
const API_PORT = import.meta.env.VITE_API_PORT ?? '4171';
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api/v1';

const DEV_SERVER_HOST = import.meta.env.VITE_DEV_SERVER_HOST ?? 'localhost';
const DEV_SERVER_PORT = import.meta.env.VITE_DEV_SERVER_PORT ?? '4170';
const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE ?? '10');

export default {
  API_BASE,
  API_HOST,
  API_PORT,
  DEV_SERVER_HOST,
  DEV_SERVER_PORT,
  DEFAULT_PAGE_SIZE,
};
