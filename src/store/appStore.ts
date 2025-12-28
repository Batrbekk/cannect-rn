import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, MachineState, MachineStatus } from '../types';

interface AppState {
  // Аутентификация
  apiKey: string | null;
  machineId: string | null;
  deviceId: string | null;
  isPaired: boolean;
  
  // Состояние автомата
  machine: MachineState;
  
  // Товары
  products: Product[];
  productsLoading: boolean;
  productsError: string | null;
  
  // Покупка
  selectedProduct: Product | null;
  purchaseLoading: boolean;
  
  // Действия
  setPairingData: (apiKey: string, machineId: string, deviceId: string) => void;
  setProducts: (products: Product[]) => void;
  setMachineState: (state: Partial<MachineState>) => void;
  selectProduct: (product: Product | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      apiKey: null,
      machineId: null,
      deviceId: null,
      isPaired: false,
      
      machine: {
        stock: 0,
        capacity: 80,
        status: MachineStatus.UNPAIRED,
        stockPercentage: 0,
        productStock: {},
        lastSync: '',
      },
      
      products: [],
      productsLoading: false,
      productsError: null,
      
      selectedProduct: null,
      purchaseLoading: false,
      
      // Действия
      setPairingData: (apiKey, machineId, deviceId) => set({
        apiKey,
        machineId,
        deviceId,
        isPaired: true,
      }),
      
      setProducts: (products) => set({ products }),
      
      setMachineState: (state) => set((prev) => ({
        machine: { ...prev.machine, ...state }
      })),
      
      selectProduct: (product) => set({ selectedProduct: product }),
      
      reset: () => set({
        apiKey: null,
        machineId: null,
        deviceId: null,
        isPaired: false,
        selectedProduct: null,
        machine: {
          stock: 0,
          capacity: 80,
          status: MachineStatus.UNPAIRED,
          stockPercentage: 0,
          productStock: {},
          lastSync: '',
        },
      }),
    }),
    {
      name: 'vending-app-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
