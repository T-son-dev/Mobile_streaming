import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import {useRouter, useLocalSearchParams} from 'expo-router';

const {width, height} = Dimensions.get('window');

const LiveStreamScreen: React.FC = () => {
  const router = useRouter();
  const {platform, rtmpUrl, streamKey} = useLocalSearchParams<{
    platform?: string;
    rtmpUrl?: string;
    streamKey?: string;
  }>();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [frontCamera, setFrontCamera] = useState(true);

  const streamStats = {
    bitrate: '2.5 Mbps',
    fps: '30 FPS',
    droppedFrames: '0.2%',
    network: 'Excellent',
  };

  const videoQualities = ['1080p 60fps', '1080p 30fps', '720p 60fps', '720p 30fps'];
  const [selectedQuality, setSelectedQuality] = useState(videoQualities[1]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
        setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStreamToggle = () => {
    if (isStreaming) {
      setIsStreaming(false);
      setStreamDuration(0);
      setViewerCount(0);
    } else {
      setIsStreaming(true);
      setViewerCount(Math.floor(Math.random() * 50) + 10);
    }
  };

  const getPlatformColor = () => {
    switch (platform) {
      case 'youtube':
        return '#FF0000';
      case 'facebook':
        return '#1877F2';
      case 'instagram':
        return '#E4405F';
      case 'twitch':
        return '#9146FF';
      case 'rtmp':
        return '#00ff88';
      case 'srt':
        return '#FFA500';
      default:
        return '#00ff88';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0f0f23" barStyle="light-content" />
      
      {/* Professional Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.platformInfo}>
          <View style={[styles.platformDot, {backgroundColor: getPlatformColor()}]} />
          <Text style={styles.platformText}>
            {platform?.toUpperCase() || 'LIVE'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Main Camera Preview Area */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPreview}>
          <Text style={styles.cameraPlaceholderIcon}>📹</Text>
          <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
          <Text style={styles.cameraNote}>
            Full camera integration coming in Week 2
          </Text>
        </View>

        {/* Live Stream Overlay */}
        {isStreaming && (
          <View style={styles.streamOverlay}>
            <View style={styles.liveIndicator}>
              <Text style={styles.liveText}>LIVE</Text>
              <Text style={styles.viewerCount}>👥 {viewerCount}</Text>
            </View>
            <Text style={styles.streamDuration}>{formatDuration(streamDuration)}</Text>
          </View>
        )}

        {/* Camera Controls Sidebar */}
        <View style={styles.controlsSidebar}>
          <TouchableOpacity
            style={[styles.controlButton, flashEnabled && styles.controlButtonActive]}
            onPress={() => setFlashEnabled(!flashEnabled)}>
            <Text style={styles.controlIcon}>⚡</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFrontCamera(!frontCamera)}>
            <Text style={styles.controlIcon}>🔄</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, !micEnabled && styles.controlButtonDisabled]}
            onPress={() => setMicEnabled(!micEnabled)}>
            <Text style={styles.controlIcon}>{micEnabled ? '🎤' : '🔇'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stream Statistics Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bitrate</Text>
          <Text style={styles.statValue}>{streamStats.bitrate}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>FPS</Text>
          <Text style={styles.statValue}>{streamStats.fps}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Dropped</Text>
          <Text style={styles.statValue}>{streamStats.droppedFrames}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Network</Text>
          <Text style={[styles.statValue, styles.networkGood]}>
            {streamStats.network}
          </Text>
        </View>
      </View>

      {/* Main Stream Controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          style={[
            styles.streamButton,
            isStreaming ? styles.streamButtonStop : styles.streamButtonStart,
          ]}
          onPress={handleStreamToggle}>
          <Text style={styles.streamButtonText}>
            {isStreaming ? 'Stop Stream' : 'Start Stream'}
          </Text>
        </TouchableOpacity>

        {/* Secondary Controls */}
        <View style={styles.secondaryControls}>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonIcon}>🎨</Text>
            <Text style={styles.secondaryButtonText}>Overlays</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonIcon}>🔄</Text>
            <Text style={styles.secondaryButtonText}>Replay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonIcon}>💬</Text>
            <Text style={styles.secondaryButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Modal */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSettingsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.settingsModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Stream Settings</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setSettingsVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.settingSection}>Video Quality</Text>
              {videoQualities.map((quality) => (
                <TouchableOpacity
                  key={quality}
                  style={[
                    styles.settingOption,
                    selectedQuality === quality && styles.settingOptionSelected,
                  ]}
                  onPress={() => setSelectedQuality(quality)}>
                  <Text
                    style={[
                      styles.settingOptionText,
                      selectedQuality === quality && styles.settingOptionTextSelected,
                    ]}>
                    {quality}
                  </Text>
                </TouchableOpacity>
              ))}
              
              <Text style={styles.settingSection}>Connection Info</Text>
              <View style={styles.connectionInfo}>
                <Text style={styles.connectionLabel}>Platform:</Text>
                <Text style={styles.connectionValue}>
                  {platform?.toUpperCase() || 'Unknown'}
                </Text>
              </View>
              {rtmpUrl && (
                <View style={styles.connectionInfo}>
                  <Text style={styles.connectionLabel}>RTMP URL:</Text>
                  <Text style={styles.connectionValue} numberOfLines={1}>
                    {rtmpUrl}
                  </Text>
                </View>
              )}
              
              <Text style={styles.settingSection}>Audio Settings</Text>
              <View style={styles.settingToggle}>
                <Text style={styles.settingToggleLabel}>Microphone</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    micEnabled && styles.toggleSwitchOn,
                  ]}
                  onPress={() => setMicEnabled(!micEnabled)}>
                  <View
                    style={[
                      styles.toggleButton,
                      micEnabled && styles.toggleButtonOn,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  platformInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  platformDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  platformText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 18,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  cameraPlaceholderIcon: {
    fontSize: 48,
    marginBottom: 15,
    opacity: 0.5,
  },
  cameraPlaceholderText: {
    color: '#666',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  cameraNote: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  streamOverlay: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  viewerCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  streamDuration: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  controlsSidebar: {
    position: 'absolute',
    right: 30,
    top: '50%',
    transform: [{translateY: -75}],
  },
  controlButton: {
    backgroundColor: 'rgba(26, 26, 46, 0.8)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  controlButtonActive: {
    backgroundColor: '#00ff88',
    borderColor: '#00ff88',
  },
  controlButtonDisabled: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderColor: '#ff0000',
  },
  controlIcon: {
    fontSize: 20,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  networkGood: {
    color: '#00ff88',
  },
  mainControls: {
    padding: 20,
    backgroundColor: '#1a1a2e',
  },
  streamButton: {
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  streamButtonStart: {
    backgroundColor: '#00ff88',
  },
  streamButtonStop: {
    backgroundColor: '#ff4444',
  },
  streamButtonText: {
    color: '#0f0f23',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: 10,
  },
  secondaryButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  secondaryButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  settingsModal: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    padding: 5,
  },
  modalCloseText: {
    color: '#888',
    fontSize: 18,
  },
  modalBody: {
    padding: 20,
  },
  settingSection: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  settingOption: {
    backgroundColor: '#0f0f23',
    padding: 15,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  settingOptionSelected: {
    borderColor: '#00ff88',
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
  },
  settingOptionText: {
    color: '#ffffff',
    fontSize: 16,
  },
  settingOptionTextSelected: {
    color: '#00ff88',
    fontWeight: '600',
  },
  connectionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  connectionLabel: {
    color: '#888',
    fontSize: 14,
  },
  connectionValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  settingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingToggleLabel: {
    color: '#ffffff',
    fontSize: 16,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: '#00ff88',
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    transform: [{translateX: 0}],
  },
  toggleButtonOn: {
    transform: [{translateX: 22}],
  },
});

export default LiveStreamScreen;