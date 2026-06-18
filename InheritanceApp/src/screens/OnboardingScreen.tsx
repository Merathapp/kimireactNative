import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: { icon: 'calculator' | 'git-compare' | 'folder-open' | 'share-social'; title: string; description: string }[] = [
    {
      icon: 'calculator',
      title: t('onboardingSlide1Title'),
      description: t('onboardingSlide1Desc'),
    },
    {
      icon: 'git-compare',
      title: t('onboardingSlide2Title'),
      description: t('onboardingSlide2Desc'),
    },
    {
      icon: 'folder-open',
      title: t('onboardingSlide3Title'),
      description: t('onboardingSlide3Desc'),
    },
    {
      icon: 'share-social',
      title: t('onboardingSlide4Title'),
      description: t('onboardingSlide4Desc'),
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('merath_onboarding_done', 'true');
    navigation.replace('MainTabs');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('merath_onboarding_done', 'true');
    navigation.replace('MainTabs');
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <Button onPress={handleSkip} textColor="#94a3b8" labelStyle={styles.skipText}>
          {t('onboardingSkip')}
        </Button>
      </View>

      <View style={styles.slideContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name={slide.icon} size={80} color="#4f46e5" />
        </View>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.activeDot,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttons}>
          {isLastSlide ? (
            <Button
              mode="contained"
              onPress={handleGetStarted}
              style={styles.startButton}
              labelStyle={styles.startButtonLabel}
            >
              {t('onboardingStart')}
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.nextButton}
              labelStyle={styles.nextButtonLabel}
            >
              {t('onboardingNext')}
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e293b',
  },
  skipContainer: {
    alignItems: 'flex-end',
    padding: 16,
    paddingTop: 50,
  },
  skipText: {
    fontSize: 16,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#475569',
  },
  activeDot: {
    backgroundColor: '#4f46e5',
    width: 24,
  },
  buttons: {
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 4,
  },
  nextButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 4,
  },
  startButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
