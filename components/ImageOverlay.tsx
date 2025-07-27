import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Dimensions,
  Platform,
  Text,
} from 'react-native';
import { ImageOverlay as ImageOverlayType } from '@/types/overlay';
import { positioningEngine } from '@/services/PositioningEngine';
import * as Haptics from 'expo-haptics';

// Conditional import for FastImage
let FastImage: any = null;
try {
  FastImage = require('react-native-fast-image');
} catch (error) {
  console.warn('react-native-fast-image not available, using standard Image:', error);
  FastImage = require('react-native').Image;
}

interface ImageOverlayProps {
  overlay: ImageOverlayType;
  isSelected: boolean;
  otherOverlays: ImageOverlayType[];
  onUpdate: (updates: Partial<ImageOverlayType>) => void;
  onSelect: () => void;
  onDragEnd?: () => void;
  containerSize?: { width: number; height: number };
  showCollisionWarning?: boolean;
  showAlignmentGuides?: boolean;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({
  overlay,
  isSelected,
  otherOverlays,
  onUpdate,
  onSelect,
  onDragEnd,
  containerSize,
  showCollisionWarning = true,
  showAlignmentGuides = true,
}) => {
  const [showGuides, setShowGuides] = useState(false);
  const [collision, setCollision] = useState(false);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const containerDimensions = containerSize || {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };

  // Calculate actual pixel position from percentage
  const currentPosition = {
    x: (overlay.position.x / 100) * containerDimensions.width,
    y: (overlay.position.y / 100) * containerDimensions.height,
  };

  useEffect(() => {
    // Reset pan position when overlay position changes externally
    pan.setValue({ x: 0, y: 0 });
  }, [overlay.position.x, overlay.position.y]);

  useEffect(() => {
    // Animate selection state
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  }, [isSelected, scaleAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isSelected,
      onMoveShouldSetPanResponder: () => isSelected,
      onPanResponderTerminationRequest: () => false,
      
      onPanResponderGrant: () => {
        onSelect();
        setShowGuides(showAlignmentGuides);
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        
        // Slight scale animation on drag start
        Animated.spring(scaleAnim, {
          toValue: 1.1,
          useNativeDriver: true,
          friction: 5,
        }).start();
      },
      
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Calculate new position
        const newX = currentPosition.x + dx;
        const newY = currentPosition.y + dy;
        
        // Get snapped position
        const snappedPosition = positioningEngine.getSnappedPosition(
          { x: newX, y: newY },
          overlay.size,
          otherOverlays,
          showAlignmentGuides
        );
        
        // Calculate adjusted deltas for snapped position
        const adjustedDx = snappedPosition.x - currentPosition.x;
        const adjustedDy = snappedPosition.y - currentPosition.y;
        
        // Update pan animation
        pan.setValue({ x: adjustedDx, y: adjustedDy });
        
        // Check for collisions
        const hasCollision = positioningEngine.checkCollision(
          overlay,
          {
            x: (snappedPosition.x / containerDimensions.width) * 100,
            y: (snappedPosition.y / containerDimensions.height) * 100,
          },
          otherOverlays
        );
        
        if (hasCollision !== collision) {
          setCollision(hasCollision);
          if (hasCollision && showCollisionWarning && Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
      },
      
      onPanResponderRelease: (_, gestureState) => {
        setShowGuides(false);
        
        // Calculate final position
        const { dx, dy } = gestureState;
        const newX = currentPosition.x + dx;
        const newY = currentPosition.y + dy;
        
        const snappedPosition = positioningEngine.getSnappedPosition(
          { x: newX, y: newY },
          overlay.size,
          otherOverlays,
          false
        );
        
        // Convert back to percentage
        const percentX = (snappedPosition.x / containerDimensions.width) * 100;
        const percentY = (snappedPosition.y / containerDimensions.height) * 100;
        
        // Update overlay position
        onUpdate({
          position: {
            x: Math.max(0, Math.min(100, percentX)),
            y: Math.max(0, Math.min(100, percentY)),
          },
        });
        
        // Reset animations
        pan.setValue({ x: 0, y: 0 });
        setCollision(false);
        
        Animated.spring(scaleAnim, {
          toValue: isSelected ? 1.05 : 1,
          useNativeDriver: true,
          friction: 5,
        }).start();
        
        // Notify parent that dragging ended
        onDragEnd?.();
      },
    })
  ).current;


  const animatedStyle = {
    transform: [
      { translateX: pan.x },
      { translateY: pan.y },
      { scale: scaleAnim },
    ],
    opacity: fadeAnim,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: currentPosition.x,
          top: currentPosition.y,
          width: overlay.size.width,
          height: overlay.size.height,
          zIndex: overlay.zIndex,
        },
        animatedStyle,
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onSelect}
        style={styles.imageContainer}
      >
        <FastImage
          source={{ uri: overlay.url }}
          style={[
            styles.image,
            {
              opacity: overlay.opacity || 1,
            },
          ]}
          resizeMode={FastImage?.resizeMode?.contain || 'contain'}
          fallback
        />
        
