import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppStore } from '../store/appStore';
import { MachineStatus } from '../types';

export const MachineStatusBar: React.FC = () => {
  const { machine, machineId } = useAppStore();

  const getStatusColor = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.WORKING: return '#4CAF50';
      case MachineStatus.LOW_STOCK: return '#FF9800';
      case MachineStatus.OUT_OF_STOCK: return '#f44336';
      default: return '#999';
    }
  };

  const getStatusText = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.WORKING: return 'Работает';
      case MachineStatus.LOW_STOCK: return 'Мало товара';
      case MachineStatus.OUT_OF_STOCK: return 'Пустой';
      case MachineStatus.ERROR: return 'Ошибка';
      case MachineStatus.UNPAIRED: return 'Не подключен';
      default: return 'Неизвестно';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.machineId}>Автомат: {machineId}</Text>
        <Text style={styles.stock}>
          Остаток: {machine.stock}/{machine.capacity} ({machine.stockPercentage}%)
        </Text>
      </View>
      <View style={[styles.status, { backgroundColor: getStatusColor(machine.status) }]}>
        <Text style={styles.statusText}>{getStatusText(machine.status)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  machineId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
