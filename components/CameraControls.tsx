import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View, Alert, Slider } from 'react-native';
import { CameraType, FlashMode } from 'expo-camera';
import { dualCameraManager, DualCameraState, ResolutionPreset } from '@/services/DualCameraManager';
import { resolutionManager, ResolutionSettings } from '@/services/ResolutionManager';

interface CameraControlsProps {
  isOpen: boolean;
  onClose: () => void;
  cameraType?: CameraType;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.3)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#84cc16', // lime-500 (bright green like in image)
  border: '#e5e7eb',
  iconBg: '#000000',
};

const CameraControls: React.FC<CameraControlsProps> = ({ 
  isOpen, 
  onClose, 
  cameraType = 'back' as CameraType 
}) => {
  const [cameraState, setCameraState] = useState<DualCameraState>(dualCameraManager.getState());
  const [resolutionSettings, setResolutionSettings] = useState<ResolutionSettings | null>(null);
  const [flashMode, setFlashMode] = useState<FlashMode>('off' as FlashMode);
  const [isAutoFocus, setIsAutoFocus] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [currentResolution, setCurrentResolution] = useState<ResolutionPreset>(ResolutionPreset.MEDIUM);

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to camera state changes
    const unsubscribeCameraState = dualCameraManager.subscribe((state) => {
      setCameraState(state);
      
      // Update zoom level from camera state
      const camera = cameraType === 'front' ? state.frontCamera : state.backCamera;
      setZoomLevel(camera.zoom);
      setFlashMode(camera.flashMode);
    });

    // Subscribe to resolution settings changes
    const unsubscribeResolution = resolutionManager.subscribe((settings) => {
      setResolutionSettings(settings);
      setCurrentResolution(settings.currentResolution);
    });

    // Initialize resolution manager if not already done
    initializeManagers();

    return () => {
      unsubscribeCameraState();
      unsubscribeResolution();
    };
  }, [isOpen, cameraType]);

  const initializeManagers = async () => {
    try {
      await resolutionManager.initialize();
      const settings = resolutionManager.getCurrentSettings();
      if (settings) {
        setResolutionSettings(settings);
        setCurrentResolution(settings.currentResolution);
      }
    } catch (error) {
      console.error('Failed to initialize camera controls:', error);
    }
  };

  const handleZoomChange = async (value: number) => {
    setZoomLevel(value);
    const success = await dualCameraManager.setZoom(cameraType, value);
    if (!success) {
      Alert.alert('Error', 'Failed to set zoom level');
    }
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 0.1, 5.0);
    handleZoomChange(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 0.1, 0.5);
    handleZoomChange(newZoom);
  };

  const handleFlashToggle = async () => {
    const newFlashMode = flashMode === 'off' ? 'on' : 'off';
    const success = await dualCameraManager.setFlashMode(cameraType, newFlashMode as FlashMode);
    if (success) {
      setFlashMode(newFlashMode as FlashMode);
    } else {
      Alert.alert('Error', 'Failed to toggle flash');
    }
  };

  const handleAutoFocusToggle = async (value: boolean) => {
    setIsAutoFocus(value);
    // In a real implementation, this would set the camera's auto focus mode
    console.log(`Auto focus ${value ? 'enabled' : 'disabled'} for ${cameraType} camera`);
  };

  const handleResolutionChange = async (resolution: ResolutionPreset) => {
    const success = await resolutionManager.setResolution(resolution);
    if (success) {
      setCurrentResolution(resolution);
    } else {
      Alert.alert('Error', 'Failed to change resolution');
    }
  };

  const handleAutoQualityToggle = async (enabled: boolean) => {
    await resolutionManager.setAutoQuality(enabled);
  };

  const handleBatteryOptimizationToggle = async (enabled: boolean) => {
    await resolutionManager.setBatteryOptimization(enabled);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay to close when clicking outside */}
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <View style={styles.container}>
        {/* Triangle pointer */}
        <View style={styles.triangle} />
        
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        
        <View style={styles.content}>
          {/* Camera Type Indicator */}
          <Text style={styles.cameraTypeLabel}>
            {cameraType === 'front' ? 'Front Camera' : 'Back Camera'} Controls
          </Text>

          {/* Resolution Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Resolution</Text>
            <View style={styles.resolutionRow}>
              {[ResolutionPreset.LOW, ResolutionPreset.MEDIUM, ResolutionPreset.HIGH, ResolutionPreset.ULTRA].map((resolution) => (
                <TouchableOpacity
                  key={resolution}
                  style={[
                    styles.resolutionButton,
                    currentResolution === resolution && styles.resolutionButtonActive
                  ]}
                  onPress={() => handleResolutionChange(resolution)}
                >
                  <Text style={[
                    styles.resolutionButtonText,
                    currentResolution === resolution && styles.resolutionButtonTextActive
                  ]}>
                    {resolution.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto Focus Section */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Auto Focus</Text>
            <Switch
              value={isAutoFocus}
              onValueChange={handleAutoFocusToggle}
              trackColor={{ false: '#d1d5db', true: Colors.primary }}
              thumbColor={isAutoFocus ? '#ffffff' : '#f3f4f6'}
              style={styles.switch}
            />
          </View>

          {/* Flash Control */}
          <View style={styles.controlSection}>
            <Text style={styles.controlLabel}>Flash</Text>
            <TouchableOpacity
              style={[styles.flashButton, flashMode === 'on' && styles.flashButtonActive]}
              onPress={handleFlashToggle}
            >
              <IconSymbol 
                name={flashMode === 'on' ? 'bolt.fill' : 'bolt.slash'} 
                size={20} 
                color={flashMode === 'on' ? Colors.primary : Colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Zoom Control */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Zoom: {zoomLevel.toFixed(1)}x</Text>
            <View style={styles.zoomContainer}>
              <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.zoomSlider}
                  minimumValue={0.5}
                  maximumValue={5.0}
                  value={zoomLevel}
                  onValueChange={handleZoomChange}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor="#d1d5db"
                  thumbTintColor={Colors.primary}
                  step={0.1}
                />
              </View>
              
              <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quality Settings */}
          {resolutionSettings && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Quality Settings</Text>
              
              <View style={styles.controlSection}>
                <Text style={styles.controlLabel}>Auto Quality</Text>
                <Switch
                  value={resolutionSettings.autoQuality}
                  onValueChange={handleAutoQualityToggle}
                  trackColor={{ false: '#d1d5db', true: Colors.primary }}
                  thumbColor={resolutionSettings.autoQuality ? '#ffffff' : '#f3f4f6'}
                  style={styles.switch}
                />
              </View>

              <View style={styles.controlSection}>
                <Text style={styles.controlLabel}>Battery Optimization</Text>
                <Switch
                  value={resolutionSettings.batteryOptimization}
                  onValueChange={handleBatteryOptimizationToggle}
                  trackColor={{ false: '#d1d5db', true: Colors.primary }}
                  thumbColor={resolutionSettings.batteryOptimization ? '#ffffff' : '#f3f4f6'}
                  style={styles.switch}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    top: 90,
    right: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    minWidth: 320,
    maxWidth: 360,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    left: 30,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    paddingTop: 8,
  },
  cameraTypeLabel: {
    fontSize: 18,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  controlSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '400',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  resolutionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  resolutionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  resolutionButtonActive: {
    backgroundColor: Colors.primary,
  },
  resolutionButtonText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  resolutionButtonTextActive: {
    color: 'white',
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonActive: {
    backgroundColor: Colors.primary,
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  zoomSlider: {
    width: '100%',
    height: 40,
  },
});

export default CameraControls;