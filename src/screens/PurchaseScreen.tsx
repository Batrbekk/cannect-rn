import React, { useState } from 'react';
import { View, Text, Image, Alert, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import { useAppStore } from '../store/appStore';
import { apiClient } from '../services/api';
import { MachineStatus } from '../types';

interface PurchaseScreenProps {
  navigation: any;
}

export const PurchaseScreen: React.FC<PurchaseScreenProps> = ({ navigation }) => {
  const { selectedProduct, machineId, setMachineState } = useAppStore();
  const [loading, setLoading] = useState(false);

  if (!selectedProduct) {
    navigation.goBack();
    return null;
  }

  const handlePurchase = async () => {
    if (!machineId) return;

    setLoading(true);
    try {
      const result = await apiClient.purchaseProduct(selectedProduct._id, machineId);
      
      // Обновляем состояние автомата
      setMachineState({
        stock: result.machine.stock,
        status: result.machine.status as MachineStatus,
        stockPercentage: result.machine.stockPercentage,
      });

      Alert.alert('Успех!', 'Покупка совершена. Заберите товар.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Ошибка покупки';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.productInfo}>
        {selectedProduct.image && (
          <Image 
            source={{ uri: selectedProduct.image }} 
            style={styles.productImage}
          />
        )}
        <Text style={styles.productName}>{selectedProduct.name}</Text>
        <Text style={styles.productPrice}>{selectedProduct.price} ₸</Text>
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentText}>Способ оплаты: Банковская карта</Text>
      </View>

      <View style={styles.buttons}>
        <Button
          title="Купить"
          onPress={handlePurchase}
          loading={loading}
          buttonStyle={[styles.button, styles.buyButton]}
          titleStyle={styles.buttonText}
        />
        <Button
          title="Отмена"
          onPress={() => navigation.goBack()}
          buttonStyle={[styles.button, styles.cancelButton]}
          titleStyle={styles.buttonText}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  productInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2089dc',
  },
  paymentInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 18,
    color: '#666',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '45%',
    height: 60,
    borderRadius: 10,
  },
  buyButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
