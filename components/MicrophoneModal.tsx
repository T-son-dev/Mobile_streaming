import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, PanResponder, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '../utils/responsive';

interface MicrophoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMicrophoneToggle: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onZoomChange: (zoom: number) => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.3)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#22c55e', // green-500
  accent: '#84cc16', // lime-500
  border: '#e5e7eb',
  sliderTrack: '#e5e7eb',
  sliderThumb: '#ffffff',
  volumeGreen: '#22c55e',
  volumeYellow: '#f59e0b',
  volumeRed: '#ef4444',
};

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  trackColor: string;
  thumbColor: string;
  activeTrackColor: string;
  isMobile?: boolean;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  trackColor,
  thumbColor,
  activeTrackColor,
  isMobile = false,
}) => {
  const sliderWidth = isMobile ? 120 : 200; // Adjusted width for mobile
  const thumbSize = isMobile ? 14 : 20;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      onPanResponderGrant: (evt) => {
        const { locationX } = evt.nativeEvent;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        const newValue = minimumValue + percentage * (maximumValue - minimumValue);
        onValueChange(newValue);
      },
      
      onPanResponderMove: (evt) => {
        const { locationX } = evt.nativeEvent;
        const percentage = Math.max(0, Math.min(1, locationX / sliderWidth));
        const newValue = minimumValue + percentage * (maximumValue - minimumValue);
        onValueChange(newValue);
      },
    })
  ).current;
  
  const thumbPosition = ((value - minimumValue) / (maximumValue - minimumValue)) * (sliderWidth - thumbSize);
  
  // Create gradient effect with segments
  const renderGradientTrack = () => {
    const segments = isMobile ? 50 : 100; // Fewer segments for mobile
    const activeSegments = Math.floor((value / 100) * segments);
    
    return (
      <View style={[
        styles.gradientTrackContainer,
        isMobile && styles.gradientTrackContainerMobile
      ]}>
        {Array.from({ length: segments }, (_, index) => {
          const segmentPosition = index / segments;
          let segmentColor = '#e5e7eb'; // Default gray
          
          if (index < activeSegments) {
            if (segmentPosition < 0.3) {
              segmentColor = '#22c55e'; // Green
            } else if (segmentPosition < 0.7) {
              segmentColor = '#f59e0b'; // Yellow
            } else {
              segmentColor = '#ef4444'; // Red
            }
          }
          
          return (
            <View
              key={index}
              style={[
                styles.gradientSegment,
                { backgroundColor: segmentColor }
              ]}
            />
          );
        })}
      </View>
    );
  };
  
  return (
    <View style={[
      styles.customSliderContainer,
      isMobile && styles.customSliderContainerMobile
    ]} {...panResponder.panHandlers}>
      {/* Gradient track */}
      {renderGradientTrack()}
      
      {/* Thumb */}
      <View 
        style={[
          styles.customSliderThumb,
          isMobile && styles.customSliderThumbMobile,
          { 
            backgroundColor: thumbColor,
            left: thumbPosition 
          }
        ]} 
      />
    </View>
  );
};

