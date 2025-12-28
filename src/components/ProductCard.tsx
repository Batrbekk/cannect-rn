import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, useWindowDimensions, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../store/cartStore';
import { Colors, BorderRadius, Spacing } from '../constants/theme';
import { IMAGE_BASE_URL } from '../services/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

interface ProductCardProps {
  product: Product;
  availableQuantity?: number;
  onInteraction?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  availableQuantity = 16,
  onInteraction
}) => {
  const { width, height } = useWindowDimensions();
  // 3 карточки в ряд: по 8px внешних отступов слева/справа контейнера и 16px margin у карт
  const cardWidth = (width - 16) / 3 - 8;
  // Адаптивная высота: пропорция 1.6 от ширины или максимум 35% высоты экрана
  const cardHeight = Math.min(cardWidth * 1.6, height * 0.35);
  const [scaleAnim] = useState(new Animated.Value(1));

  const { addItem, updateQuantity, getItemQuantity } = useCartStore();
  const cartQuantity = getItemQuantity(product._id);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  
  const handleAddToCart = () => {
    if (availableQuantity === 0) {
      return; // Не добавляем товар, если его нет в наличии
    }
    if (cartQuantity < availableQuantity) {
      addItem({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
      onInteraction?.();
    }
  };
  
  const handleDecrease = () => {
    if (cartQuantity > 0) {
      updateQuantity(product._id, cartQuantity - 1);
      onInteraction?.();
    }
  };
  
  const handleIncrease = () => {
    if (cartQuantity < availableQuantity) {
      updateQuantity(product._id, cartQuantity + 1);
      onInteraction?.();
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight, transform: [{ scale: scaleAnim }] }
      ]}
    >
      {product.image ? (
        <Image
          source={{ uri: `${IMAGE_BASE_URL}${product.image}` }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderBackground}>
          <Text style={styles.placeholderText}>Нет фото</Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => {
          if (cartQuantity === 0) {
            handleAddToCart();
          }
        }}
        disabled={cartQuantity > 0}
        style={styles.touchableContainer}
      >
        <LinearGradient
          colors={Colors.gradient.overlay}
          locations={[0, 0.6, 1]}
          style={styles.shadowOverlay}
        >
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
            {availableQuantity !== undefined && (
              <View style={[styles.stockBadge, availableQuantity === 0 && styles.outOfStockBadge]}>
                <Text style={styles.stockText}>
                  {availableQuantity === 0 ? 'Нет в наличии' : `${availableQuantity} шт`}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{product.price} ₸</Text>
            {cartQuantity === 0 ? (
              <View style={[styles.addButton, availableQuantity === 0 && styles.disabledAddButton]}>
                <LinearGradient
                  colors={availableQuantity === 0 ? ['#666', '#444'] : Colors.gradient.purple}
                  style={styles.addButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.addButtonText}>+</Text>
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={handleDecrease}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  <Text style={styles.quantityButtonText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.quantity}>{cartQuantity}</Text>

                <TouchableOpacity
                  style={[
                    styles.quantityButton,
                    cartQuantity >= availableQuantity && styles.disabledButton
                  ]}
                  onPress={handleIncrease}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  disabled={cartQuantity >= availableQuantity}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    margin: 4,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  touchableContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  placeholderBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    borderBottomLeftRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  headerRow: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(220, 38, 38, 0.8)',
    borderColor: 'rgba(220, 38, 38, 1)',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledAddButton: {
    opacity: 0.5,
    shadowOpacity: 0.2,
  },
  addButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '300',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  quantityButton: {
    backgroundColor: 'transparent',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginHorizontal: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
