import FontAwesome from '@expo/vector-icons/FontAwesome';
import '../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { LogBox } from 'react-native';

// Suppress "Unable to activate keep awake" warnings and promise rejections in development
LogBox.ignoreLogs(['Unable to activate keep awake']);
if (typeof globalThis !== 'undefined') {
  const originalRejectionHandler = (globalThis as any).onunhandledrejection;
  (globalThis as any).onunhandledrejection = (id: any, error: any) => {
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
  // Ensure that initial route defaults to (auth) until authentication is checked.
  initialRouteName: '(auth)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { Platform, Alert, View, Text, TouchableOpacity, Keyboard, Linking } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
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
    
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldMutateNotification: false,
        shouldBadge: false,
      }),
    });
    
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
  } catch (e: any) {
    console.log('Notifications setup skipped or not supported:', e);
    Alert.alert('Push Notification Error', e.message || String(e));
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

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    // Fetch WhatsApp contact
    api.get('/school/info')
      .then(res => {
        if (res.data && res.data.whatsapp_number) {
          setWhatsappNumber(res.data.whatsapp_number);
        }
      })
      .catch(err => console.log('Notice: Failed to fetch support number in layout:', err));

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleOpenWhatsapp = () => {
    if (!whatsappNumber) return;
    const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
    const url = `whatsapp://send?phone=${cleanNumber}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          return Linking.openURL(`https://wa.me/${cleanNumber}`);
        }
      })
      .catch(err => {
        console.error(err);
      });
  };

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

  // Handle notification taps: navigate to the in-app notification inbox
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let subscription: any = null;
    try {
      const Constants = require('expo-constants').default;
      if (Constants.appOwnership === 'expo') return; // Expo Go: notifications not supported
      const Notifications = require('expo-notifications');

      const openInbox = () => {
        if (user) {
          router.push('/notifications' as any);
        }
      };

      // Handle a notification tapped while app was killed (cold start)
      Notifications.getLastNotificationResponseAsync()
        .then((response: any) => {
          if (response?.notification) openInbox();
        })
        .catch(() => { });

      // Handle a notification tapped while the app is running/backgrounded
      subscription = Notifications.addNotificationResponseReceivedListener(() => openInbox());
    } catch (e) {
      console.log('Notification tap listener setup skipped:', e);
    }
    return () => {
      if (subscription) subscription.remove();
    };
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
      switch (user.role as string) {
        case 'admin':
        case 'management':
          router.replace('/admin/dashboard');
          break;
        case 'dean':
          router.replace('/dean/dashboard');
          break;
        case 'hod':
          router.replace('/hod/dashboard');
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
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(association-exec)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>

        {whatsappNumber && !keyboardVisible ? (
          <TouchableOpacity
            onPress={handleOpenWhatsapp}
            style={{
              position: 'absolute',
              bottom: 30,
              right: 20,
              backgroundColor: '#25D366',
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 30,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 6,
              flexDirection: 'row',
              alignItems: 'center',
              zIndex: 9999,
            }}
            activeOpacity={0.8}
          >
            <MessageCircle size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 15 }}>Get Help</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </ThemeProvider>
  );
}
