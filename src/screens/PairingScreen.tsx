import React, { useState } from 'react';
import { View, Text, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { useAppStore } from '../store/appStore';
import { apiClient } from '../services/api';
import * as SecureStore from 'expo-secure-store';

interface PairingScreenProps {
  navigation: any;
}

export const PairingScreen: React.FC<PairingScreenProps> = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const { setPairingData } = useAppStore();

  const handlePairing = async () => {
    if (code.length !== 6) {
      Alert.alert('Ошибка', 'Код должен содержать 6 цифр');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Отправляем код для пейринга:', code);
      const result = await apiClient.pairDevice(code);
      console.log('✅ Результат пейринга:', result);

      // Сохраняем apiKey в SecureStore
      await SecureStore.setItemAsync('apiKey', result.device.apiKey);

      // Обновляем состояние
      setPairingData(
        result.device.apiKey,
        result.machine._id,
        result.device._id
      );

      // Отправляем callback что устройство подключено
      try {
        console.log('📞 Отправляем callback о подключении устройства');
        await apiClient.notifyDeviceConnected(result.machine._id);
        console.log('✅ Callback о подключении устройства отправлен');
      } catch (callbackError) {
        console.error('⚠️ Ошибка отправки callback о подключении:', callbackError);
        // Не прерываем процесс если callback не удался
      }

      Alert.alert('Успех', 'Устройство подключено!', [
        { text: 'OK', onPress: () => navigation.replace('Main') }
      ]);
    } catch (error: any) {
      console.error('❌ Ошибка пейринга:', error);
      console.error('❌ Детали ошибки:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });

      // Формируем детальную информацию об ошибке
      const details = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
        method: error.config?.method,
        responseData: JSON.stringify(error.response?.data, null, 2),
        requestData: JSON.stringify(error.config?.data, null, 2),
      };

      setErrorDetails(JSON.stringify(details, null, 2));

      const errorMessage = error.response?.data?.error || error.message || 'Неверный код или истекло время';
      Alert.alert('Ошибка', errorMessage + '\n\nПодробности отображены на экране');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Подключение к автомату</Text>
      <Text style={styles.subtitle}>
        Введите 6-значный код с экрана администратора
      </Text>

      <TextInput
        style={styles.input}
        value={code}
        onChangeText={setCode}
        placeholder="000000"
        keyboardType="numeric"
        maxLength={6}
        autoFocus
      />

      <Button
        title="Подключить"
        onPress={handlePairing}
        loading={loading}
        disabled={code.length !== 6}
        buttonStyle={styles.button}
      />

      {errorDetails && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Детали ошибки:</Text>
          <ScrollView style={styles.errorScroll}>
            <Text style={styles.errorText}>{errorDetails}</Text>
          </ScrollView>
          <Button
            title="Очистить"
            onPress={() => setErrorDetails(null)}
            buttonStyle={styles.clearButton}
            titleStyle={{ fontSize: 12 }}
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  input: {
    width: 200,
    height: 60,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    width: 200,
    height: 50,
    borderRadius: 10,
  },
  errorContainer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ff4444',
    width: '100%',
    maxHeight: 400,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ff4444',
    marginBottom: 10,
  },
  errorScroll: {
    maxHeight: 300,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  clearButton: {
    marginTop: 10,
    backgroundColor: '#666',
    height: 35,
  },
});
