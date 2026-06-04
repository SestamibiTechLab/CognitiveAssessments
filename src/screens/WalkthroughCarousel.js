import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  SafeAreaView,
  Pressable,
  Text,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { useOnboarding } from '../features/onboarding/useOnboarding';

const WalkthroughCarousel = ({ onClose }) => {
  const { completeOnboarding } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const { height, width } = Dimensions.get('window');

  const screenshots = [
    require('../../assets/Screenshot1_with_arrow.jpg'),
    require('../../assets/Screenshot2_with_arrows.png'),
    require('../../assets/Screenshot3_with_arrow.jpg'),
    require('../../assets/Screenshot4_with_arrow.png'),
    require('../../assets/Screenshot5_with_arrow.png'),
    require('../../assets/Screenshot6_with_arrow.png'),
  ];

  const panResponderRef = useRef(null);

  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, { dx }) => {
        const swipeThreshold = 50;

        setCurrentIndex((prevIndex) => {
          let newIndex = prevIndex;
          if (dx > swipeThreshold && prevIndex > 0) {
            newIndex = prevIndex - 1;
          } else if (dx < -swipeThreshold && prevIndex < screenshots.length - 1) {
            newIndex = prevIndex + 1;
          }
          return newIndex;
        });
      },
    });
  }

  const panResponder = panResponderRef.current;

  // Fade animation when image changes
  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, fadeAnim]);

  const handleNext = () => {
    if (currentIndex < screenshots.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleClose = async () => {
    await completeOnboarding();
    onClose();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Full-screen image with swipe gestures */}
      <View style={styles.imageContainer} {...panResponder.panHandlers}>
        <Animated.Image
          source={screenshots[currentIndex]}
          style={[styles.image, { opacity: fadeAnim }]}
          resizeMode="contain"
        />
      </View>

      {/* Navigation footer */}
      <View style={styles.footer}>
        {/* Indicator dots */}
        <View style={styles.dotsContainer}>
          {screenshots.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              currentIndex === 0 && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Text style={styles.buttonText}>Back</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleNext}
          >
            <Text style={styles.primaryButtonText}>
              {currentIndex === screenshots.length - 1 ? 'Done' : 'Next'}
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.skipButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleClose}
          >
            <Text style={styles.skipButtonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    flexDirection: 'column',
  },
  imageContainer: {
    flex: 1,
    width: '100%',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingTop: 15,
    paddingBottom: 50,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#0d6efd',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: '#fff',
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

export default WalkthroughCarousel;
