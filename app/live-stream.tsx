import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  ImageBackground,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';

const { width, height } = Dimensions.get('window');

// Colors matching the screenshot exactly
const Colors = {
  background: '#1a1a2e',
  surface: '#2a2a3e',
  primary: '#7ED321', // Bright green matching screenshot
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  danger: '#ff4757',
  warning: '#ffa502',
  success: '#26de81',
  border: '#404040',
  greenBorder: '#7ED321', // Bright green border
};

const LiveStreamScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamDuration, setStreamDuration] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [showCameraControls, setShowCameraControls] = useState(false);
  const [showOverlayMenu, setShowOverlayMenu] = useState(false);
  const [cameraSettings, setCameraSettings] = useState({
    distance: '0.3m',
    zoom: '1x',
    iso: '622',
    aperture: '0',
    shutter: '1/125',
    whiteBalance: 'AWB'
  });

  // Camera sources exactly matching screenshot
  const cameraSources = [
    { name: 'CAMERA CELULAR', status: 'NO AR', active: true },
    { name: 'CAMERA USB', status: 'NO AR', active: false },
    { name: 'NAVEGADOR\nWEB - SINGULAR', status: 'NO AR', active: false },
    { name: 'XXXX', status: 'NO AR', active: false },
  ];

  // Stream duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStreaming) {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStreamToggle = () => {
    if (isStreaming) {
      Alert.alert(
        'Encerrar Transmissão',
        'Tem certeza que deseja encerrar a transmissão?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Encerrar', 
            style: 'destructive',
            onPress: () => {
              setIsStreaming(false);
              setStreamDuration(0);
            }
          }
        ]
      );
    } else {
      setIsStreaming(true);
    }
  };

  const handleBackToHome = () => {
    router.back();
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  // Basketball court background SVG exactly matching screenshot
  const basketballCourtSVG = `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Wood floor background -->
      <rect width="400" height="300" fill="#DEB887"/>
      
      <!-- Court outline -->
      <rect x="30" y="40" width="340" height="220" fill="none" stroke="#654321" stroke-width="3"/>
      
      <!-- Center circle -->
      <circle cx="200" cy="150" r="50" fill="none" stroke="#228B22" stroke-width="4"/>
      <circle cx="200" cy="150" r="6" fill="#000"/>
      
      <!-- Left basket area -->
      <rect x="30" y="110" width="60" height="80" fill="none" stroke="#228B22" stroke-width="4"/>
      <path d="M 30 120 Q 60 120 90 150 Q 60 180 30 180" fill="none" stroke="#228B22" stroke-width="4"/>
      
      <!-- Right basket area -->
      <rect x="310" y="110" width="60" height="80" fill="none" stroke="#228B22" stroke-width="4"/>
      <path d="M 370 120 Q 340 120 310 150 Q 340 180 370 180" fill="none" stroke="#228B22" stroke-width="4"/>
      
      <!-- Center line -->
      <line x1="200" y1="40" x2="200" y2="260" stroke="#228B22" stroke-width="4"/>
      
      <!-- Wood grain effect -->
      <g stroke="#CD853F" stroke-width="1" opacity="0.3">
        <line x1="0" y1="50" x2="400" y2="50"/>
        <line x1="0" y1="100" x2="400" y2="100"/>
        <line x1="0" y1="150" x2="400" y2="150"/>
        <line x1="0" y1="200" x2="400" y2="200"/>
        <line x1="0" y1="250" x2="400" y2="250"/>
      </g>
      
      <!-- Side areas (blue) -->
      <rect x="0" y="0" width="30" height="300" fill="#4169E1"/>
      <rect x="370" y="0" width="30" height="300" fill="#4169E1"/>
      <rect x="30" y="0" width="340" height="40" fill="#4169E1"/>
      <rect x="30" y="260" width="340" height="40" fill="#4169E1"/>
      
      <!-- Bleachers effect -->
      <g fill="#8B4513">
        <rect x="0" y="0" width="30" height="10"/>
        <rect x="0" y="15" width="30" height="10"/>
        <rect x="0" y="30" width="30" height="10"/>
        <rect x="370" y="0" width="30" height="10"/>
        <rect x="370" y="15" width="30" height="10"/>
        <rect x="370" y="30" width="30" height="10"/>
      </g>
      
      <!-- Player silhouette -->
      <g transform="translate(320, 180)">
        <ellipse cx="0" cy="15" rx="8" ry="3" fill="#000" opacity="0.3"/>
        <rect x="-3" y="0" width="6" height="15" fill="#000"/>
        <circle cx="0" cy="-5" r="4" fill="#000"/>
        <rect x="-2" y="-2" width="4" height="8" fill="#000"/>
      </g>
    </svg>
  `;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Main container with green border exactly matching screenshot */}
      <View style={styles.mainContainer}>
        
        {/* User avatar in top left corner */}
        <View style={styles.userAvatar}>
          <View style={styles.avatarCircle}>
            <IconSymbol name="person.2.square.stack" size={20} color={Colors.primary} />
          </View>
        </View>

        {/* Main streaming area with preview border */}
        <View style={styles.streamingArea}>
          {/* Preview area border */}
          <View style={styles.previewBorder}>
            <ImageBackground
              source={{
                uri: `data:image/svg+xml;utf8,${encodeURIComponent(basketballCourtSVG)}`
              }}
              style={styles.backgroundImage}
              resizeMode="cover"
            >
            {/* Camera Sources Panel - exact position as screenshot */}
            <View style={styles.cameraPanel}>
              {cameraSources.map((camera, index) => (
                <View key={index} style={styles.cameraSource}>
                  <View style={styles.cameraStatusRow}>
                    <View style={styles.statusIndicator}>
                      <Text style={styles.statusText}>{camera.status}</Text>
                    </View>
                  </View>
                  <View style={styles.cameraInfo}>
                    <View style={styles.cameraIcon}>
                      <IconSymbol name="video.fill" size={16} color={Colors.text} />
                    </View>
                    <Text style={styles.cameraName}>{camera.name}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Top Control Buttons - exact position as screenshot */}
            <View style={styles.topControls}>
              <TouchableOpacity style={[styles.controlButton, styles.playButton]}>
                <IconSymbol name="play.tv" size={20} color={Colors.text} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.controlButton, styles.fxButton]}>
                <Text style={styles.fxText}>fx</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.controlButton, styles.micButton]}>
                <IconSymbol name="mic.fill" size={20} color={Colors.text} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.cameraButton]}
                onPress={() => setShowCameraControls(!showCameraControls)}
              >
                <IconSymbol name="camera.fill" size={20} color={Colors.text} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.controlButton, styles.menuButton]}
                onPress={() => setShowOverlayMenu(!showOverlayMenu)}
              >
                <View style={styles.menuIcon}>
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                  <View style={styles.menuLine} />
                </View>
              </TouchableOpacity>
            </View>

            {/* Overlay Menu - shows when menu button is pressed */}
            {showOverlayMenu && (
              <View style={styles.overlayMenu}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setShowOverlayMenu(false)}>
                  <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>
                
                <View style={styles.menuGrid}>
                  {/* Top Row */}
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                      <Text style={styles.menuIconText}>#</Text>
                    </View>
                    <Text style={styles.menuLabel}>Grade</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                      <Text style={styles.menuIconText}>🔦</Text>
                    </View>
                    <Text style={styles.menuLabel}>Lanterna</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, styles.proIcon]}>
                      <Text style={styles.proText}>PRO</Text>
                    </View>
                    <Text style={styles.menuLabel}>Modo PRO</Text>
                  </TouchableOpacity>

                  {/* Bottom Row */}
                  <TouchableOpacity style={styles.menuItem}>
                    <View style={[styles.menuIcon, styles.telaInicioIcon]}>
                      <View style={styles.screenIcon} />
                    </View>
                    <Text style={styles.menuLabel}>Tela Início</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.menuItem}>
                    <View style={styles.menuIcon}>
                      <Text style={styles.menuIconText}>🎤</Text>
                    </View>
                    <Text style={styles.menuLabel}>Mutar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={() => {
                      setShowOverlayMenu(false);
                      handleSettings();
                    }}
                  >
                    <View style={styles.menuIcon}>
                      <Text style={styles.menuIconText}>⚙️</Text>
                    </View>
                    <Text style={styles.menuLabel}>Configurações</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Camera Controls Panel - shows when camera button is pressed */}
            {showCameraControls && (
              <View style={styles.cameraControlsPanel}>
                <View style={styles.cameraControl}>
                  <View style={styles.cameraControlIcon}>
                    <Text style={styles.controlIconText}>↻</Text>
                  </View>
                  <Text style={styles.cameraControlValue}>{cameraSettings.distance}</Text>
                </View>

                <View style={styles.cameraControl}>
                  <View style={styles.cameraControlIcon}>
                    <Text style={styles.controlIconText}>+</Text>
                  </View>
                  <Text style={styles.cameraControlValue}>{cameraSettings.zoom}</Text>
                </View>

                <View style={styles.cameraControl}>
                  <Text style={styles.cameraControlLabel}>ISO</Text>
                  <Text style={styles.cameraControlValue}>{cameraSettings.iso}</Text>
                </View>

                <View style={styles.cameraControl}>
                  <View style={styles.cameraControlIcon}>
                    <Text style={styles.controlIconText}>○</Text>
                  </View>
                  <Text style={styles.cameraControlValue}>{cameraSettings.aperture}</Text>
                </View>

                <View style={styles.cameraControl}>
                  <View style={styles.cameraControlIcon}>
                    <Text style={styles.controlIconText}>⚡</Text>
                  </View>
                  <Text style={styles.cameraControlValue}>{cameraSettings.shutter}</Text>
                </View>

                <View style={styles.cameraControl}>
                  <Text style={styles.cameraControlLabel}>WB</Text>
                  <Text style={styles.cameraControlValue}>{cameraSettings.whiteBalance}</Text>
                </View>

                <TouchableOpacity style={styles.cameraControl}>
                  <View style={styles.cameraControlIcon}>
                    <Text style={styles.controlIconText}>↺</Text>
                  </View>
                  <Text style={styles.cameraControlValue}>Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Zoom control slider - vertical on right side */}
            <View style={styles.zoomSlider}>
              <View style={styles.zoomTrack}>
                <View style={styles.zoomDots}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <View key={i} style={styles.zoomDot} />
                  ))}
                </View>
                <View style={styles.zoomHandle}>
                  <IconSymbol name="plus" size={16} color={Colors.text} />
                </View>
              </View>
            </View>

            </ImageBackground>
          </View>
        </View>

        {/* Audio level indicator - bottom left */}
        <View style={styles.audioIndicator}>
          <IconSymbol name="mic.fill" size={16} color={Colors.text} />
          <View style={styles.audioLevel}>
            <View style={[styles.audioBar, { backgroundColor: Colors.primary }]} />
            <View style={[styles.audioBar, { backgroundColor: '#ffeb3b' }]} />
            <View style={[styles.audioBar, { backgroundColor: '#ff9800' }]} />
            <View style={[styles.audioBar, { backgroundColor: Colors.danger }]} />
          </View>
        </View>

        {/* Status indicators - bottom left */}
        <View style={styles.statusIndicators}>
          <View style={styles.statusItem}>
            <IconSymbol name="antenna.radiowaves.left.and.right" size={16} color={Colors.text} />
            <Text style={styles.statusValue}>6000kbps</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusValue}>30fps</Text>
          </View>
        </View>

        {/* Stream button - exactly matching screenshot */}
        <View style={styles.streamButtonContainer}>
          <TouchableOpacity
            style={styles.streamButton}
            onPress={handleStreamToggle}
          >
            <Text style={styles.streamButtonText}>INICIAR TRANSMISSÃO</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: StatusBar.currentHeight || 0,
  },
  mainContainer: {
    flex: 1,
    margin: 8,
    borderWidth: 3,
    borderColor: Colors.greenBorder,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  userAvatar: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.greenBorder,
  },
  streamingArea: {
    flex: 1,
    margin: 4,
  },
  previewBorder: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.greenBorder,
    borderRadius: 8,
    overflow: 'hidden',
    margin: 2,
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPanel: {
    position: 'absolute',
    left: 8,
    top: 60,
    width: 160,
  },
  cameraSource: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 4,
    padding: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#333',
  },
  cameraStatusRow: {
    marginBottom: 4,
  },
  statusIndicator: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cameraIcon: {
    marginRight: 6,
  },
  cameraName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  topControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.greenBorder,
  },
  playButton: {
    backgroundColor: Colors.primary,
  },
  fxButton: {
    backgroundColor: '#ffeb3b',
  },
  micButton: {
    backgroundColor: Colors.primary,
  },
  cameraButton: {
    backgroundColor: Colors.primary,
  },
  menuButton: {
    backgroundColor: Colors.primary,
  },
  fxText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuIcon: {
    gap: 2,
  },
  menuLine: {
    width: 16,
    height: 2,
    backgroundColor: Colors.text,
    borderRadius: 1,
  },
  overlayMenu: {
    position: 'absolute',
    top: '20%',
    left: '20%',
    right: '20%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  menuIconText: {
    fontSize: 20,
  },
  proIcon: {
    backgroundColor: '#333',
  },
  proText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  telaInicioIcon: {
    backgroundColor: '#4a90e2',
  },
  screenIcon: {
    width: 24,
    height: 16,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  menuLabel: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
    position: 'absolute',
    left: 8,
    top: 60,
    bottom: 100,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  cameraControl: {
    alignItems: 'center',
    marginVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  cameraControlIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  controlIconText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraControlLabel: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cameraControlValue: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  zoomSlider: {
    position: 'absolute',
    right: 8,
    top: 60,
    bottom: 100,
    width: 40,
    alignItems: 'center',
  },
  zoomTrack: {
    flex: 1,
    width: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    position: 'relative',
    alignItems: 'center',
    paddingVertical: 10,
  },
  zoomDots: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    width: '100%',
  },
  zoomDot: {
    width: 2,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  zoomHandle: {
    position: 'absolute',
    top: '60%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  audioIndicator: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  audioLevel: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 2,
  },
  audioBar: {
    width: 3,
    height: 16,
    borderRadius: 1,
  },
  statusIndicators: {
    position: 'absolute',
    bottom: 80,
    left: 120,
    flexDirection: 'row',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  streamButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  streamButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  streamButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LiveStreamScreen;