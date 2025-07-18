import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Overlay, ImageOverlay as ImageOverlayType, TextOverlay } from '@/types/overlay';

// Conditional import for FastImage
let FastImage: any = null;
try {
  FastImage = require('react-native-fast-image');
} catch (error) {
  console.warn('react-native-fast-image not available, using standard Image:', error);
  FastImage = require('react-native').Image;
}

interface SimpleOverlayRendererProps {
  overlays: Overlay[];
  containerWidth?: number;
  containerHeight?: number;
  style?: any;
}

const SimpleOverlayRenderer: React.FC<SimpleOverlayRendererProps> = ({
  overlays,
  containerWidth = Dimensions.get('window').width,
  containerHeight = Dimensions.get('window').height,
  style,
}) => {
  const renderOverlay = (overlay: Overlay) => {
    if (!overlay.enabled) return null;

    const overlayStyle = {
      position: 'absolute' as const,
      left: (overlay.position.x / 100) * containerWidth,
      top: (overlay.position.y / 100) * containerHeight,
      width: overlay.size.width,
      height: overlay.size.height,
      zIndex: overlay.zIndex,
    };

    switch (overlay.type) {
      case 'image':
        const imageOverlay = overlay as ImageOverlayType;
        return (
          <View key={overlay.id} style={overlayStyle}>
            <FastImage
              source={{ uri: imageOverlay.url }}
              style={{
                width: '100%',
                height: '100%',
                opacity: imageOverlay.opacity || 1,
              }}
              resizeMode={FastImage?.resizeMode?.contain || 'contain'}
              fallback
            />
          </View>
        );

      case 'text':
        const textOverlay = overlay as TextOverlay;
        return (
          <View key={overlay.id} style={overlayStyle}>
            <Text
              style={{
                color: textOverlay.style.color,
                fontSize: textOverlay.style.fontSize,
                fontFamily: textOverlay.style.fontFamily,
                backgroundColor: textOverlay.style.backgroundColor,
                padding: textOverlay.style.padding,
              }}
            >
              {textOverlay.content}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  // Sort overlays by z-index for proper layering
  const sortedOverlays = [...overlays].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <View style={[styles.container, style, { width: containerWidth, height: containerHeight }]}>
      {sortedOverlays.map(renderOverlay)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none', // Allow touches to pass through to camera
  },
});

export default SimpleOverlayRenderer;