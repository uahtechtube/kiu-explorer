import FontAwesome from '@expo/vector-icons/FontAwesome';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

// Suppress "Unable to activate keep awake" warnings and promise rejections in development
LogBox.ignoreLogs(['Unable to activate keep awake']);
if (typeof global !== 'undefined') {
  const originalRejectionHandler = (global as any).onunhandledrejection;
  (global as any).onunhandledrejection = (id: any, error: any) => {
    if (error && (error.message?.includes('keep awake') || error.message?.includes('KeepAwake'))) {
      return;
    }
    if (originalRejectionHandler) {
      originalRejectionHandler(id, error);
    }
  };
}

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { useRouter, useSegments } from 'expo-router';
import LoadingScreen from '../components/LoadingScreen';





export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { Platform } from 'react-native';
import api from '../lib/api';

// Bulletproof notifications token retriever
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'web') return null;
  let token = null;
  try {
    const Constants = require('expo-constants').default;

    // Remote push notifications are completely removed from Expo Go starting with SDK 53.
    // We skip loading and registering to avoid Expo Go runtime crash errors.
    if (Constants.appOwnership === 'expo') {
      console.log('ℹ️ Push notifications setup skipped: remote notifications are not supported in Expo Go client.');
      return null;
    }

    const Notifications = require('expo-notifications');
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return null;
    }
    
    const projectId = 
      Constants.expoConfig?.extra?.eas?.projectId ?? 
      Constants.easConfig?.projectId;

    if (projectId) {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } else {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    }
  } catch (e) {
    console.log('Notifications setup skipped or not supported:', e);
  }
  return token;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <WebSocketProvider>
        <RootLayoutNav />
      </WebSocketProvider>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Trigger registering push token on login
  useEffect(() => {
    if (user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          api.post('/profile/push-token', { expo_push_token: token })
            .then(() => console.log('🚀 Push token registered with backend successfully'))
            .catch(err => console.error('Failed to save push token to backend:', err));
        }
      });
    }
  }, [user]);

  // Enhanced authentication guard with role-based redirect logic
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // User not authenticated - redirect to welcome/login
      router.replace('/(auth)/welcome');
    } else if (user && inAuthGroup) {
      // User authenticated but on auth screen - redirect based on role
      switch (user.role) {
        case 'admin':
          router.replace('/admin/dashboard');
          break;
        case 'lecturer':
          router.replace('/lecturer/dashboard');
          break;
        case 'student':
        default:
          router.replace('/(tabs)');
          break;
      }
    }
  }, [user, isLoading, segments]);

  // Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(association-exec)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
