import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { View, BackHandler } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import * as SystemUI from 'expo-system-ui';

export default function App() {
  useEffect(() => {
    // Настройка полноэкранного режима для вендингового автомата
    const setupKioskMode = async () => {
      try {
        // Скрываем панель навигации
        await NavigationBar.setVisibilityAsync('hidden');
        
        // Отключаем системные жесты
        await SystemUI.setBackgroundColorAsync('#ffffff');
        
        // Отключаем свайп-жесты
        await NavigationBar.setBehaviorAsync('inset-touch');
        
        // Блокируем кнопку "Назад" Android
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
          // Возвращаем true чтобы заблокировать действие по умолчанию
          return true;
        });

        return () => {
          backHandler.remove();
        };
      } catch (error) {
        console.warn('Не удалось настроить киоск режим:', error);
      }
    };

    setupKioskMode();
  }, []);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
        <AppNavigator />
      </View>
      <StatusBar style="light" backgroundColor="#0F172A" translucent={false} />
    </SafeAreaProvider>
  );
}
