import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import { useAppStore } from '../store/appStore';
import { PairingScreen } from '../screens/PairingScreen';
import { MainScreen } from '../screens/MainScreen';
import { PurchaseScreen } from '../screens/PurchaseScreen';
import { CartScreen } from '../screens/CartScreen';
import { QRCodePaymentScreen } from '../screens/QRCodePaymentScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';

const Stack = createStackNavigator();

export const AppNavigator: React.FC = () => {
  const { isPaired, setPairingData } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненные данные при запуске
    const checkStoredAuth = async () => {
      try {
        const apiKey = await SecureStore.getItemAsync('apiKey');
        const state = useAppStore.getState();
        
        if (apiKey && state.machineId && state.deviceId) {
          setPairingData(apiKey, state.machineId, state.deviceId);
        }
      } catch (error) {
        console.error('Error loading stored auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, [setPairingData]);

  if (isLoading) {
    return null; // Или экран загрузки
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isPaired ? (
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Purchase" component={PurchaseScreen} />
            <Stack.Screen name="QRCodePayment" component={QRCodePaymentScreen} />
            <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
          </>
        ) : (
          <Stack.Screen name="Pairing" component={PairingScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
