import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  Alert,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { apiClient } from '../services/api';

interface QRCodePaymentScreenProps {
  navigation: any;
  route: any;
}

export const QRCodePaymentScreen: React.FC<QRCodePaymentScreenProps> = ({ navigation, route }) => {
  const [pulseAnim] = useState(new Animated.Value(1));
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [paymentTimerRef, setPaymentTimerRef] = React.useState<NodeJS.Timeout | null>(null);

  const cartItems = route.params?.cartItems || [];
  const machineId = route.params?.machineId;
  const [transactionData, setTransactionData] = React.useState<any>(null);

  // Обработчик отмены
  const handleCancel = React.useCallback(() => {
    if (paymentTimerRef) {
      clearTimeout(paymentTimerRef);
    }
    Alert.alert(
      'Отмена оплаты',
      'Вы уверены, что хотите отменить оплату?',
      [
        {
          text: 'Нет',
          style: 'cancel',
        },
        {
          text: 'Да, отменить',
          style: 'destructive',
          onPress: () => {
            console.log('🚫 Оплата отменена пользователем');
            navigation.goBack();
          },
        },
      ]
    );
  }, [navigation, paymentTimerRef]);

  // Функция обработки платежа
  const processPayment = React.useCallback(async () => {
    try {
      setShowQR(false);
      setProcessing(true);
      console.log('🔄 Обрабатываем оплату...');
      console.log('🔄 Данные корзины:', cartItems);
      console.log('🔄 ID автомата:', machineId);

      const response = await apiClient.purchaseCart(cartItems, machineId);
      console.log('✅ Получен ответ от сервера:', response);

      // Ответ приходит с data.status и data.transaction
      if (response.data?.status === 'ok' && response.data?.transaction) {
        console.log('✅ Оплата успешна', response.data.transaction);
        setTransactionData(response.data.transaction);
        // Переходим на страницу успеха с данными транзакции
        navigation.replace('PaymentSuccess', {
          transaction: response.data.transaction,
          cartItems
        });
      } else {
        console.error('❌ Неверная структура ответа:', response);
        throw new Error(response.message || 'Ошибка обработки платежа');
      }
    } catch (error: any) {
      console.error('❌ Ошибка оплаты:', error);
      console.error('❌ Детали ошибки:', error.response?.data || error.message);
      setProcessing(false);
      setShowQR(true);
      Alert.alert(
        'Ошибка оплаты',
        error.response?.data?.message || error.message || 'Не удалось обработать оплату. Попробуйте еще раз',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  }, [cartItems, machineId, navigation]);

  // Пульсирующая анимация для QR кода
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  // Показываем QR 10 секунд, затем обрабатываем платеж
  useEffect(() => {
    const timer = setTimeout(() => {
      processPayment();
    }, 10000);

    setPaymentTimerRef(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [processPayment]);

  // Показываем индикатор загрузки пока идет обработка платежа
  if (processing && !showQR) {
    return (
      <LinearGradient colors={Colors.gradient.dark} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.title}>Обработка платежа...</Text>
            <Text style={styles.subtitle}>Пожалуйста, подождите</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={Colors.gradient.dark}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* QR код слева */}
          <Animated.View
            style={[
              styles.qrContainer,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <View style={styles.qrBackground}>
              <Image
                source={require('../../assets/kaspi-qr.png')}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          {/* Информация справа */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>Сканируйте QR-код</Text>
            <Text style={styles.subtitle}>для оплаты через Kaspi</Text>

            {/* Сумма к оплате */}
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Сумма к оплате</Text>
              <LinearGradient
                colors={Colors.gradient.purple}
                style={styles.amountGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.amountText}>
                  {cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)} ₸
                </Text>
              </LinearGradient>
            </View>

            {/* Информация будет показана после оплаты */}
            {transactionData && (
              <View style={styles.orderInfo}>
                <Text style={styles.orderLabel}>Заказ №</Text>
                <Text style={styles.orderNumber}>{transactionData.orderNumber}</Text>
              </View>
            )}

            {/* Кнопка отмены */}
            {!processing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={24} color={Colors.textMuted} />
                <Text style={styles.cancelButtonText}>Отменить</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 60,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  qrContainer: {
    marginBottom: 0,
  },
  qrBackground: {
    backgroundColor: Colors.white,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  amountGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
  },
});
