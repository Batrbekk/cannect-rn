import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

const { height: screenHeight } = Dimensions.get('window');

interface VideoIntroScreenProps {
  onComplete: () => void;
}

export const VideoIntroScreen: React.FC<VideoIntroScreenProps> = ({ onComplete }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const translateY = useRef(new Animated.Value(0)).current;
  const arrowOpacity = useRef(new Animated.Value(0)).current;
  const arrowTranslateY = useRef(new Animated.Value(0)).current;

  const startArrowAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(arrowOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslateY, {
          toValue: -10,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(arrowTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(arrowOpacity, {
          toValue: 0.6,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    ).start();
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setIsVideoLoaded(true);
    startArrowAnimation();
  };

  const handleVideoError = () => {
    console.log('❌ Ошибка загрузки видео');
    setIsLoading(false);
    setHasError(true);
  };

  const handleSwipeUp = () => {
    // Скрываем контент перед анимацией
    setIsVideoLoaded(false);
    setHasError(false);
    setIsLoading(false);

    // Анимация ухода экрана вверх
    Animated.spring(translateY, {
      toValue: -screenHeight,
      stiffness: 100,
      damping: 10,
      mass: 1,
      useNativeDriver: true,
    }).start(() => {
      onComplete();
    });
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        activeOpacity={1}
        onPress={handleSwipeUp}
      >
        <Video
          source={require('../../assets/1117445_Woman_Caucasian_4096x2160.mov.mp4')}
          style={styles.video}
          shouldPlay
          isLooping
          resizeMode={ResizeMode.COVER}
          onLoad={handleVideoLoad}
          onError={handleVideoError}
        />

        {isLoading && !hasError && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Загрузка...</Text>
          </View>
        )}

        {hasError && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.overlay}
          >
            <View style={styles.bottomContent}>
              <Text style={styles.errorText}>Не удалось загрузить видео</Text>
              <Text style={styles.swipeText}>Нажмите для продолжения</Text>
            </View>
          </LinearGradient>
        )}

        {isVideoLoaded && !hasError && (
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.overlay}
          >
            <View style={styles.bottomContent}>
              <Animated.View
                style={[
                  styles.arrowContainer,
                  {
                    opacity: arrowOpacity,
                    transform: [{ translateY: arrowTranslateY }],
                  },
                ]}
              >
                <Text style={styles.arrow}>↑</Text>
              </Animated.View>
              <Text style={styles.swipeText}>Нажмите для продолжения</Text>
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  touchableArea: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  arrowContainer: {
    marginBottom: 10,
  },
  arrow: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  swipeText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
});
