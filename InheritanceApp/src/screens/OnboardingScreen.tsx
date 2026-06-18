import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = StackNavigationProp<RootStackParamList>;

const slides: { icon: 'calculator' | 'git-compare' | 'folder-open' | 'share-social'; title: string; description: string }[] = [
  {
    icon: 'calculator',
    title: 'حساب المواريث الإسلامية',
    description: 'قم بحساب توزيع التركة بدقة وفقاً للشريعة الإسلامية وبأكثر من مذهب فقهي',
  },
  {
    icon: 'git-compare',
    title: 'مقارنة المذاهب',
    description: 'قارن نتائج التوزيع بين المذاهب الأربعة: الحنفي، المالكي، الشافعي، والحنبلي',
  },
  {
    icon: 'folder-open',
    title: 'حفظ السيناريوهات',
    description: 'احفظ حساباتك لتراجعها لاحقاً، وقم بتصدير واستيراد السيناريوهات بسهولة',
  },
  {
    icon: 'share-social',
    title: 'مشاركة النتائج',
    description: 'شارك نتائج الحساب مع العائلة والمستشارين الشرعيين عبر PDF أو CSV أو نص',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const [currentSlide, setCurrentSlide] = useState(0);

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
          تخطي
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
              ابدأ الآن
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={handleNext}
              style={styles.nextButton}
              labelStyle={styles.nextButtonLabel}
            >
              التالي
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
