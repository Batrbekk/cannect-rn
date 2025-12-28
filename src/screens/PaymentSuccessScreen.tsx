import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../store/cartStore';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { IMAGE_BASE_URL } from '../services/api';
// Для казахстанского прототипа - выдача автоматическая
// import { vendingMachineService } from '../services/vendingMachine';
// import { VendingDispenseResult, VendingDispenseStatus } from '../types';

interface PaymentSuccessScreenProps {
  navigation: any;
  route: any;
}

export const PaymentSuccessScreen: React.FC<PaymentSuccessScreenProps> = ({ navigation, route }) => {
  const { clearCart } = useCartStore();

  // Получаем данные транзакции из route params
  const transaction = route.params?.transaction;
  const cartItems = route.params?.cartItems || [];

  // Для KZ прототипа - выдача автоматическая после оплаты
  // Только таймер для возврата на главную
  const [secondsLeft, setSecondsLeft] = useState<number | null>(15);

  const currentDate = transaction?.timestamp ? new Date(transaction.timestamp) : new Date();
  const formattedDate = currentDate.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = currentDate.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  useEffect(() => {
    // Очищаем корзину после успешной оплаты
    clearCart();

    // В KZ прототипе выдача автоматическая - сразу запускаем таймер
    const countdownInterval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          navigation.navigate('Main');
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [clearCart, navigation]);

  // Для KZ прототипа функция выдачи не нужна - выдача автоматическая

  const handleBackToMain = () => {
    navigation.navigate('Main');
  };

  return (
    <LinearGradient
      colors={Colors.gradient.dark}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Иконка успеха */}
          <View style={styles.successIconContainer}>
            <LinearGradient
              colors={Colors.gradient.purple}
              style={styles.successIconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="checkmark" size={60} color={Colors.white} />
            </LinearGradient>
          </View>

          {/* Заголовок */}
          <Text style={styles.successTitle}>Оплата прошла успешно!</Text>
          <Text style={styles.successSubtitle}>Заберите ваш заказ</Text>


          {/* Чек */}
          <View style={styles.receiptContainer}>
            {/* Заголовок чека */}
            <View style={styles.receiptHeader}>
              <Text style={styles.receiptTitle}>ЗАКАЗ</Text>
              <View style={styles.orderNumberBadge}>
                <Text style={styles.orderNumberText}>№{transaction?.orderNumber || '---'}</Text>
              </View>
            </View>

            {/* Дата и время */}
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateTimeRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.dateTimeText}>{formattedDate}</Text>
              </View>
              <View style={styles.dateTimeRow}>
                <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                <Text style={styles.dateTimeText}>{formattedTime}</Text>
              </View>
            </View>

            {/* Разделитель */}
            <View style={styles.divider} />

            {/* Товары */}
            <View style={styles.itemsList}>
              {(transaction?.items || cartItems).map((item: any, index: number) => (
                <View key={index} style={styles.receiptItem}>
                  <View style={styles.itemLeftSection}>
                    {item.image ? (
                      <Image
                        source={{ uri: `${IMAGE_BASE_URL}${item.image}` }}
                        style={styles.itemThumbnail}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.itemPlaceholder}>
                        <Ionicons name="cube-outline" size={20} color={Colors.primary} />
                      </View>
                    )}
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                      <Text style={styles.itemPrice}>{item.price} ₸</Text>
                    </View>
                  </View>
                  <View style={styles.itemRightSection}>
                    <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                    <Text style={styles.itemTotal}>{item.subtotal || (item.price * item.quantity)} ₸</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Разделитель */}
            <View style={styles.divider} />

            {/* Итого */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Итого:</Text>
              <LinearGradient
                colors={Colors.gradient.purple}
                style={styles.totalGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.totalAmount}>
                  {transaction?.totalAmount || cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)} ₸
                </Text>
              </LinearGradient>
            </View>

            {/* Способ оплаты */}
            <View style={styles.paymentMethod}>
              <Ionicons name="card-outline" size={20} color={Colors.textMuted} />
              <Text style={styles.paymentMethodText}>Оплачено картой через Kaspi</Text>
            </View>
          </View>

          {/* Кнопка возврата */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBackToMain}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={Colors.gradient.purple}
              style={styles.backButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.backButtonText}>Вернуться на главную</Text>
              <Ionicons name="arrow-forward" size={24} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Нижний отступ */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  successIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  successSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  receiptContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  receiptTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  orderNumberBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  orderNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  receiptNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  receiptNumberLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  receiptNumberValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateTimeText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.lg,
  },
  itemsList: {
    gap: Spacing.lg,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  itemThumbnail: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  itemPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  itemRightSection: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  totalGradient: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  paymentMethodText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  backButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  backButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  bottomSpacer: {
    height: Spacing.md,
  },
  dispensingContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  dispensingGradient: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  dispensingText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  dispensingSubtext: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  countdownContainer: {
    marginVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