        {/* Selection border */}
        {isSelected && (
          <View style={styles.selectionBorder} />
        )}
        
        {/* Collision warning */}
        {collision && showCollisionWarning && (
          <View style={styles.collisionWarning}>
            <Text style={styles.collisionText}>!</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {/* Alignment guides */}
      {showGuides && (
        <>
          <View style={[styles.guide, styles.guideHorizontal]} />
          <View style={[styles.guide, styles.guideVertical]} />
        </>
      )}
      
      {/* Resize handles when selected */}
      {isSelected && (
        <>
          <View 
            style={[styles.resizeHandle, styles.handleTopLeft]} 
            {...PanResponder.create({
              onStartShouldSetPanResponder: () => true,
              onMoveShouldSetPanResponder: () => true,
              onPanResponderMove: (_, gestureState) => {
                const newWidth = Math.max(50, overlay.size.width - gestureState.dx);
                const newHeight = Math.max(50, overlay.size.height - gestureState.dy);
                onUpdate({ size: { width: newWidth, height: newHeight } });
              },
            }).panHandlers}
          />
          <View 
            style={[styles.resizeHandle, styles.handleTopRight]} 
            {...PanResponder.create({
              onStartShouldSetPanResponder: () => true,
              onMoveShouldSetPanResponder: () => true,
              onPanResponderMove: (_, gestureState) => {
                const newWidth = Math.max(50, overlay.size.width + gestureState.dx);
                const newHeight = Math.max(50, overlay.size.height - gestureState.dy);
                onUpdate({ size: { width: newWidth, height: newHeight } });
              },
            }).panHandlers}
          />
          <View 
            style={[styles.resizeHandle, styles.handleBottomLeft]} 
            {...PanResponder.create({
              onStartShouldSetPanResponder: () => true,
              onMoveShouldSetPanResponder: () => true,
              onPanResponderMove: (_, gestureState) => {
                const newWidth = Math.max(50, overlay.size.width - gestureState.dx);
                const newHeight = Math.max(50, overlay.size.height + gestureState.dy);
                onUpdate({ size: { width: newWidth, height: newHeight } });
              },
            }).panHandlers}
          />
          <View 
            style={[styles.resizeHandle, styles.handleBottomRight]} 
            {...PanResponder.create({
              onStartShouldSetPanResponder: () => true,
              onMoveShouldSetPanResponder: () => true,
              onPanResponderMove: (_, gestureState) => {
                const newWidth = Math.max(50, overlay.size.width + gestureState.dx);
                const newHeight = Math.max(50, overlay.size.height + gestureState.dy);
                onUpdate({ size: { width: newWidth, height: newHeight } });
              },
            }).panHandlers}
          />
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectionBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#7ED321',
    borderStyle: 'dashed',
    pointerEvents: 'none',
  },
  collisionWarning: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collisionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  guide: {
    position: 'absolute',
    backgroundColor: '#7ED321',
    opacity: 0.5,
  },
  guideHorizontal: {
    left: -1000,
    right: -1000,
    height: 1,
    top: '50%',
  },
  guideVertical: {
    top: -1000,
    bottom: -1000,
    width: 1,
    left: '50%',
  },
  resizeHandle: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#7ED321',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  handleTopLeft: {
    top: -8,
    left: -8,
  },
  handleTopRight: {
    top: -8,
    right: -8,
  },
  handleBottomLeft: {
    bottom: -8,
    left: -8,
  },
  handleBottomRight: {
    bottom: -8,
    right: -8,
  },
});

export default ImageOverlay;