import axios, { AxiosInstance } from 'axios';
import { useAppStore } from '../store/appStore';
import { 
  Product, 
  PairingResponse, 
  PurchaseResponse, 
  ProductsResponse, 
  MachineStateResponse 
} from '../types';

// Используем IP адрес вашего компьютера для подключения к бэкенду
const BASE_URL = 'https://vending-back.vercel.app/api'; // Базовый URL для API
export const IMAGE_BASE_URL = 'https://vending-back.vercel.app'; // Базовый URL для изображений

// Локальный relay сервер для обхода ZTL блокировок
const USE_LOCAL_RELAY = false; // Включить для обхода ZTL (ВЫКЛЮЧЕНО - не в Китае)
const RELAY_URL = 'http://172.20.10.2:3001/relay'; // IP вашего Mac в сети Personal Hotspot

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    // Если используем relay, настраиваем клиент для работы через локальный сервер
    if (USE_LOCAL_RELAY) {
      this.client = axios.create({
        baseURL: RELAY_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      this.client = axios.create({
        baseURL: BASE_URL,
        timeout: 30000, // Увеличиваем timeout до 30 секунд
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Добавляем apiKey в заголовки
    this.client.interceptors.request.use((config) => {
      const { apiKey } = useAppStore.getState();

      // Если используем relay, оборачиваем запрос
      if (USE_LOCAL_RELAY) {
        const targetUrl = `${BASE_URL}${config.url}`;
        const headers = { ...config.headers };
        if (apiKey) {
          headers['X-API-KEY'] = apiKey;
        }

        config.data = {
          targetUrl: targetUrl,
          method: config.method?.toUpperCase(),
          data: config.data,
          headers: headers
        };
        config.url = ''; // Relay endpoint уже установлен как baseURL
        config.method = 'post'; // Все запросы через relay идут как POST

        console.log('🚀 Relay Request:', config.data);
      } else {
        if (apiKey && config.headers) {
          config.headers['X-API-KEY'] = apiKey;
        }

        // Логирование запросов
        console.log('🚀 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          headers: config.headers,
          data: config.data,
        });
      }

      return config;
    });

    // Обработка ошибок и логирование ответов
    this.client.interceptors.response.use(
      (response) => {
        // Логирование успешных ответов
        console.log('✅ API Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      (error) => {
        // Логирование ошибок
        console.error('❌ API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
          fullUrl: `${error.config?.baseURL || BASE_URL}${error.config?.url}`,
        });
        
        if (error.response?.status === 401) {
          // Сброс аутентификации при 401
          useAppStore.getState().reset();
        }
        return Promise.reject(error);
      }
    );
  }

  // Проверка доступности сервера
  async checkServerHealth(): Promise<boolean> {
    try {
      console.log('🔍 Проверяем доступность сервера...');
      const response = await this.client.get('/health', { timeout: 5000 });
      console.log('✅ Сервер доступен:', response.status);
      return true;
    } catch (error: any) {
      console.error('❌ Сервер недоступен:', {
        message: error.message,
        code: error.code,
        status: error.response?.status
      });
      return false;
    }
  }

  // Пейринг
  async pairDevice(code: string): Promise<PairingResponse> {
    console.log('🔄 Начинаем pairing с кодом:', code);
    console.log('🔄 Базовый URL:', this.client.defaults.baseURL);

    try {
      const response = await this.client.post('/device/pair/verify', {
        code,
        firmwareVersion: '1.0.0',
      });

      console.log('✅ Pairing успешен:', response.data);
      return response.data.data;
    } catch (error: any) {
      console.error('❌ Ошибка pairing:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
  }

  // Получение товаров
  async getProducts(machineId?: string): Promise<Product[]> {
    const endpoint = machineId
      ? `/device/${machineId}/products`
      : '/device/products';
    const response = await this.client.get<{ data: ProductsResponse }>(endpoint);
    return response.data.data.products;
  }

  // Покупка товара
  async purchaseProduct(productId: string, machineId: string): Promise<PurchaseResponse> {
    const response = await this.client.post(`/device/${machineId}/sale`, {
      productId,
      qty: 1,
      paymentMethod: 'CARD',
      receiptId: `MOCK-${Date.now()}`,
    });
    return response.data.data;
  }

  // Покупка корзины товаров
  async purchaseCart(items: Array<{id: string, quantity: number}>, machineId: string): Promise<any> {
    // Отправляем единый запрос для всей корзины как транзакцию
    const response = await this.client.post(`/device/${machineId}/purchase`, {
      items: items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      paymentMethod: 'CARD'
    });

    return response.data;
  }

  // Heartbeat
  async sendHeartbeat(deviceId: string): Promise<void> {
    await this.client.put(`/device/${deviceId}/heartbeat`, {
      timestamp: new Date().toISOString(),
      status: 'online',
    });
  }

  // Состояние автомата через device API
  async getMachineStatus(machineId: string): Promise<{
    stock: number;
    capacity: number;
    status: string;
    stockPercentage: number;
    productStock: Record<string, number>;
    lastSync: string;
  }> {
    const response = await this.client.get(`/device/${machineId}/status`);
    return response.data.data.machine;
  }

  // Callback после успешного подключения
  async notifyDeviceConnected(machineId: string): Promise<void> {
    console.log('📞 Sending device connected callback for machine:', machineId);
    const response = await this.client.post(`/device/${machineId}/connected`);
    console.log('✅ Device connected callback sent successfully:', response.data);
  }
}

export const apiClient = new ApiClient();