const MicrophoneModal: React.FC<MicrophoneModalProps> = ({ 
  isOpen, 
  onClose, 
  onMicrophoneToggle,
  onVolumeChange,
  onZoomChange
}) => {
  const [isMicrophoneEnabled, setIsMicrophoneEnabled] = useState(true);
  const [isZoomEnabled, setIsZoomEnabled] = useState(true);
  const [volumeLevel, setVolumeLevel] = useState(75);
  const responsive = useResponsive();
  const isNativeMobile = responsive.isNativeMobile;
  const isLandscape = responsive.orientation === 'landscape';

  if (!isOpen) return null;

  // Dynamic positioning based on responsive layout to position below Microphone button
  const getModalPosition = () => {
    const headerHeight = responsive.headerHeight || 48;
    const gap = 4; // Small gap between button and modal
    const screenWidth = responsive.screenWidth || 375;
    
    if (isNativeMobile && isLandscape) {
      // For mobile landscape - position under third button in headerRight (microphone button)
      const headerPadding = responsive.safeAreaHorizontal || 8;
      const rightSectionStart = screenWidth / 2; 
      const buttonSize = 32; // Mobile landscape button size
      const buttonGap = 8; // Gap between buttons
      const modalWidth = 240; // Mobile landscape modal width
      
      // Third button in headerRight section
      const firstButtonLeft = rightSectionStart + headerPadding;
      const thirdButtonLeft = firstButtonLeft + (buttonSize + buttonGap) * 2;
      const thirdButtonCenter = thirdButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: Math.max(8, thirdButtonCenter - (modalWidth / 2)), // Ensure modal doesn't go off screen
      };
    } else if (isNativeMobile) {
      // For mobile portrait
      const headerPadding = responsive.safeAreaHorizontal || 8;
      const rightSectionStart = screenWidth / 2;
      const buttonSize = 28; // Mobile portrait button size
      const buttonGap = 8;
      const modalWidth = 280; // Mobile portrait modal width
      
      const firstButtonLeft = rightSectionStart + headerPadding;
      const thirdButtonLeft = firstButtonLeft + (buttonSize + buttonGap) * 2;
      const thirdButtonCenter = thirdButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: Math.max(8, thirdButtonCenter - (modalWidth / 2)),
      };
    } else {
      // For desktop
      const headerPadding = 16;
      const rightSectionStart = screenWidth / 2;
      const buttonSize = 48; // Desktop button size
      const buttonGap = 12;
      const modalWidth = 360; // Desktop modal width
      
      const firstButtonLeft = rightSectionStart + headerPadding;
      const thirdButtonLeft = firstButtonLeft + (buttonSize + buttonGap) * 2;
      const thirdButtonCenter = thirdButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: Math.max(16, thirdButtonCenter - (modalWidth / 2)),
      };
    }
  };

  const modalPosition = getModalPosition();

  const handleMicrophoneToggle = (value: boolean) => {
    setIsMicrophoneEnabled(value);
    onMicrophoneToggle(value);
  };

  const handleZoomToggle = (value: boolean) => {
    setIsZoomEnabled(value);
    onZoomChange(value ? 1.0 : 0);
  };

  const handleVolumeChange = (value: number) => {
    setVolumeLevel(value);
    onVolumeChange(value);
  };

  const getVolumeColor = (level: number) => {
    if (level < 30) return Colors.volumeGreen;
    if (level < 70) return Colors.volumeYellow;
    return Colors.volumeRed;
  };

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
          left: modalPosition.left,
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
          {/* Controls in horizontal layout */}
          <View style={[
            styles.horizontalLayout,
            isNativeMobile && styles.horizontalLayoutMobile
          ]}>
            {/* Microphone Control */}
            <View style={[
              styles.controlColumn,
              isNativeMobile && styles.controlColumnMobile
            ]}>
              <Switch
                value={isMicrophoneEnabled}
                onValueChange={handleMicrophoneToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={isMicrophoneEnabled ? '#ffffff' : '#f3f4f6'}
                style={[
                  styles.switch,
                  isNativeMobile && styles.switchMobile
                ]}
              />
              <Text style={[
                styles.controlLabel,
                isNativeMobile && styles.controlLabelMobile
              ]}>Enable{'\n'}microphone</Text>
            </View>
            
            {/* Zoom Control */}
            <View style={[
              styles.controlColumn,
              isNativeMobile && styles.controlColumnMobile
            ]}>
              <Switch
                value={isZoomEnabled}
                onValueChange={handleZoomToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={isZoomEnabled ? '#ffffff' : '#f3f4f6'}
                style={[
                  styles.switch,
                  isNativeMobile && styles.switchMobile
                ]}
              />
              <Text style={[
                styles.controlLabel,
                isNativeMobile && styles.controlLabelMobile
              ]}>Zoom{'\n'}volume</Text>
            </View>
            
            {/* Volume Control */}
            <View style={[
              styles.volumeColumn,
              isNativeMobile && styles.volumeColumnMobile
            ]}>
              <View style={[
                styles.volumeSliderContainer,
                isNativeMobile && styles.volumeSliderContainerMobile
              ]}>
                <CustomSlider
                  value={volumeLevel}
                  onValueChange={handleVolumeChange}
                  minimumValue={0}
                  maximumValue={100}
                  trackColor={Colors.sliderTrack}
                  thumbColor={Colors.sliderThumb}
                  activeTrackColor={getVolumeColor(volumeLevel)}
                  isMobile={isNativeMobile}
                />
              </View>
            </View>
          </View>
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
    width: 360,
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
    padding: 4,
    width: 280,
    shadowRadius: 4,
  },
  containerMobileLandscape: {
    borderRadius: 6,
    padding: 0,
    width: 240,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    left: 24, // Center triangle above the microphone button
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
    left: 201,
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
    paddingTop: 8,
  },
  contentMobile: {
    paddingTop: 4,
  },
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  horizontalLayoutMobile: {
    paddingHorizontal: 0,
  },
  controlColumn: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  controlColumnMobile: {
    gap: 0,
    minWidth: 50,
  },
  volumeColumn: {
    flex: 1,
    marginLeft: 20,
    alignItems: 'center',
  },
  volumeColumnMobile: {
    marginLeft: 8,
  },
  controlLabel: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  controlLabelMobile: {
    fontSize: 6,
    lineHeight: 8,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  switchMobile: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  volumeSliderContainer: {
    width: 180,
  },
  volumeSliderContainerMobile: {
    width: 120,
  },
  customSliderContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  customSliderContainerMobile: {
    height: 20,
  },
  gradientTrackContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  gradientTrackContainerMobile: {
    height: 6,
    borderRadius: 3,
  },
  gradientSegment: {
    flex: 1,
    height: '100%',
  },
  customSliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
    top: -6, // Center on the track
  },
  customSliderThumbMobile: {
    width: 14,
    height: 14,
    borderRadius: 7,
    top: -4,
  },
});

export default MicrophoneModal;