import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { TextOverlay as TextOverlayType } from '@/types/overlay';
import { positioningEngine } from '@/services/PositioningEngine';
import { typographyManager } from '@/services/TypographyManager';
import { textOverlayManager } from '@/services/TextOverlayManager';
import * as Haptics from 'expo-haptics';

interface TextOverlayProps {
  overlay: TextOverlayType;
  isSelected: boolean;
  isEditing: boolean;
  otherOverlays: TextOverlayType[];
  onUpdate: (updates: Partial<TextOverlayType>) => void;
  onSelect: () => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onDragEnd?: () => void;
  containerSize?: { width: number; height: number };
  showCollisionWarning?: boolean;
  showAlignmentGuides?: boolean;
}

const TextOverlay: React.FC<TextOverlayProps> = ({
  overlay,
  isSelected,
  isEditing,
  otherOverlays,
  onUpdate,
  onSelect,
  onStartEdit,
  onEndEdit,
  onDragEnd,
  containerSize,
  showCollisionWarning = true,
  showAlignmentGuides = true,
}) => {
  const [localContent, setLocalContent] = useState(overlay.content);
  const [showGuides, setShowGuides] = useState(false);
  const [collision, setCollision] = useState(false);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const screenDimensions = containerSize || Dimensions.get('window');
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    // Initial fade in animation
    Animated.timing(fadeAnim, {
      toValue: overlay.enabled ? 1 : 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [overlay.enabled]);

  useEffect(() => {
    setLocalContent(overlay.content);
  }, [overlay.content]);

  // Apply text animations
  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const style = overlay.style as any;
    if (style.animation?.type === 'pulse' && style.animation?.loop) {
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: style.animation.duration || 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: style.animation.duration || 2000,
            useNativeDriver: true,
          }),
        ])
      );
      animationRef.current.start();
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [overlay.style]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isEditing,
      onMoveShouldSetPanResponder: () => !isEditing,
      
      onPanResponderGrant: () => {
        onSelect();
        setShowGuides(true);
        
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          friction: 3,
          useNativeDriver: true,
        }).start();
        
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        const currentPixelPos = positioningEngine.percentToPixel(overlay.position);
        const newPixelPos = {
          x: currentPixelPos.x + gestureState.dx,
          y: currentPixelPos.y + gestureState.dy,
        };
        
        const newPercentPos = positioningEngine.pixelToPercent(newPixelPos);
        
        // Check for collisions
        const collisionResult = positioningEngine.detectCollisions(
          overlay,
          otherOverlays,
          newPercentPos
        );
        
        setCollision(collisionResult.collides);
        
        // Apply snapping
        const snapPoints = positioningEngine.getSnapPoints(overlay, otherOverlays);
        const snappedPosition = positioningEngine.applySnapping(newPercentPos, snapPoints);
        
        pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      
      onPanResponderRelease: (evt, gestureState) => {
        setShowGuides(false);
        
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }).start();
        
        const currentPixelPos = positioningEngine.percentToPixel(overlay.position);
        const newPixelPos = {
          x: currentPixelPos.x + gestureState.dx,
          y: currentPixelPos.y + gestureState.dy,
        };
        
        let newPercentPos = positioningEngine.pixelToPercent(newPixelPos);
        
        // Apply snapping for final position
        const snapPoints = positioningEngine.getSnapPoints(overlay, otherOverlays);
        newPercentPos = positioningEngine.applySnapping(newPercentPos, snapPoints);
        
        // Check for collisions and get suggested position if needed
        const collisionResult = positioningEngine.detectCollisions(
          overlay,
          otherOverlays,
          newPercentPos
        );
        
        if (collisionResult.collides && collisionResult.suggestedPosition) {
          newPercentPos = collisionResult.suggestedPosition;
          if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        }
        
        // Ensure position is valid
        if (positioningEngine.isPositionValid(newPercentPos, overlay.size)) {
          onUpdate({ position: newPercentPos });
        }
        
        // Reset pan position
        pan.setValue({ x: 0, y: 0 });
        setCollision(false);
        
        // Notify parent that dragging ended
        onDragEnd?.();
      },
    })
  ).current;

  const handleDoublePress = useCallback(() => {
    if (!isEditing) {
      onStartEdit();
      if (Platform.OS === 'ios') {
        Haptics.selectionAsync();
      }
    }
  }, [isEditing, onStartEdit]);

  const handleContentChange = (text: string) => {
    setLocalContent(text);
  };

  const handleContentSubmit = () => {
    onUpdate({ content: localContent });
    onEndEdit();
  };

  const getTextStyle = () => {
    const baseStyle = overlay.style;
    const enhancedStyle: any = { ...baseStyle };
    
    // Apply text shadow if specified
    if (baseStyle.textShadowColor) {
      enhancedStyle.textShadowColor = baseStyle.textShadowColor;
      enhancedStyle.textShadowOffset = baseStyle.textShadowOffset || { width: 2, height: 2 };
      enhancedStyle.textShadowRadius = baseStyle.textShadowRadius || 4;
    }
    
    // Apply other text properties
    if (baseStyle.letterSpacing) {
      enhancedStyle.letterSpacing = baseStyle.letterSpacing;
    }
    
    if (baseStyle.lineHeight) {
      enhancedStyle.lineHeight = baseStyle.lineHeight;
    }
    
    if (baseStyle.textAlign) {
      enhancedStyle.textAlign = baseStyle.textAlign;
    }
    
    if (baseStyle.textDecorationLine) {
      enhancedStyle.textDecorationLine = baseStyle.textDecorationLine;
    }
    
    if (baseStyle.fontWeight) {
      enhancedStyle.fontWeight = baseStyle.fontWeight;
    }
    
    if (baseStyle.fontStyle) {
      enhancedStyle.fontStyle = baseStyle.fontStyle;
    }
    
    if (baseStyle.textTransform) {
      enhancedStyle.textTransform = baseStyle.textTransform;
    }
    
    return enhancedStyle;
  };

  const pixelPosition = positioningEngine.percentToPixel(overlay.position);
  
  return (
    <>
      <Animated.View
        style={[
          styles.container,
          {
            position: 'absolute',
            left: pixelPosition.x,
            top: pixelPosition.y,
            opacity: fadeAnim,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: Animated.multiply(scaleAnim, pulseAnim) },
            ],
            zIndex: overlay.zIndex,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSelect}
          onLongPress={handleDoublePress}
          disabled={isEditing}
        >
          <View
            style={[
              styles.textContainer,
              {
                backgroundColor: overlay.style.backgroundColor,
                padding: overlay.style.padding,
                borderWidth: isSelected ? 2 : 0,
                borderColor: collision ? '#ff4444' : '#00ff88',
                borderStyle: isSelected ? 'dashed' : 'solid',
              },
            ]}
          >
            {isEditing ? (
              <TextInput
                style={[
                  styles.textInput,
                  getTextStyle(),
                  {
                    minWidth: 100,
                    minHeight: overlay.style.fontSize * 1.5,
                  },
                ]}
                value={localContent}
                onChangeText={handleContentChange}
                onSubmitEditing={handleContentSubmit}
                onBlur={handleContentSubmit}
                autoFocus
                multiline
                returnKeyType="done"
                blurOnSubmit
              />
            ) : (
              <Text
                style={[
                  styles.text,
                  getTextStyle(),
                ]}
                numberOfLines={0}
              >
                {overlay.content}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Alignment guides */}
      {showGuides && showAlignmentGuides && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          {positioningEngine.getAlignmentGuides(overlay, otherOverlays).map((guide, index) => (
            <View
              key={index}
              style={[
                styles.alignmentGuide,
                guide.type === 'horizontal'
                  ? {
                      top: guide.position,
                      left: 0,
                      right: 0,
                      height: 1,
                    }
                  : {
                      left: guide.position,
                      top: 0,
                      bottom: 0,
                      width: 1,
                    },
              ]}
            />
          ))}
        </View>
      )}
      
      {/* Collision warning */}
      {collision && showCollisionWarning && (
        <View
          style={[
            styles.collisionWarning,
            {
              left: pixelPosition.x,
              top: pixelPosition.y - 30,
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.collisionText}>Overlapping!</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  textContainer: {
    borderRadius: 4,
  },
  text: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  textInput: {
    includeFontPadding: false,
    textAlignVertical: 'center',
    margin: 0,
    padding: 0,
  },
  alignmentGuide: {
    backgroundColor: '#00ff88',
    opacity: 0.5,
    position: 'absolute',
  },
  collisionWarning: {
    position: 'absolute',
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  collisionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TextOverlay;