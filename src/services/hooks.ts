import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { apiClient } from './api';
import { Alert } from 'react-native';
import { MachineStatus } from '../types';

// Загрузка товаров
export const useProducts = () => {
  const { products, productsLoading, setProducts } = useAppStore();

  const loadProducts = async () => {
    try {
      useAppStore.setState({ productsLoading: true, productsError: null });
      const products = await apiClient.getProducts();
      setProducts(products);
    } catch (error) {
      useAppStore.setState({ 
        productsError: error instanceof Error ? error.message : 'Ошибка загрузки товаров' 
      });
    } finally {
      useAppStore.setState({ productsLoading: false });
    }
  };

  useEffect(() => {
    if (useAppStore.getState().isPaired) {
      loadProducts();
    }
  }, []);

  return { products, loading: productsLoading, reload: loadProducts };
};

// Heartbeat
export const useHeartbeat = () => {
  const { deviceId, isPaired } = useAppStore();

  useEffect(() => {
    if (!isPaired || !deviceId) return;

    const interval = setInterval(async () => {
      try {
        await apiClient.sendHeartbeat(deviceId);
      } catch (error) {
        console.error('Heartbeat failed:', error);
      }
    }, 30000); // Каждые 30 секунд

    return () => clearInterval(interval);
  }, [deviceId, isPaired]);
};

// Синхронизация состояния автомата
export const useMachineSync = () => {
  const { machineId, isPaired, setMachineState } = useAppStore();

  const syncMachine = async () => {
    if (!machineId) return;
    
    try {
      const state = await apiClient.getMachineState(machineId);
      setMachineState({
        ...state,
        status: state.status as MachineStatus,
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Machine sync failed:', error);
    }
  };

  useEffect(() => {
    if (!isPaired || !machineId) return;

    // Синхронизация каждые 2 минуты
    const interval = setInterval(syncMachine, 120000);
    
    // Первая синхронизация сразу
    syncMachine();

    return () => clearInterval(interval);
  }, [machineId, isPaired]);

  return { syncMachine };
};
