import React, { createContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const OnboardingContext = createContext();

const ONBOARDING_KEY = 'onboarding_completed';

export const OnboardingProvider = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if onboarding has been completed
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('Error loading onboarding status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOnboardingStatus();
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
    }
  }, []);

  const resetOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_KEY);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  }, []);

  const value = {
    hasCompletedOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
