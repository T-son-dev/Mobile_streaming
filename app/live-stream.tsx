import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import DualCameraView from '@/components/DualCameraView';
import StreamingInterface from '@/components/StreamingInterface';
import { CameraLayout } from '@/services/DualCameraManager';
import { useStreaming } from '@/hooks/useStreaming';
import streamingService from '@/services/streamingService';
import { useResponsive } from '@/utils/responsive';
import { CURRENT_STREAMING_CONFIG } from '@/config/streamingConfig';

const LiveStreamScreen: React.FC = () => {
  const router = useRouter();
  const responsive = useResponsive();
  const [cameraLayout, setCameraLayout] = useState<CameraLayout>(CameraLayout.SINGLE_BACK);
  const [isInitialized, setIsInitialized] = useState(false);
  const { 
    isStreaming, 
    streamStats, 
    isInitializing, 
    error, 
    initializeStream,
    startStream,
    stopStream,
    clearError 
  } = useStreaming();

  useEffect(() => {
    // Enhanced orientation handling for mobile devices and emulators
    const setOrientation = async () => {
      try {
        // Check if we're on native mobile platform
        if (responsive.isNativeMobile) {
          // For native mobile, allow both orientations but optimize layout
          await ScreenOrientation.unlockAsync();
        } else if (responsive.deviceType.includes('tablet') || responsive.deviceType === 'desktop') {
          // For tablets and desktops, prefer landscape
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          // For web mobile, allow both orientations
          await ScreenOrientation.unlockAsync();
        }
      } catch (error) {
        console.error('Failed to set orientation:', error);
      }
    };
    
    setOrientation();
    initializeStreamingSystem();
    
    return () => {
      // Cleanup when component unmounts
      if (isStreaming) {
        stopStream();
      }
      streamingService.dispose();
      
      // Reset orientation when leaving screen
      ScreenOrientation.unlockAsync().catch(console.error);
    };
  }, [responsive.deviceType]);

  useEffect(() => {
    if (error) {
      Alert.alert('Streaming Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const initializeStreamingSystem = async () => {
    try {
      // Use configuration from streamingConfig.ts
      const defaultConfig = CURRENT_STREAMING_CONFIG;

      const success = await initializeStream(defaultConfig);
      setIsInitialized(success);

      if (!success) {
        Alert.alert('Initialization Failed', 'Could not initialize streaming system');
      }
    } catch (error) {
      console.error('Failed to initialize streaming system:', error);
      Alert.alert('Error', 'Failed to initialize streaming system');
    }
  };

  const handleLayoutChange = async (layout: CameraLayout) => {
    try {
      const success = await streamingService.switchCameraLayout(layout);
      if (success) {
        setCameraLayout(layout);
      } else {
        Alert.alert('Error', 'Failed to change camera layout');
      }
    } catch (error) {
      console.error('Error changing camera layout:', error);
      Alert.alert('Error', 'Failed to change camera layout');
    }
  };

  const handleCameraSwitch = () => {
    if (cameraLayout === CameraLayout.SINGLE_FRONT) {
      handleLayoutChange(CameraLayout.SINGLE_BACK);
    } else if (cameraLayout === CameraLayout.SINGLE_BACK) {
      handleLayoutChange(CameraLayout.SINGLE_FRONT);
    }
  };

  const handleStartStreaming = async () => {
    if (isStreaming) {
      await stopStream();
    } else {
      await startStream();
    }
  };

  const handleQualityChange = async (quality: '720p' | '1080p' | '480p' | '4K') => {
    try {
      if (isStreaming) {
        Alert.alert('Quality Change', 'Cannot change quality while streaming. Please stop the stream first.');
        return;
      }

      const success = await streamingService.updateStreamQuality(quality);
      if (!success) {
        Alert.alert('Error', 'Failed to update stream quality');
      }
    } catch (error) {
      console.error('Error changing quality:', error);
      Alert.alert('Error', 'Failed to change stream quality');
    }
  };

  // Create responsive styles
  const responsiveStyles = createResponsiveStyles(responsive);

  if (!isInitialized && !isInitializing) {
    return (
      <View style={responsiveStyles.container}>
        <View style={responsiveStyles.errorContainer}>
          {/* Could add error UI here */}
        </View>
      </View>
    );
  }

  return (
    <View style={responsiveStyles.container}>
      <StatusBar hidden={true} />
      
      <StreamingInterface
        isStreaming={isStreaming}
        streamStats={streamStats}
        isInitializing={isInitializing}
        onStartStop={handleStartStreaming}
        onQualityChange={handleQualityChange}
        onLayoutChange={handleLayoutChange}
        currentLayout={cameraLayout}
        cameraView={
          <DualCameraView
            layout={cameraLayout}
            onLayoutChange={handleLayoutChange}
            onCameraSwitch={handleCameraSwitch}
            style={{ flex: 1 }}
          />
        }
      />
    </View>
  );
};

const createResponsiveStyles = (responsive: ReturnType<typeof useResponsive>) => {
  const { orientation, deviceType, safeAreaHorizontal, safeAreaVertical } = responsive;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#333',
      padding: safeAreaHorizontal,
      zIndex: 5,
    },
  });
};

export default LiveStreamScreen;