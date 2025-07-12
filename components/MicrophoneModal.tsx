import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, PanResponder, Animated } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
}

  const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  trackColor,
  thumbColor,
  activeTrackColor,
}) => {
  const sliderWidth = 200; // Adjusted width
  const thumbSize = 20;
  
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
    const segments = 100;
    const activeSegments = Math.floor((value / 100) * segments);
    
    return (
      <View style={styles.gradientTrackContainer}>
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
    <View style={styles.customSliderContainer} {...panResponder.panHandlers}>
      {/* Gradient track */}
      {renderGradientTrack()}
      
      {/* Thumb */}
      <View 
        style={[
          styles.customSliderThumb, 
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

  if (!isOpen) return null;

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

  const renderVolumeBar = () => {
    const segments = 20;
    const activeSegments = Math.floor((volumeLevel / 100) * segments);
    
    return (
      <View style={styles.volumeBarContainer}>
        {Array.from({ length: segments }, (_, index) => {
          const isActive = index < activeSegments;
          let segmentColor = Colors.sliderTrack;
          
          if (isActive) {
            const segmentLevel = ((index + 1) / segments) * 100;
            segmentColor = getVolumeColor(segmentLevel);
          }
          
          return (
            <View
              key={index}
              style={[
                styles.volumeSegment,
                { backgroundColor: segmentColor }
              ]}
            />
          );
        })}
      </View>
    );
  };

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
          {/* Controls in horizontal layout */}
          <View style={styles.horizontalLayout}>
            {/* Microphone Control */}
            <View style={styles.controlColumn}>
              <Switch
                value={isMicrophoneEnabled}
                onValueChange={handleMicrophoneToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={isMicrophoneEnabled ? '#ffffff' : '#f3f4f6'}
                style={styles.switch}
              />
              <Text style={styles.controlLabel}>Enable{'\n'}microphone</Text>
            </View>
            
            {/* Zoom Control */}
            <View style={styles.controlColumn}>
              <Switch
                value={isZoomEnabled}
                onValueChange={handleZoomToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={isZoomEnabled ? '#ffffff' : '#f3f4f6'}
                style={styles.switch}
              />
              <Text style={styles.controlLabel}>Zoom{'\n'}volume</Text>
            </View>
            
            {/* Volume Control */}
            <View style={styles.volumeColumn}>
              <View style={styles.volumeSliderContainer}>
                <CustomSlider
                  value={volumeLevel}
                  onValueChange={handleVolumeChange}
                  minimumValue={0}
                  maximumValue={100}
                  trackColor={Colors.sliderTrack}
                  thumbColor={Colors.sliderThumb}
                  activeTrackColor={getVolumeColor(volumeLevel)}
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
    top: 90,
    left: 128,
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
  horizontalLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  controlColumn: {
    alignItems: 'center',
    gap: 8,
    minWidth: 80,
  },
  volumeColumn: {
    flex: 1,
    marginLeft: 20,
    alignItems: 'center',
  },
  controlLabel: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  volumeSliderContainer: {
    width: 180,
  },
  customSliderContainer: {
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
  },
  gradientTrackContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
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
});

export default MicrophoneModal;