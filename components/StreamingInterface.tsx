import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '../utils/responsive';
import CameraControls from './CameraControls';
import EffectsModal from './EffectsModal';
import MicrophoneModal from './MicrophoneModal';
import MonitoringIndicator from './MonitoringIndicator';
import ProModeMenu from './ProModeMenu';
import QuickAccessMenu from './QuickAccessMenu';
import ReplayModal from './ReplayModal';
import ShortcutButton from './ShortcutButton';
import SourceCard from './SourceCard';
import StreamButton from './StreamButton';
import VideoPreview from './VideoPreview';

// Use centralized responsive utilities instead of local device detection

const Colors = {
  background: '#0f172a', // slate-900
  surface: '#1e293b', // slate-800
  border: '#334155', // slate-700
  primary: '#22c55e', // green-500
  primaryHover: '#16a34a', // green-600
  text: '#ffffff',
  textSecondary: '#94a3b8', // slate-400
  danger: '#ef4444', // red-500
  warning: '#f59e0b', // amber-500
};

interface StreamingInterfaceProps {
  isStreaming: boolean;
  streamStats?: any;
  isInitializing: boolean;
  onStartStop: () => void;
  onQualityChange: (quality: '720p' | '1080p' | '480p' | '4K') => void;
  onLayoutChange: (layout: any) => void;
  currentLayout: any;
  cameraView?: React.ReactNode;
}

