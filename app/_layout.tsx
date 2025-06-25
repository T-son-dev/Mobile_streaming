import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f0f23',
    card: '#1a1a2e',
    primary: '#00ff88',
    text: '#ffffff',
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? CustomDarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1a1a2e',
          },
          headerTintColor: '#00ff88',
          headerTitleStyle: {
            fontWeight: 'bold',
            color: '#ffffff',
          },
          contentStyle: {
            backgroundColor: '#0f0f23',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="home" 
          options={{ 
            title: 'Mobile Streaming App',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="live-stream" 
          options={{ 
            title: 'Live Stream',
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ 
            title: 'Settings' 
          }} 
        />
        <Stack.Screen 
          name="overlay" 
          options={{ 
            title: 'Overlay Manager' 
          }} 
        />
        <Stack.Screen 
          name="relay" 
          options={{ 
            title: 'Relay Gallery' 
          }} 
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" backgroundColor="#1a1a2e" />
    </ThemeProvider>
  );
}