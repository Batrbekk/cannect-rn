import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { ProductCard } from '../components/ProductCard';
import { VideoIntroScreen } from '../components/VideoIntroScreen';
import { useCartStore } from '../store/cartStore';
import { useAppStore } from '../store/appStore';
import { apiClient } from '../services/api';
import { useIdleTimer } from '../hooks/useIdleTimer';
import * as SecureStore from 'expo-secure-store';
import { MachineStatus } from '../types';
import { Colors, BorderRadius, Spacing } from '../constants/theme';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
}

interface MainScreenProps {
  navigation: any;
}

export const MainScreen: React.FC<MainScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('газированные напитки');
  const [showVideoIntro, setShowVideoIntro] = useState(true);
  const { totalItems, totalAmount } = useCartStore();
  const { reset, machine, machineId, setMachineState } = useAppStore();

  const categories = ['газированные напитки'];

  const syncMachineState = async () => {
    if (!machineId) return;
    
    try {
      const state = await apiClient.getMachineStatus(machineId);
      setMachineState({
        stock: state.stock,
        capacity: state.capacity,
        status: state.status as MachineStatus,
        stockPercentage: state.stockPercentage,
        productStock: state.productStock,
        lastSync: state.lastSync,
      });
    } catch (error) {
      console.error('Ошибка синхронизации состояния автомата:', error);
    }
  };

  const loadProducts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      console.log('🔄 Загружаем товары...');
      console.log('🔄 Machine ID:', machineId);

      const productsList = await apiClient.getProducts(machineId || undefined);
      console.log('✅ Товары загружены:', productsList);

      setProducts(productsList);

      // Синхронизируем состояние автомата после загрузки товаров
      await syncMachineState();
    } catch (error) {
      console.error('❌ Ошибка загрузки товаров:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить товары');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Обновляем список товаров при возврате на экран
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 MainScreen focused - refreshing products');
      loadProducts();
    }, [])
  );

  const handleGoToCart = () => {
    resetTimer();
    navigation.navigate('Cart');
  };

  const handleVideoIntroComplete = () => {
    setShowVideoIntro(false);
  };

  const handleIdle = () => {
    setShowVideoIntro(true);
  };

  const handleActive = () => {
    // Сбрасываем таймер при любой активности пользователя
  };

  const { resetTimer } = useIdleTimer({
    timeout: 10000, // 10 секунд
    onIdle: handleIdle,
    onActive: handleActive,
  });

  const handleReset = () => {
    Alert.alert(
      'Сброс настроек',
      'Это отключит устройство от автомата. Потребуется повторное подключение. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Сбросить', 
          style: 'destructive',
          onPress: async () => {
            try {
              await SecureStore.deleteItemAsync('apiKey');
              reset();
              Alert.alert('Успех', 'Настройки сброшены. Подключите устройство заново.');
            } catch (error) {
              console.error('Ошибка сброса:', error);
              Alert.alert('Ошибка', 'Не удалось сбросить настройки');
            }
          }
        },
      ]
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      availableQuantity={item.quantity || 0}
      onInteraction={resetTimer}
    />
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <View style={styles.categoriesScroll}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryItem,
              selectedCategory === category && styles.activeCategory
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.activeCategoryText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* {renderCategories()} */}
    </View>
  );


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top','right','bottom','left']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка товаров...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top','right','bottom','left']}>
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          numColumns={3}
          key={"grid-3"}
          contentContainerStyle={styles.productList}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                resetTimer();
                loadProducts(true);
              }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
        {totalItems > 0 && (
          <View style={styles.stickyIsland}>
            <LinearGradient
              colors={Colors.gradient.purple}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.islandGradient}
            >
              <View style={styles.islandContent}>
                <View style={styles.priceInfo}>
                  <Text style={styles.totalLabel}>Общая цена</Text>
                  <Text style={styles.totalAmount}>{totalAmount} ₸</Text>
                </View>
                <TouchableOpacity
                  style={styles.purchaseButton}
                  onPress={handleGoToCart}
                  activeOpacity={0.8}
                >
                  <Text style={styles.purchaseButtonText}>Перейти к покупке →</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        )}
        {showVideoIntro && (
          <VideoIntroScreen onComplete={handleVideoIntroComplete} />
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  header: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoriesContainer: {
    marginBottom: Spacing.lg,
  },
  categoriesScroll: {
    flexDirection: 'row',
  },
  categoryItem: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  activeCategory: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: Colors.white,
    fontWeight: '600',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  productList: {
    paddingHorizontal: 8,
    paddingBottom: 140,
  },
  stickyIsland: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    overflow: 'hidden',
  },
  islandGradient: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  islandContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  priceInfo: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  purchaseButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginLeft: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resetButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.sm,
    alignSelf: 'center',
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
});
