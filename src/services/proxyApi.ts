import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Создаем instance с прокси настройками
const proxyApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  // Использовать системный прокси
  proxy: {
    protocol: 'http',
    host: '127.0.0.1',
    port: 8888,
  }
});

// Альтернативный метод - через localhost relay
export const createLocalRelay = async (path: string, data: any) => {
  try {
    // Отправляем на локальный сервер на Mac
    const response = await axios.post(`http://172.20.10.1:3001/relay`, {
      targetUrl: `${API_CONFIG.BASE_URL}${path}`,
      method: 'POST',
      data: data
    });
    return response.data;
  } catch (error) {
    console.error('Local relay error:', error);
    throw error;
  }
};

export default proxyApi;