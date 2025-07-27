import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View, Alert } from 'react-native';
import Slider from '@react-native-community/slider';
import { CameraType, FlashMode } from 'expo-camera';
import { dualCameraManager, DualCameraState, ResolutionPreset } from '@/services/DualCameraManager';
import { resolutionManager, ResolutionSettings } from '@/services/ResolutionManager';
import { useResponsive } from '../utils/responsive';

interface CameraControlsProps {
  isOpen: boolean;
  onClose: () => void;
  cameraType?: CameraType;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.5)',
  surface: '#ffffff',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#84cc16', // lime-500
  border: '#e5e7eb',
  iconBg: '#f3f4f6',
};

const CameraControls: React.FC<CameraControlsProps> = ({ 
  isOpen, 
  onClose, 
  cameraType = 'back' as CameraType 
}) => {
  const responsive = useResponsive();
  const isNativeMobile = responsive.isNativeMobile;
  const isLandscape = responsive.orientation === 'landscape';
  
  const [, setCameraState] = useState<DualCameraState>(dualCameraManager.getState());
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

  // Dynamic positioning based on responsive layout
  const getModalPosition = () => {
    const headerHeight = responsive.headerHeight || 48;
    const gap = 4; // Small gap between button and modal
    const rightPadding = 16; // Standard right padding
    
    if (isNativeMobile && isLandscape) {
      // For mobile landscape
      const modalWidth = 280; // Mobile landscape modal width
      
      return {
        top: headerHeight + gap,
        right: rightPadding,
        width: modalWidth,
      };
    } else if (isNativeMobile) {
      // For mobile portrait
      const modalWidth = 320; // Mobile portrait modal width
      
      return {
        top: headerHeight + gap,
        right: rightPadding,
        width: modalWidth,
      };
    } else {
      // For desktop
      const modalWidth = 400; // Desktop modal width
      
      return {
        top: headerHeight + gap,
        right: rightPadding,
        width: modalWidth,
      };
    }
  };

  const modalPosition = getModalPosition();

  return (
    <>
      {/* Overlay to close when clicking outside */}
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <View style={[
        styles.container,
        isNativeMobile && styles.containerMobile,
        isNativeMobile && isLandscape && styles.containerMobileLandscape,
        {
          top: modalPosition.top,
          right: modalPosition.right,
          width: modalPosition.width,
        }
      ]}>
        {/* Triangle pointer */}
        <View style={[
          styles.triangle,
          isNativeMobile && styles.triangleMobile
        ]} />
        
        {/* Close button */}
        <TouchableOpacity style={[
          styles.closeButton,
          isNativeMobile && styles.closeButtonMobile
        ]} onPress={onClose}>
          <Text style={[
            styles.closeButtonText,
            isNativeMobile && styles.closeButtonTextMobile
          ]}>×</Text>
        </TouchableOpacity>
        
        <View style={[
          styles.content,
          isNativeMobile && styles.contentMobile
        ]}>
          {/* Camera Type Indicator */}
          <Text style={[
            styles.cameraTypeLabel,
            isNativeMobile && styles.cameraTypeLabelMobile
          ]}>
            {cameraType === 'front' ? 'Front Camera' : 'Back Camera'} Controls
          </Text>

          {/* Resolution Section */}
          <View style={[
            styles.section,
            isNativeMobile && styles.sectionMobile
          ]}>
            <Text style={[
              styles.sectionLabel,
              isNativeMobile && styles.sectionLabelMobile
            ]}>Resolution</Text>
            <View style={[
              styles.resolutionRow,
              isNativeMobile && styles.resolutionRowMobile
            ]}>
              {[ResolutionPreset.LOW, ResolutionPreset.MEDIUM, ResolutionPreset.HIGH, ResolutionPreset.ULTRA].map((resolution) => (
                <TouchableOpacity
                  key={resolution}
                  style={[
                    styles.resolutionButton,
                    isNativeMobile && styles.resolutionButtonMobile,
                    currentResolution === resolution && styles.resolutionButtonActive
                  ]}
                  onPress={() => handleResolutionChange(resolution)}
                >
                  <Text style={[
                    styles.resolutionButtonText,
                    isNativeMobile && styles.resolutionButtonTextMobile,
                    currentResolution === resolution && styles.resolutionButtonTextActive
                  ]}>
                    {resolution.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Auto Focus Section */}
          <View style={[
            styles.controlSection,
            isNativeMobile && styles.controlSectionMobile
          ]}>
            <Text style={[
              styles.controlLabel,
              isNativeMobile && styles.controlLabelMobile
            ]}>Auto Focus</Text>
            <Switch
              value={isAutoFocus}
              onValueChange={handleAutoFocusToggle}
              trackColor={{ false: '#d1d5db', true: Colors.primary }}
              thumbColor={isAutoFocus ? '#ffffff' : '#f3f4f6'}
              style={[
                styles.switch,
                isNativeMobile && styles.switchMobile
              ]}
            />
          </View>

          {/* Flash Control */}
          <View style={[
            styles.controlSection,
            isNativeMobile && styles.controlSectionMobile
          ]}>
            <Text style={[
              styles.controlLabel,
              isNativeMobile && styles.controlLabelMobile
            ]}>Flash</Text>
            <TouchableOpacity
              style={[
                styles.flashButton,
                isNativeMobile && styles.flashButtonMobile,
                flashMode === 'on' && styles.flashButtonActive
              ]}
              onPress={handleFlashToggle}
            >
              <IconSymbol 
                name={flashMode === 'on' ? 'bolt.fill' : 'bolt.slash'} 
                size={isNativeMobile ? 16 : 20} 
                color={flashMode === 'on' ? Colors.primary : Colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>

          {/* Zoom Control */}
          <View style={[
            styles.zoomSection,
            isNativeMobile && styles.zoomSectionMobile
          ]}>
            <Text style={[
              styles.sectionLabel,
              isNativeMobile && styles.sectionLabelMobile
            ]}>Zoom ({zoomLevel.toFixed(1)}x)</Text>
            <View style={[
              styles.zoomControls,
              isNativeMobile && styles.zoomControlsMobile
            ]}>
              <TouchableOpacity
                style={[
                  styles.zoomButton,
                  isNativeMobile && styles.zoomButtonMobile
                ]}
                onPress={handleZoomOut}
              >
                <Text style={[
                  styles.zoomButtonText,
                  isNativeMobile && styles.zoomButtonTextMobile
                ]}>−</Text>
              </TouchableOpacity>
              
              <View style={[
                styles.sliderContainer,
                isNativeMobile && styles.sliderContainerMobile
              ]}>
                <Slider
                  style={[
                    styles.zoomSlider,
                    isNativeMobile && styles.zoomSliderMobile
                  ]}
                  minimumValue={0.5}
                  maximumValue={5.0}
                  value={zoomLevel}
                  onValueChange={handleZoomChange}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
              </View>
              
              <TouchableOpacity
                style={[
                  styles.zoomButton,
                  isNativeMobile && styles.zoomButtonMobile
                ]}
                onPress={handleZoomIn}
              >
                <Text style={[
                  styles.zoomButtonText,
                  isNativeMobile && styles.zoomButtonTextMobile
                ]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Auto Quality Section */}
          {resolutionSettings && (
            <View style={[
              styles.controlSection,
              isNativeMobile && styles.controlSectionMobile
            ]}>
              <Text style={[
                styles.controlLabel,
                isNativeMobile && styles.controlLabelMobile
              ]}>Auto Quality</Text>
              <Switch
                value={resolutionSettings.autoQuality}
                onValueChange={handleAutoQualityToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={resolutionSettings.autoQuality ? '#ffffff' : '#f3f4f6'}
                style={[
                  styles.switch,
                  isNativeMobile && styles.switchMobile
                ]}
              />
            </View>
          )}

          {/* Battery Optimization Section */}
          {resolutionSettings && (
            <View style={[
              styles.controlSection,
              isNativeMobile && styles.controlSectionMobile
            ]}>
              <Text style={[
                styles.controlLabel,
                isNativeMobile && styles.controlLabelMobile
              ]}>Battery Optimization</Text>
              <Switch
                value={resolutionSettings.batteryOptimization}
                onValueChange={handleBatteryOptimizationToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={resolutionSettings.batteryOptimization ? '#ffffff' : '#f3f4f6'}
                style={[
                  styles.switch,
                  isNativeMobile && styles.switchMobile
                ]}
              />
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
    backgroundColor: Colors.surface,
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
    zIndex: 999,
  },
  containerMobile: {
    borderRadius: 8,
    padding: 12,
    shadowRadius: 4,
  },
  containerMobileLandscape: {
    borderRadius: 6,
    padding: 8,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    right: 20,
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
  triangleMobile: {
    top: -6,
    right: 90,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
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
  closeButtonMobile: {
    top: 4,
    right: 8,
    width: 20,
    height: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  closeButtonTextMobile: {
    fontSize: 16,
  },
  content: {
    paddingTop: 20,
  },
  contentMobile: {
    paddingTop: 12,
  },
  cameraTypeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  cameraTypeLabelMobile: {
    fontSize: 12,
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionMobile: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  sectionLabelMobile: {
    fontSize: 10,
    marginBottom: 4,
  },
  resolutionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  resolutionRowMobile: {
    gap: 4,
  },
  resolutionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.iconBg,
    alignItems: 'center',
  },
  resolutionButtonMobile: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  resolutionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  resolutionButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
  },
  resolutionButtonTextMobile: {
    fontSize: 8,
  },
  resolutionButtonTextActive: {
    color: Colors.surface,
  },
  controlSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlSectionMobile: {
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  controlLabelMobile: {
    fontSize: 10,
  },
  switch: {
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  },
  switchMobile: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  flashButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonMobile: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  flashButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  zoomSection: {
    marginBottom: 20,
  },
  zoomSectionMobile: {
    marginBottom: 12,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  zoomControlsMobile: {
    marginTop: 4,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonMobile: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  zoomButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  zoomButtonTextMobile: {
    fontSize: 14,
  },
  sliderContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sliderContainerMobile: {
    paddingHorizontal: 4,
  },
  zoomSlider: {
    width: '100%',
    height: 40,
  },
  zoomSliderMobile: {
    height: 28,
  },
});

export default CameraControls;