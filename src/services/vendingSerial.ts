import { NativeModules, NativeEventEmitter } from 'react-native';

const { VendingSerial } = NativeModules;
const eventEmitter = new NativeEventEmitter(VendingSerial);

export interface SerialConfig {
  port: string;
  baudrate: number;
}

/**
 * Сервис для работы с UART serial портом вендингового автомата
 */
class VendingSerialService {
  private isConnected = false;

  /**
   * Открыть serial порт
   * @param port Путь к устройству (по умолчанию /dev/ttyS3)
   * @param baudrate Скорость передачи (19200 для вендинга)
   */
  async open(port: string = '/dev/ttyS3', baudrate: number = 19200): Promise<void> {
    try {
      await VendingSerial.open(port, baudrate);
      this.isConnected = true;
      console.log('✅ Serial порт открыт:', port, 'на скорости', baudrate);
    } catch (error) {
      console.error('❌ Ошибка открытия serial порта:', error);
      throw error;
    }
  }

  /**
   * Закрыть serial порт
   */
  async close(): Promise<void> {
    if (this.isConnected) {
      await VendingSerial.close();
      this.isConnected = false;
      console.log('🔌 Serial порт закрыт');
    }
  }

  /**
   * Записать команду в serial порт
   * @param command Команда для отправки (например, "ONLINE", "AOTT", "SHIP:...")
   */
  async write(command: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Serial порт не открыт');
    }
    return VendingSerial.write(command);
  }

  /**
   * Подписаться на данные из serial порта
   * @param callback Функция, которая будет вызвана при получении данных
   * @returns Subscription object для отписки
   */
  onData(callback: (data: string) => void) {
    return eventEmitter.addListener('onSerialData', (event) => {
      callback(event.data);
    });
  }

  /**
   * Подписаться на ошибки serial порта
   * @param callback Функция, которая будет вызвана при ошибке
   * @returns Subscription object для отписки
   */
  onError(callback: (error: string) => void) {
    return eventEmitter.addListener('onSerialError', (event) => {
      callback(event.error);
    });
  }

  /**
   * Проверить, открыт ли порт
   */
  async isOpen(): Promise<boolean> {
    return VendingSerial.isOpen();
  }

  /**
   * Получить статус подключения
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const vendingSerial = new VendingSerialService();