const StreamingInterface: React.FC<StreamingInterfaceProps> = ({
  isStreaming: propIsStreaming,
  streamStats,
  isInitializing,
  onStartStop,
  onQualityChange,
  onLayoutChange,
  currentLayout,
  cameraView
}) => {
  const router = useRouter();
  const responsive = useResponsive();
  const insets = useSafeAreaInsets();
  const [deviceType, setDeviceType] = useState(responsive.deviceType);
  const [isPortrait, setIsPortrait] = useState(responsive.orientation === 'portrait');
  
  const [isStreaming, setIsStreaming] = useState(propIsStreaming);
  const [activeSource, setActiveSource] = useState(0);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [isProModeOpen, setIsProModeOpen] = useState(false);
  const [isCameraControlsOpen, setIsCameraControlsOpen] = useState(false);
  const [isReplayModalOpen, setIsReplayModalOpen] = useState(false);
  const [isEffectsModalOpen, setIsEffectsModalOpen] = useState(false);
  const [isMicrophoneModalOpen, setIsMicrophoneModalOpen] = useState(false);
  
  const [replaySettings, setReplaySettings] = useState({
    enabled: false,
    bufferSeconds: 8
  });
  
  const [microphoneSettings, setMicrophoneSettings] = useState({
    enabled: true,
    volume: 75,
    zoomEnabled: true
  });
  
  const [stats, setStats] = useState({
    bitrate: '6000kbps',
    fps: '30fps',
    audioLevel: 75
  });

  // Sync with prop changes
  useEffect(() => {
    setIsStreaming(propIsStreaming);
  }, [propIsStreaming]);

  // Update responsive state when dimensions change
  useEffect(() => {
    setDeviceType(responsive.deviceType);
    setIsPortrait(responsive.orientation === 'portrait');
  }, [responsive.deviceType, responsive.orientation]);

  // Realistic audio level animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        audioLevel: Math.floor(Math.random() * 40) + 50 // Random between 50-90%
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const sources = [
    { id: 0, name: 'MOBILE CAMERA', isActive: true },
    { id: 1, name: 'USB CAMERA', isActive: true },
    { id: 2, name: 'WEB BROWSER - SINGULAR', isActive: true },
    { id: 3, name: 'XXXX', isActive: true }
  ];

  const handleSourceSelect = (sourceId: number) => {
    setActiveSource(sourceId);
  };

  const handleStreamToggle = () => {
    onStartStop();
  };

  const handleQuickAccessToggle = () => {
    setIsQuickAccessOpen(!isQuickAccessOpen);
    setIsProModeOpen(false);
    setIsReplayModalOpen(false);
    setIsEffectsModalOpen(false);
    setIsMicrophoneModalOpen(false);
  };

  const handleProModeOpen = () => {
    setIsQuickAccessOpen(false);
    setIsProModeOpen(true);
    setIsReplayModalOpen(false);
    setIsEffectsModalOpen(false);
    setIsMicrophoneModalOpen(false);
  };

  const handleProModeClose = () => {
    setIsProModeOpen(false);
  };

  const handleCameraControlsToggle = () => {
    setIsCameraControlsOpen(!isCameraControlsOpen);
    setIsQuickAccessOpen(false);
    setIsProModeOpen(false);
    setIsReplayModalOpen(false);
    setIsEffectsModalOpen(false);
    setIsMicrophoneModalOpen(false);
  };

  const handleReplayModalToggle = () => {
    setIsReplayModalOpen(!isReplayModalOpen);
    setIsQuickAccessOpen(false);
    setIsProModeOpen(false);
    setIsCameraControlsOpen(false);
    setIsEffectsModalOpen(false);
    setIsMicrophoneModalOpen(false);
  };

  const handleEffectsModalToggle = () => {
    setIsEffectsModalOpen(!isEffectsModalOpen);
    setIsQuickAccessOpen(false);
    setIsProModeOpen(false);
    setIsCameraControlsOpen(false);
    setIsReplayModalOpen(false);
    setIsMicrophoneModalOpen(false);
  };

  const handleMicrophoneModalToggle = () => {
    setIsMicrophoneModalOpen(!isMicrophoneModalOpen);
    setIsQuickAccessOpen(false);
    setIsProModeOpen(false);
    setIsCameraControlsOpen(false);
    setIsReplayModalOpen(false);
    setIsEffectsModalOpen(false);
  };

  const handleReplaySettingsChange = (enabled: boolean, seconds: number) => {
    setReplaySettings({ enabled, bufferSeconds: seconds });
    console.log(`Replay ${enabled ? 'enabled' : 'disabled'} with ${seconds} second buffer`);
  };

  const handleLastMovePress = () => {
    console.log(`Playing back last ${replaySettings.bufferSeconds} seconds`);
    setIsReplayModalOpen(false);
  };

  const handleBestMomentsPress = () => {
    console.log('Showing best moments');
    setIsReplayModalOpen(false);
  };

  const handleEffectSelect = (effectType: string, effectId: number) => {
    console.log(`Selected ${effectType} effect ${effectId}`);
    setIsEffectsModalOpen(false);
  };

  const handleWebOverlayAdd = (url: string, title: string) => {
    console.log(`Adding web overlay: ${title} - ${url}`);
  };

  const handleMicrophoneToggle = (enabled: boolean) => {
    setMicrophoneSettings(prev => ({ ...prev, enabled }));
    console.log(`Microphone ${enabled ? 'enabled' : 'disabled'}`);
  };

  const handleVolumeChange = (volume: number) => {
    setMicrophoneSettings(prev => ({ ...prev, volume }));
    console.log(`Volume changed to ${volume}%`);
  };

  const handleZoomChange = (zoom: number) => {
    setMicrophoneSettings(prev => ({ ...prev, zoomEnabled: zoom > 0 }));
    console.log(`Zoom ${zoom > 0 ? 'enabled' : 'disabled'}`);
  };

  // Responsive style functions
  const getResponsiveStyles = () => {
    const isMobile = responsive.isMobile;
    const isNativeMobile = responsive.isNativeMobile;
    const isTablet = responsive.deviceType.includes('tablet');
    const isDesktop = responsive.deviceType === 'desktop';
    const minTouchTarget = responsive.capabilities.minTouchTarget;

    return {
      // Header styles
      header: [
        styles.header,
        isMobile && styles.headerMobile,
        isTablet && styles.headerTablet,
        isDesktop && styles.headerDesktop,
        // Add safe area padding for mobile, prioritize native mobile
        (isMobile || isNativeMobile) && { paddingTop: Math.max(insets.top, 12) }
      ],
      
      // Main content layout
      mainContent: [
        styles.mainContent,
        (isMobile || isNativeMobile) && isPortrait && styles.mainContentMobilePortrait,
        (isMobile || isNativeMobile) && !isPortrait && styles.mainContentMobileLandscape,
        isTablet && !isNativeMobile && styles.mainContentTablet,
        isDesktop && styles.mainContentDesktop
      ],
      
      // Source sidebar
      sourceSidebar: [
        styles.sourceSidebar,
        (isMobile || isNativeMobile) && isPortrait && styles.sourceSidebarMobilePortrait,
        (isMobile || isNativeMobile) && !isPortrait && {
          ...styles.sourceSidebarMobileLandscape,
          width: responsive.controlPanelWidth || 120,
        },
        isTablet && !isNativeMobile && styles.sourceSidebarTablet,
        isDesktop && styles.sourceSidebarDesktop
      ],
      
      // Video preview container
      videoPreviewContainer: [
        styles.videoPreviewContainer,
        (isMobile || isNativeMobile) && styles.videoPreviewContainerMobile,
        isNativeMobile && !isPortrait && styles.videoPreviewContainerMobileLandscape,
        isTablet && !isNativeMobile && styles.videoPreviewContainerTablet,
        isDesktop && styles.videoPreviewContainerDesktop
      ],
      
      // Bottom section
      bottomSection: [
        styles.bottomSection,
        (isMobile || isNativeMobile) && isPortrait && styles.bottomSectionMobile,
        (isMobile || isNativeMobile) && !isPortrait && styles.bottomSectionMobileLandscape,
        isTablet && !isNativeMobile && styles.bottomSectionTablet,
        isDesktop && styles.bottomSectionDesktop,
        // Add safe area padding for mobile, prioritize native mobile
        (isMobile || isNativeMobile) && { paddingBottom: Math.max(insets.bottom, 12) }
      ],
      
      // Monitoring container
      monitoringContainer: [
        styles.monitoringContainer,
        (isMobile || isNativeMobile) && isPortrait && styles.monitoringContainerMobile,
        (isMobile || isNativeMobile) && !isPortrait && styles.monitoringContainerMobileLandscape,
        isTablet && !isNativeMobile && styles.monitoringContainerTablet,
        isDesktop && styles.monitoringContainerDesktop
      ]
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Section */}
      <View style={responsiveStyles.header}>
        <View style={styles.headerContent}>
          {/* Left Section */}
          <View style={styles.headerLeft}>
            <ShortcutButton
              label=''
              iconName="person.circle"
              isActive={isStreaming}
            />
          </View>
          
          {/* Right Section */}
          <View style={styles.headerRight}>
            <ShortcutButton
              iconName="gobackward"
              label=""
              isActive={replaySettings.enabled}
              onPress={handleReplayModalToggle}
            />
            <ShortcutButton
              iconName="waveform"
              label=""
              isActive={isStreaming}
              onPress={handleEffectsModalToggle}
            />
            <ShortcutButton
              iconName="mic.fill"
              label=""
              isActive={microphoneSettings.enabled}
              onPress={handleMicrophoneModalToggle}
            />
            <ShortcutButton
              iconName="video.fill"
              label=""
              isActive={isStreaming}
              onPress={handleCameraControlsToggle}
            />
            <ShortcutButton
              iconName="line.horizontal.3"
              label=""
              isActive={isStreaming}
              onPress={handleQuickAccessToggle}
            />
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={responsiveStyles.mainContent}>
        {/* Source Panel */}
        <View style={responsiveStyles.sourceSidebar}>
          <View style={[
            styles.sourceList,
            deviceType.includes('phone') && isPortrait && styles.sourceListMobile
          ]}>
            {sources.map((source) => (
              <SourceCard
                key={source.id}
                name={source.name}
                isOnAir={source.id === activeSource && isStreaming}
                isSelected={source.id === activeSource}
                onPress={() => handleSourceSelect(source.id)}
              />
            ))}
          </View>
        </View>

        {/* Central Video Preview */}
        <View style={responsiveStyles.videoPreviewContainer}>
          <VideoPreview 
            isStreaming={isStreaming}
            activeSource={sources[activeSource].name}
            cameraView={cameraView}
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View style={responsiveStyles.bottomSection}>
        {/* Audio Monitoring Widget */}
        <View style={responsiveStyles.monitoringContainer}>
          <MonitoringIndicator
            audioLevel={stats.audioLevel}
            bitrate={stats.bitrate}
            fps={stats.fps}
          />
        </View>

        {/* Centered Stream Control Button */}
        <View style={styles.streamButtonContainer}>
          <StreamButton
            isStreaming={isStreaming}
            onToggle={handleStreamToggle}
          />
        </View>
      </View>

      {/* Overlay Components */}
      <QuickAccessMenu
        isOpen={isQuickAccessOpen}
        onClose={() => setIsQuickAccessOpen(false)}
        onProModeClick={handleProModeOpen}
        onHomeClick={() => router.push('/')}
        onSettingsClick={() => router.push('/settings')}
      />

      <CameraControls
        isOpen={isCameraControlsOpen}
        onClose={() => setIsCameraControlsOpen(false)}
      />
      
      <ProModeMenu
        isOpen={isProModeOpen}
        onClose={handleProModeClose}
      />

      <ReplayModal
        isOpen={isReplayModalOpen}
        onClose={() => setIsReplayModalOpen(false)}
        onReplaySettingsChange={handleReplaySettingsChange}
        onLastMovePress={handleLastMovePress}
        onBestMomentsPress={handleBestMomentsPress}
      />

      <EffectsModal
        isOpen={isEffectsModalOpen}
        onClose={() => setIsEffectsModalOpen(false)}
        onEffectSelect={handleEffectSelect}
        onWebOverlayAdd={handleWebOverlayAdd}
      />

      <MicrophoneModal
        isOpen={isMicrophoneModalOpen}
        onClose={() => setIsMicrophoneModalOpen(false)}
        onMicrophoneToggle={handleMicrophoneToggle}
        onVolumeChange={handleVolumeChange}
        onZoomChange={handleZoomChange}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  // Header Styles
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerMobile: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 4,
  },
  headerTablet: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerDesktop: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 8,
  },
   
  // Main Content Styles
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContentMobilePortrait: {
    flexDirection: 'column',
  },
  mainContentMobileLandscape: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'stretch',
  },
  mainContentTablet: {
    flexDirection: 'row',
  },
  mainContentDesktop: {
    flexDirection: 'row',
  },
  
  // Source Sidebar Styles
  sourceSidebar: {
    width: 192,
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sourceSidebarMobilePortrait: {
    width: '100%',
    height: 36,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 2,
  },
  sourceSidebarMobileLandscape: {
    width: 120,
    padding: 4,
    minWidth: 110,
    maxWidth: 130,
  },
  sourceSidebarTablet: {
    width: 200,
    padding: 18,
  },
  sourceSidebarDesktop: {
    width: 240,
    padding: 20,
  },
  sourceList: {
    gap: 8,
  },
  sourceListMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    gap: 2,
  },
  
  // Video Preview Container Styles
  videoPreviewContainer: {
    flex: 1,
    padding: 16,
  },
  videoPreviewContainerMobile: {
    padding: 2,
    flex: 1,
  },
  videoPreviewContainerMobileLandscape: {
    padding: 2, // Reduced padding to maximize space
    flex: 2, // Increased flex weight to dominate space
    minHeight: '90%', // Increased by 5% from 85% to 90%
    height: '95%', // Added explicit height for better control
    position: 'relative',
  },
  videoPreviewContainerTablet: {
    padding: 18,
  },
  videoPreviewContainerDesktop: {
    padding: 20,
  },
  
  // Bottom Section Styles
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: 80,
  },
  bottomSectionMobile: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    minHeight: 45,
    flexDirection: 'column',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSectionMobileLandscape: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    minHeight: 40, // Reduced height for more video space
    flexDirection: 'column',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bottomSectionTablet: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    minHeight: 90,
  },
  bottomSectionDesktop: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: 100,
  },
  
  // Monitoring Container Styles
  monitoringContainer: {
    position: 'absolute',
    left: 20,
    bottom: 20,
  },
  monitoringContainerMobile: {
    position: 'relative',
    left: 'auto',
    bottom: 'auto',
    alignSelf: 'center',
    marginBottom: 4,
  },
  monitoringContainerMobileLandscape: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    zIndex: 20,
  },
  monitoringContainerTablet: {
    left: 24,
    bottom: 24,
  },
  monitoringContainerDesktop: {
    left: 28,
    bottom: 28,
  },
  
  streamButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StreamingInterface;