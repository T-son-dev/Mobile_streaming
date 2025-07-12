import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import CameraControls from './CameraControls';
import MonitoringIndicator from './MonitoringIndicator';
import ProModeMenu from './ProModeMenu';
import QuickAccessMenu from './QuickAccessMenu';
import ShortcutButton from './ShortcutButton';
import SourceCard from './SourceCard';
import StreamButton from './StreamButton';
import VideoPreview from './VideoPreview';

const { width, height } = Dimensions.get('window');

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
  // Props can be added here if needed
}

const StreamingInterface: React.FC<StreamingInterfaceProps> = () => {
  const router = useRouter();
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeSource, setActiveSource] = useState(0);
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false);
  const [isProModeOpen, setIsProModeOpen] = useState(false);
  const [isCameraControlsOpen, setIsCameraControlsOpen] = useState(false);
  const [stats, setStats] = useState({
    bitrate: '6000kbps',
    fps: '30fps',
    audioLevel: 75
  });

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
    setIsStreaming(!isStreaming);
  };

  const handleQuickAccessToggle = () => {
    setIsQuickAccessOpen(!isQuickAccessOpen);
    setIsProModeOpen(false);
  };

  const handleProModeOpen = () => {
    setIsQuickAccessOpen(false);
    setIsProModeOpen(true);
  };

  const handleProModeClose = () => {
    setIsProModeOpen(false);
  };

  const handleCameraControlsToggle = () => {
    setIsCameraControlsOpen(!isCameraControlsOpen);
    setIsQuickAccessOpen(false);
    setIsProModeOpen(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {/* Left Section - 50% width */}
          <View style={styles.headerLeft}>
            <ShortcutButton
              label=''
              iconName="person.circle"
              isActive={isStreaming}
            />
          </View>
          
          {/* Right Section - 50% width */}
          <View style={styles.headerRight}>
            <ShortcutButton
              iconName="gobackward"
              label=""
              isActive={isStreaming}
            />
            <ShortcutButton
              iconName="waveform"
              label=""
              isActive={isStreaming}
            />
            <ShortcutButton
              iconName="mic.fill"
              label=""
              isActive={isStreaming}
            />
            <ShortcutButton
              iconName="video.fill"
              label=""
              isActive={isStreaming}
              onPress={handleCameraControlsToggle} // Add this line
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
      <View style={styles.mainContent}>
        {/* Left Sidebar - Source Panel */}
        <View style={styles.sourceSidebar}>
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
        <View style={styles.videoPreviewContainer}>
          <VideoPreview 
            isStreaming={isStreaming}
            activeSource={sources[activeSource].name}
          />
        </View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Audio Monitoring Widget - Left Side */}
        <View style={styles.monitoringContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  sourceSidebar: {
    width: 192, // 48 * 4 = 192 (w-48 in Tailwind)
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  sourceList: {
    gap: 12,
  },
  videoPreviewContainer: {
    flex: 1,
    padding: 16,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monitoringContainer: {
    position: 'absolute',
    left: 20,
    bottom: 20,
  },
  streamButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StreamingInterface;