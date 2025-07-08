import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, PanResponder, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface VideoPreviewProps {
  isStreaming: boolean;
  activeSource: string;
}

const { width, height } = Dimensions.get('window');

const Colors = {
  surface: '#1e293b', // slate-800
  background: '#0f172a', // slate-900
  primary: '#22c55e', // green-500
  text: '#ffffff',
  danger: '#ef4444', // red-600
  overlay: 'rgba(15, 23, 42, 0.8)', // slate-900/80
};

const VideoPreview: React.FC<VideoPreviewProps> = ({ isStreaming, activeSource }) => {
  const [zoom, setZoom] = useState(1);
  const [sliderPosition, setSliderPosition] = useState(0.5); // 0 to 1

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: () => {},
    onPanResponderMove: (evt, gestureState) => {
      const sliderHeight = 280;
      const newPosition = Math.max(0, Math.min(1, 0.5 + gestureState.dy / sliderHeight));
      setSliderPosition(newPosition);
      
      // Convert slider position to zoom (inverted: top = zoom in, bottom = zoom out)
      const newZoom = 0.5 + (1 - newPosition) * 1.5; // Range from 0.5x to 2x
      setZoom(newZoom);
    },
    onPanResponderRelease: () => {},
  });

  // Basketball court background SVG data URI
  const basketballCourtImage = require('@/assets/images/react-logo.png'); // Placeholder

  return (
    <View style={styles.container}>
      {/* Preview Area with Basketball Court Background */}
      <View style={styles.previewArea}>
        {/* Basketball Court Background Image */}
        <ImageBackground
          source={basketballCourtImage}
          style={[
            styles.backgroundImage,
            { transform: [{ scale: zoom }] }
          ]}
          resizeMode="cover"
        >
          {/* Stream Status Overlay */}
          {isStreaming && (
            <View style={styles.streamStatus}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>AO VIVO</Text>
            </View>
          )}
          
          {/* Active Source Label */}
          <View style={styles.sourceLabel}>
            <Text style={styles.sourceLabelText}>{activeSource}</Text>
          </View>
          
          {/* Play Button (when not streaming) */}
          {!isStreaming && (
            <View style={styles.playButtonContainer}>
              <View style={styles.playButton}>
                <IconSymbol name="play.fill" size={32} color={Colors.primary} />
              </View>
            </View>
          )}
        </ImageBackground>
        
        {/* Draggable Zoom Slider - Right Edge */}
        <View style={styles.zoomSliderContainer}>
          <View style={styles.zoomSlider}>
            {/* Black Center Line */}
            <View style={styles.zoomSliderTrack} />
            
            {/* Draggable Search Icon */}
            <View
              {...panResponder.panHandlers}
              style={[
                styles.zoomHandle,
                { top: `${sliderPosition * 100}%` }
              ]}
            >
              <IconSymbol name="magnifyingglass" size={16} color={Colors.text} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
  },
  previewArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  streamStatus: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.text,
    borderRadius: 4,
    opacity: 0.9,
  },
  liveText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  sourceLabel: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: Colors.overlay,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 10,
  },
  sourceLabelText: {
    color: Colors.text,
    fontSize: 14,
  },
  playButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playButton: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(34, 197, 94, 0.2)', // green-500/20
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomSliderContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -140 }],
    zIndex: 20,
  },
  zoomSlider: {
    backgroundColor: Colors.text,
    borderRadius: 3,
    height: 280,
    width: 12,
    position: 'relative',
  },
  zoomSliderTrack: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -1 }],
    width: 2,
    height: '100%',
    backgroundColor: Colors.background,
  },
  zoomHandle: {
    position: 'absolute',
    left: '50%',
    transform: [{ translateX: -13.5 }, { translateY: -13.5 }],
    width: 27,
    height: 27,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 13.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VideoPreview;