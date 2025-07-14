import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
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

const { width, height } = Dimensions.get('window');

// Responsive breakpoint definitions
const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

const getDeviceType = () => {
  if (width < breakpoints.mobile) return 'mobile';
  if (width < breakpoints.tablet) return 'tablet';
  return 'desktop';
};

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
}

const StreamingInterface: React.FC<StreamingInterfaceProps> = ({
  isStreaming: propIsStreaming,
  streamStats,
  isInitializing,
  onStartStop,
  onQualityChange,
  onLayoutChange,
  currentLayout
}) => {
  const router = useRouter();
  const responsive = useResponsive();
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
    const isMobile = deviceType.includes('phone');
    const isTablet = deviceType.includes('tablet');
    const isDesktop = deviceType === 'desktop';

    return {
      // Header styles
      header: [
        styles.header,
        isMobile && styles.headerMobile,
        isTablet && styles.headerTablet,
        isDesktop && styles.headerDesktop
      ],
      
      // Main content layout
      mainContent: [
        styles.mainContent,
        isMobile && isPortrait && styles.mainContentMobilePortrait,
        isMobile && !isPortrait && styles.mainContentMobileLandscape,
        isTablet && styles.mainContentTablet,
        isDesktop && styles.mainContentDesktop
      ],
      
      // Source sidebar
      sourceSidebar: [
        styles.sourceSidebar,
        isMobile && isPortrait && styles.sourceSidebarMobilePortrait,
        isMobile && !isPortrait && styles.sourceSidebarMobileLandscape,
        isTablet && styles.sourceSidebarTablet,
        isDesktop && styles.sourceSidebarDesktop
      ],
      
      // Video preview container
      videoPreviewContainer: [
        styles.videoPreviewContainer,
        isMobile && styles.videoPreviewContainerMobile,
        isTablet && styles.videoPreviewContainerTablet,
        isDesktop && styles.videoPreviewContainerDesktop
      ],
      
      // Bottom section
      bottomSection: [
        styles.bottomSection,
        isMobile && styles.bottomSectionMobile,
        isTablet && styles.bottomSectionTablet,
        isDesktop && styles.bottomSectionDesktop
      ],
      
      // Monitoring container
      monitoringContainer: [
        styles.monitoringContainer,
        isMobile && styles.monitoringContainerMobile,
        isTablet && styles.monitoringContainerTablet,
        isDesktop && styles.monitoringContainerDesktop
      ]
    };
  };

  const responsiveStyles = getResponsiveStyles();

  return (
    <View style={styles.container}>
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
            <TouchableOpacity
              onPress={handleQuickAccessToggle}
              style={styles.menuButton}
            >
              <View style={[styles.menuButtonCircle, isQuickAccessOpen && styles.menuButtonActive]}>
                <IconSymbol name="line.horizontal.3" size={24} color={Colors.background} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={responsiveStyles.mainContent}>
        {/* Source Panel */}
        <View style={responsiveStyles.sourceSidebar}>
          <View style={styles.sourceList}>
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
    </View>
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
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
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
  menuButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonActive: {
    backgroundColor: Colors.primaryHover,
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
    height: 120,
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    padding: 12,
  },
  sourceSidebarMobileLandscape: {
    width: 160,
    padding: 12,
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
    gap: 12,
  },
  
  // Video Preview Container Styles
  videoPreviewContainer: {
    flex: 1,
    padding: 16,
  },
  videoPreviewContainerMobile: {
    padding: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 70,
    flexDirection: 'column',
    gap: 12,
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