import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import 'react-native-reanimated';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f0f23',
    card: '#1a1a2e',
    primary: '#7ED321',
    text: '#ffffff',
  },
};

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Handle Android back button for streaming screen
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // This will be handled per screen as needed
      return false; // Allow default back action
    });

    return () => backHandler.remove();
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={CustomDarkTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#2a2a3e',
          },
          headerTintColor: '#7ED321',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#ffffff',
            fontSize: 18,
          },
          contentStyle: {
            backgroundColor: '#0f0f23',
          },
          // Animation timing
          transitionSpec: {
            open: {
              animation: 'timing',
              config: {
                duration: 300,
              },
            },
            close: {
              animation: 'timing',
              config: {
                duration: 250,
              },
            },
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="home" 
          options={{ 
            title: 'APLICATIVO TRANSMISSÃO',
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: '#1a1a2e',
              elevation: 0,
              shadowOpacity: 0,
            },
          }} 
        />
        <Stack.Screen 
          name="live-stream" 
          options={{ 
            title: 'Transmissão Ao Vivo',
            headerShown: false,
            gestureEnabled: false, // Prevent swipe to dismiss
            // Full screen modal-like presentation
            presentation: 'fullScreenModal',
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Configurações',
            presentation: 'modal',
            headerLeft: () => null, // Remove back button, use custom close
          }} 
        />
        <Stack.Screen 
          name="overlay" 
          options={{ 
            title: 'Gerenciador de Overlays',
            presentation: 'modal',
            headerLeft: () => null,
          }} 
        />
        <Stack.Screen 
          name="relay" 
          options={{ 
            title: 'Galeria de Replays',
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#0f0f23" translucent />
    </ThemeProvider>
  );
}