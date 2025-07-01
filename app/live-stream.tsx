import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Modal,
  Alert,
  ScrollView,
  SafeAreaView,
  Animated,
} from 'react-native';
import {useRouter, useLocalSearchParams} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  BrandColors,
  BackgroundColors,
  TextColors,
  AnimationConfig,
  Spacing,
  Typography,
  Shadows,
} from '@/constants/Colors';

// Removed dimensions as they're not used in this component

const LiveStreamScreen: React.FC = () => {
  const router = useRouter();
  const {platform, streamUrl} = useLocalSearchParams<{
    platform?: string;
    streamUrl?: string;
  }>();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);
  const [showOverlayMenu, setShowOverlayMenu] = useState(false);
  const [showReplayMenu, setShowReplayMenu] = useState(false);
  const [showCameraMenu, setShowCameraMenu] = useState(false);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('back');
  const [micEnabled, setMicEnabled] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState('CAMERA CELULAR');

  // Performance monitoring
  const [performanceStats, setPerformanceStats] = useState({
    cpu: 45,
    memory: 62,
    network: 8.5,
    fps: 30,
    bitrate: 6000,
    droppedFrames: 0,
    temperature: 42,
  });

  // Zoom control with spring animation
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const zoomAnimation = useRef(new Animated.Value(1.0)).current;

  // Camera options
  const cameraOptions = [
    'CAMERA CELULAR',
    'CAMERA USB',
    'NAVEGADOR WEB - SINGULAR',
    'XXXX'
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let performanceInterval: NodeJS.Timeout;
    
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
        setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      }, 1000);

      // Performance stats update
      performanceInterval = setInterval(() => {
        setPerformanceStats(prev => ({
          cpu: Math.max(20, Math.min(90, prev.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(30, Math.min(85, prev.memory + (Math.random() - 0.5) * 5)),
          network: Math.max(1, Math.min(20, prev.network + (Math.random() - 0.5) * 2)),
          fps: Math.random() > 0.95 ? Math.floor(Math.random() * 5) + 25 : 30,
          bitrate: Math.max(4000, Math.min(8000, prev.bitrate + (Math.random() - 0.5) * 500)),
          droppedFrames: prev.droppedFrames + (Math.random() > 0.9 ? 1 : 0),
          temperature: Math.max(35, Math.min(65, prev.temperature + (Math.random() - 0.5) * 2)),
        }));
      }, 2000);
    }
    
    return () => {
      clearInterval(interval);
      clearInterval(performanceInterval);
    };
  }, [isStreaming]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStopStream = () => {
    if (isStreaming) {
      Alert.alert(
        'Encerrar Transmissão',
        'Tem certeza que deseja parar a transmissão?',
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Encerrar',
            style: 'destructive',
            onPress: () => {
              setIsStreaming(false);
              setStreamDuration(0);
              setViewerCount(0);
            },
          },
        ]
      );
    } else {
      setIsStreaming(true);
      setViewerCount(Math.floor(Math.random() * 10) + 1);
    }
  };

  const handleCameraSwitch = () => {
    setCameraFacing(prev => prev === 'front' ? 'back' : 'front');
  };

  const handleMicToggle = () => {
    setMicEnabled(prev => !prev);
  };

  const handleZoomChange = async (delta: number) => {
    const newZoom = Math.max(0.5, Math.min(3.0, zoomLevel + delta));
    setZoomLevel(newZoom);
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.spring(zoomAnimation, {
      toValue: newZoom,
      ...AnimationConfig.spring,
      useNativeDriver: false,
    }).start();
  };

  const renderPerformanceStats = () => (
    <Modal
      visible={showPerformanceStats}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowPerformanceStats(false)}>
      <View style={styles.performanceModalContainer}>
        <View style={[styles.performanceModal, Shadows.large]}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>📊 Performance Monitor</Text>
            <TouchableOpacity 
              style={styles.performanceCloseButton} 
              onPress={() => setShowPerformanceStats(false)}>
              <Text style={styles.performanceCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.performanceContent}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>CPU Usage</Text>
              <View style={styles.statBarContainer}>
                <View style={[styles.statBar, {width: `${performanceStats.cpu}%`, backgroundColor: performanceStats.cpu > 80 ? TextColors.error : BrandColors.primary}]} />
                <Text style={styles.statValue}>{performanceStats.cpu.toFixed(0)}%</Text>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Memory</Text>
              <View style={styles.statBarContainer}>
                <View style={[styles.statBar, {width: `${performanceStats.memory}%`, backgroundColor: performanceStats.memory > 75 ? TextColors.warning : BrandColors.primary}]} />
                <Text style={styles.statValue}>{performanceStats.memory.toFixed(0)}%</Text>
              </View>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Network</Text>
              <Text style={styles.statValue}>{performanceStats.network.toFixed(1)} MB/s</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>FPS</Text>
              <Text style={[styles.statValue, {color: performanceStats.fps < 30 ? TextColors.error : TextColors.success}]}>
                {performanceStats.fps}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Bitrate</Text>
              <Text style={styles.statValue}>{performanceStats.bitrate.toFixed(0)} kbps</Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Dropped Frames</Text>
              <Text style={[styles.statValue, {color: performanceStats.droppedFrames > 10 ? TextColors.error : TextColors.primary}]}>
                {performanceStats.droppedFrames}
              </Text>
            </View>
            
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Temperature</Text>
              <Text style={[styles.statValue, {color: performanceStats.temperature > 55 ? TextColors.error : TextColors.primary}]}>
                {performanceStats.temperature.toFixed(0)}°C
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderTopBar = () => (
    <View style={styles.topBar}>
      {/* User Profile */}
      <TouchableOpacity style={styles.profileButton}>
        <View style={styles.profileIcon} />
      </TouchableOpacity>

      {/* Controls */}
      <View style={styles.topControls}>
        <TouchableOpacity 
          style={styles.topButton}
          onPress={() => setShowPerformanceStats(true)}>
          <Text style={styles.topButtonIcon}>📊</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}>
          <Text style={styles.topButtonIcon}>🔧</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton}>
          <Text style={styles.topButtonIcon}>❗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton} onPress={() => setShowCameraMenu(true)}>
          <Text style={styles.topButtonIcon}>📷</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.topButton} onPress={() => setShowSettings(true)}>
          <Text style={styles.topButtonIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCameraSelector = () => (
    <View style={styles.cameraSelector}>
      {cameraOptions.map((camera, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.cameraOption,
            selectedCamera === camera && styles.selectedCameraOption,
            camera === 'XXXX' && styles.disabledCameraOption
          ]}
          onPress={() => setSelectedCamera(camera)}
          disabled={camera === 'XXXX'}>
          <View style={styles.cameraIconContainer}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
          <Text style={[
            styles.cameraOptionText,
            selectedCamera === camera && styles.selectedCameraText,
            camera === 'XXXX' && styles.disabledCameraText
          ]}>
            {camera}
          </Text>
          {camera === 'XXXX' && (
            <View style={styles.disabledBadge}>
              <Text style={styles.disabledBadgeText}>NO AR</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStreamControls = () => (
    <View style={styles.streamControls}>
      {/* Audio Level */}
      <View style={styles.audioLevel}>
        <View style={[styles.audioLevelBar, {width: Math.min(20, performanceStats.network * 2)}]} />
        <Text style={styles.audioLevelText}>
          🎤 {performanceStats.bitrate}kbps {performanceStats.fps}fps
        </Text>
      </View>

      {/* Main Stream Button */}
      <TouchableOpacity
        style={[
          styles.streamButton,
          isStreaming ? styles.streamButtonStop : styles.streamButtonStart
        ]}
        onPress={handleStartStopStream}>
        <Text style={styles.streamButtonText}>
          {isStreaming ? 'ENCERRAR TRANSMISSÃO' : 'INICIAR TRANSMISSÃO'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" hidden />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Top Bar */}
        {renderTopBar()}

        {/* Camera Preview Area */}
        <View style={styles.cameraContainer}>
          {/* Camera Selector */}
          {renderCameraSelector()}

          {/* Main Camera Preview */}
          <View style={styles.cameraPreview}>
            <Text style={styles.cameraPlaceholderText}>Camera Preview</Text>
            <Text style={styles.cameraNote}>🏀 Basketball Court View</Text>
            
            {/* Stream Status Overlay */}
            {isStreaming && (
              <View style={styles.streamOverlay}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>NO AR</Text>
                </View>
                
                <View style={styles.streamInfo}>
                  <Text style={styles.streamTime}>{formatDuration(streamDuration)}</Text>
                  <Text style={styles.viewerCount}>👥 {viewerCount}</Text>
                </View>
              </View>
            )}

            {/* Zoom Controls */}
            <Animated.View 
              style={[
                styles.zoomControls,
                { transform: [{ scale: zoomAnimation }] }
              ]}>
              <TouchableOpacity
                style={[styles.zoomButton, Shadows.small]}
                onPress={() => handleZoomChange(-0.1)}>
                <Text style={styles.zoomButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.zoomText}>{zoomLevel.toFixed(1)}x</Text>
              <TouchableOpacity
                style={[styles.zoomButton, Shadows.small]}
                onPress={() => handleZoomChange(0.1)}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Stream Controls */}
          {renderStreamControls()}
        </View>

        {/* Navigation Buttons */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Performance Stats Modal */}
      {renderPerformanceStats()}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSettings(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Text style={styles.modalCancel}>Fechar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Configurações</Text>
            <View style={{width: 50}} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>INFORMAÇÃO</Text>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoItem}>Centro de ajuda 🏠</Text>
              <Text style={styles.infoItem}>COMENTÁRIOS</Text>
              <Text style={styles.infoItem}>Informação do sistema</Text>
              <Text style={styles.infoItem}>Sobre nós</Text>
              <Text style={styles.infoItem}>Política de Privacidade</Text>
              <Text style={styles.infoItem}>Termos de Utilização</Text>
            </View>

            <Text style={styles.modalSectionTitle}>SERVIDOR</Text>
            <View style={styles.serverSection}>
              <Text style={styles.serverItem}>Endereço da transmissão</Text>
              <Text style={styles.serverValue}>rtmp://a.rtmp.youtube.com/live2/xxb7m4a7-nd57</Text>
            </View>

            <Text style={styles.modalSectionTitle}>STREAM</Text>
            <View style={styles.streamSection}>
              <View style={styles.streamRow}>
                <Text style={styles.streamLabel}>Resolução</Text>
                <Text style={styles.streamValue}>720p (HD)</Text>
              </View>
              <View style={styles.streamRow}>
                <Text style={styles.streamLabel}>Velocidade de quadros por segundo (fps)</Text>
                <Text style={styles.streamValue}>30 FPS</Text>
              </View>
              <View style={styles.streamRow}>
                <Text style={styles.streamLabel}>Qualidade</Text>
                <Text style={styles.streamValue}>Ultra alto</Text>
              </View>
            </View>

            <Text style={styles.modalSectionTitle}>CÂMERA</Text>
            <View style={styles.cameraSection}>
              <View style={styles.streamRow}>
                <Text style={styles.streamLabel}>Foco automático</Text>
                <Text style={styles.streamValue}>Manual</Text>
              </View>
            </View>

            <Text style={styles.modalSectionTitle}>ÁUDIO</Text>
            <View style={styles.audioSection}>
              <View style={styles.streamRow}>
                <Text style={styles.streamLabel}>Fonte de MIC</Text>
                <Text style={styles.streamValue}>Microfone</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  profileButton: {
    padding: 5,
  },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7ED321',
  },
  topControls: {
    flexDirection: 'row',
  },
  topButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#7ED321',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  topButtonIcon: {
    fontSize: 14,
    color: '#000',
  },
  accountButton: {
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
  },
  cameraSelector: {
    position: 'absolute',
    left: 10,
    top: 20,
    zIndex: 10,
  },
  cameraOption: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedCameraOption: {
    backgroundColor: '#7ED321',
  },
  disabledCameraOption: {
    backgroundColor: '#1a1a2e',
  },
  cameraIconContainer: {
    marginBottom: 5,
  },
  cameraIcon: {
    fontSize: 16,
  },
  cameraOptionText: {
    color: '#ffffff',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
  },
  selectedCameraText: {
    color: '#000000',
  },
  disabledCameraText: {
    color: '#666',
  },
  disabledBadge: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  disabledBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  cameraPreview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraPlaceholderText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 10,
  },
  cameraNote: {
    color: '#888',
    fontSize: 14,
  },
  streamOverlay: {
    position: 'absolute',
    top: 20,
    left: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
    marginRight: 4,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  streamInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streamTime: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewerCount: {
    color: '#7ED321',
    fontSize: 9,
    textAlign: 'center',
  },
  zoomControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  zoomButton: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: '#7ED321',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoomText: {
    color: '#ffffff',
    fontSize: 12,
    marginHorizontal: 10,
    fontWeight: '600',
  },
  streamControls: {
    backgroundColor: '#0f0f23',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  audioLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  audioLevelBar: {
    width: 20,
    height: 4,
    backgroundColor: '#7ED321',
    borderRadius: 2,
    marginRight: 10,
  },
  audioLevelText: {
    color: '#ffffff',
    fontSize: 12,
  },
  streamButton: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamButtonStart: {
    backgroundColor: '#7ED321',
  },
  streamButtonStop: {
    backgroundColor: '#FF0000',
  },
  streamButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#7ED321',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  modalCancel: {
    color: '#7ED321',
    fontSize: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    color: '#7ED321',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  infoSection: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 15,
  },
  infoItem: {
    color: '#ffffff',
    fontSize: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  serverSection: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 15,
  },
  serverItem: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  serverValue: {
    color: '#888',
    fontSize: 12,
  },
  streamSection: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 15,
  },
  streamRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a2e',
  },
  streamLabel: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  streamValue: {
    color: '#7ED321',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraSection: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    padding: 15,
  },
  audioSection: {
    backgroundColor: BackgroundColors.tertiary,
    borderRadius: 8,
    padding: 15,
  },
  // Performance Stats Modal Styles
  performanceModalContainer: {
    flex: 1,
    backgroundColor: BackgroundColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  performanceModal: {
    backgroundColor: BackgroundColors.tertiary,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: BrandColors.primary,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: BackgroundColors.secondary,
  },
  performanceTitle: {
    ...Typography.subtitle,
    color: TextColors.primary,
    fontWeight: 'bold',
  },
  performanceCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: TextColors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  performanceCloseText: {
    color: TextColors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  performanceContent: {
    padding: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: BackgroundColors.secondary,
  },
  statLabel: {
    ...Typography.body,
    color: TextColors.primary,
    flex: 1,
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: Spacing.md,
  },
  statBar: {
    height: 8,
    borderRadius: 4,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statValue: {
    ...Typography.caption,
    color: TextColors.accent,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'right',
  },
});

export default LiveStreamScreen;