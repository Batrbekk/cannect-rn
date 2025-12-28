import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore, CartItem } from '../store/cartStore';
import { useAppStore } from '../store/appStore';
import { Colors, BorderRadius, Spacing, FontSizes } from '../constants/theme';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { items, totalAmount, totalItems, updateQuantity, removeItem, clearCart } = useCartStore();
  const { machineId } = useAppStore();
  
  // Моковые данные для питательных веществ
  const nutritionalData = {
    energy: 614, // ккал
    protein: 27.1, // г
    fat: 32.0, // г
    carbs: 46.2, // г
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Удалить товар',
        'Удалить этот товар из корзины?',
        [
          { text: 'Отмена', style: 'cancel' },
          { 
            text: 'Удалить', 
            onPress: () => {
              removeItem(productId);
              // Проверяем количество товаров после удаления
              setTimeout(() => {
                const currentItems = useCartStore.getState().items;
                if (currentItems.length === 0) {
                  // Если корзина стала пустой, переходим на главную страницу
                  navigation.navigate('Main');
                }
              }, 100);
            }
          },
        ]
      );
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      Alert.alert('Ошибка', 'Корзина пуста');
      return;
    }

    if (!machineId) {
      Alert.alert('Ошибка', 'Автомат не подключен');
      return;
    }

    console.log('🔄 Переход к оплате...', {
      items,
      totalAmount,
      totalItems,
    });

    // Переходим на страницу QR кода, передаем полные данные товаров
    navigation.navigate('QRCodePayment', {
      cartItems: items, // Передаем полные данные товаров с name, price и т.д.
      machineId: machineId,
    })
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItemCompact}>
      <View style={styles.itemImageContainerCompact}>
        {item.image ? (
          <Image 
            source={{ uri: `https://vending-back.vercel.app${item.image}` }} 
            style={styles.itemImageCompact}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImageCompact}>
            <Text style={styles.placeholderTextCompact}>Нет фото</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemDetailsCompact}>
        <Text style={styles.itemNameCompact}>{item.name}</Text>
        <Text style={styles.itemPriceCompact}>{item.price} ₸</Text>
      </View>
      
      <View style={styles.quantityControlsCompact}>
        <TouchableOpacity 
          style={styles.quantityButtonCompact}
          onPress={() => handleQuantityChange(item.id, item.quantity - 1)}
        >
          <Text style={styles.quantityButtonTextCompact}>−</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantityCompact}>{item.quantity}</Text>
        
        <TouchableOpacity 
          style={[
            styles.quantityButtonCompact,
            item.quantity >= 16 && styles.disabledButton
          ]}
          onPress={() => handleQuantityChange(item.id, item.quantity + 1)}
          disabled={item.quantity >= 16}
        >
          <Text style={styles.quantityButtonTextCompact}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Корзина пуста</Text>
      <Text style={styles.emptySubtitle}>Добавьте товары для покупки</Text>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate('Main')}
      >
        <Text style={styles.backButtonText}>Вернуться к товарам</Text>
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        {renderEmptyCart()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Main')}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Корзина</Text>
        <View style={styles.closeButtonPlaceholder} />
      </View>

      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() => (
          <View>
            {/* Блок с питательными веществами */}
            <View style={styles.infoBlockCompact}>
              <View style={styles.nutritionalRowCompact}>
                <View style={styles.nutritionalItemCompact}>
                  <Ionicons name="flash" size={14} color={Colors.primary} />
                  <Text style={styles.nutritionalLabelCompact}>Энергия</Text>
                  <Text style={styles.nutritionalValueCompact}>{nutritionalData.energy} ккал</Text>
                </View>
                <View style={styles.nutritionalItemCompact}>
                  <Ionicons name="fitness" size={14} color={Colors.primary} />
                  <Text style={styles.nutritionalLabelCompact}>Белки</Text>
                  <Text style={styles.nutritionalValueCompact}>{nutritionalData.protein} г</Text>
                </View>
                <View style={styles.nutritionalItemCompact}>
                  <Ionicons name="water" size={14} color={Colors.primary} />
                  <Text style={styles.nutritionalLabelCompact}>Жиры</Text>
                  <Text style={styles.nutritionalValueCompact}>{nutritionalData.fat} г</Text>
                </View>
                <View style={styles.nutritionalItemCompact}>
                  <Ionicons name="leaf" size={14} color={Colors.primary} />
                  <Text style={styles.nutritionalLabelCompact}>Углеводы</Text>
                  <Text style={styles.nutritionalValueCompact}>{nutritionalData.carbs} г</Text>
                </View>
              </View>
            </View>
            
            {/* Итого */}
            <View style={styles.infoBlock}>
              <View style={styles.orderInfoRow}>
                <View style={styles.orderInfoItem}>
                  <Ionicons name="cash" size={20} color={Colors.primary} />
                  <Text style={styles.orderInfoLabel}>Итого</Text>
                </View>
                <Text style={styles.orderInfoValue}>{totalAmount} ₸</Text>
              </View>
            </View>
            
            {/* Отступ для кнопки оплаты */}
            <View style={styles.bottomSpacer} />
          </View>
        )}
      />
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.payButtonIsland}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>Оплатить</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  backButton: {
    padding: Spacing.md,
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: 'bold',
  },
  closeButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100, // Отступ для кнопки оплаты
  },
  bottomSpacer: {
    height: 20,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    padding: 8,
    backgroundColor: '#f0f0f0',
    margin: 8,
    borderRadius: 4,
  },
  cartList: {
    padding: 16,
    paddingBottom: 4,
  },
  cartListCompact: {
    padding: 16,
    paddingBottom: 4,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(212, 43, 58, 0.1)',
  },
  itemDetails: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 16,
    color: '#D42B3A',
    fontWeight: '600',
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f8f9fa',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 43, 58, 0.9)',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  quantityButton: {
    backgroundColor: 'transparent',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 20,
    minWidth: 28,
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  cartItemCompact: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    marginHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  itemImageContainerCompact: {
    width: 70,
    height: 70,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: '#f8f9fa',
  },
  itemImageCompact: {
    width: '100%',
    height: '100%',
  },
  placeholderImageCompact: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTextCompact: {
    color: '#999',
    fontSize: 8,
  },
  itemDetailsCompact: {
    flex: 1,
    marginRight: 12,
  },
  itemNameCompact: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  itemPriceCompact: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  quantityControlsCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  quantityButtonCompact: {
    backgroundColor: 'transparent',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonTextCompact: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityCompact: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  infoBlockCompact: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 0,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  nutritionalRowCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionalItemCompact: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  nutritionalLabelCompact: {
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 2,
    textAlign: 'center',
  },
  nutritionalValueCompact: {
    fontSize: FontSizes.sm,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  infoBlock: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 0,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  blockTitle: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  nutritionalGrid: {
    flexDirection: 'column',
  },
  nutritionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nutritionalItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  nutritionalIconContainer: {
    backgroundColor: 'rgba(212, 43, 58, 0.1)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionalLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  nutritionalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderInfoLabel: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
    fontWeight: '500',
  },
  orderInfoValue: {
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  processingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  emptyTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: FontSizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
  },
  footer: {
    backgroundColor: 'transparent',
    padding: Spacing.xl,
  },
  payButtonIsland: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: FontSizes.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    width: '100%',
  },
  payButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontWeight: 'bold',
  },
});
