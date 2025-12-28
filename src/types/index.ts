export interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
}

export enum MachineStatus {
  WORKING = 'WORKING',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ERROR = 'ERROR',
  UNPAIRED = 'UNPAIRED'
}

export interface MachineState {
  stock: number;
  capacity: number;
  status: MachineStatus;
  stockPercentage: number;
  productStock: Record<string, number>;
  lastSync: string;
}

export interface PairingResponse {
  machine: {
    _id: string;
    machineId: string;
  };
  device: {
    _id: string;
    apiKey: string;
  };
}

export interface PurchaseResponse {
  sale: {
    id: string;
    total: number;
    timestamp: string;
  };
  machine: {
    stock: number;
    status: string;
    stockPercentage: number;
  };
}

export interface ProductsResponse {
  products: Product[];
}

export interface MachineStateResponse {
  machine: {
    stock: number;
    capacity: number;
    status: string;
    stockPercentage: number;
  };
}

// Vending Machine Protocol Types
export enum VendingCommandType {
  DISPENSING = 'A',    // Выдача товара
  IDLE = 'E',          // Режим ожидания
  NOT_CONNECTED = '0'  // Не подключен
}

export enum VendingDispenseStatus {
  DISPENSING = 0,              // Выдача в процессе
  SUCCESS = 1,                 // Успешно
  FAILED = 2,                  // Ошибка
  NO_RESPONSE = 3,             // Нет ответа от платы
  NO_RESULT_RESPONSE = 4,      // Нет ответа результата
  DUPLICATE_SUCCESS = 5,       // Дубликат заказа (успешный)
  DUPLICATE_FAILED = 6         // Дубликат заказа (неуспешный)
}

export interface VendingPollResponse {
  commandType: VendingCommandType;
  cabinetType: string;          // T = пружинный автомат
  cabinetAddress: number;       // 0-7
  dispenseRow?: number;         // Ряд выдачи (когда commandType = A)
  dispenseColumn?: number;      // Колонка выдачи (когда commandType = A)
  dispenseStatus?: VendingDispenseStatus;  // Статус выдачи
  dispensePermission: number;   // 0 = разрешено, >0 = запрещено
  temperature?: {               // Данные температуры (когда commandType = E)
    cabinet1: number | null;
    cabinet2: number | null;
  };
}

export interface VendingSlotPosition {
  row: number;     // Ряд (n1 в протоколе)
  column: number;  // Колонка (n2 в протоколе)
}

export interface VendingDispenseCommand {
  cabinetAddress: number;       // 0-7
  cabinetType: 'T';            // T = пружинный
  position: VendingSlotPosition;
  isLastItem: boolean;         // false если не последний товар в заказе
  dispenseId: string;          // 8-значный ID для защиты от дублей
}

export interface VendingDispenseResult {
  success: boolean;
  status: VendingDispenseStatus;
  position: VendingSlotPosition;
  message: string;
}
