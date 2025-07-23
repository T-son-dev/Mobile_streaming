import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Overlay, ImageOverlay as ImageOverlayType, TextOverlay as TextOverlayType } from '@/types/overlay';
import TextOverlay from './TextOverlay';
import ImageOverlay from './ImageOverlay';
import { overlayService } from '@/services/OverlayService';

interface OverlayRendererProps {
  containerWidth?: number;
  containerHeight?: number;
  style?: any;
  onOverlaySelect?: (overlayId: string | null) => void;
  selectedOverlayId?: string | null;
  editingOverlayId?: string | null;
  onEditingChange?: (overlayId: string | null) => void;
}

const OverlayRenderer: React.FC<OverlayRendererProps> = ({
  containerWidth = Dimensions.get('window').width,
  containerHeight = Dimensions.get('window').height,
  style,
  onOverlaySelect,
  selectedOverlayId,
  editingOverlayId,
  onEditingChange,
}) => {
  const [overlays, setOverlays] = useState<Overlay[]>([]);

  useEffect(() => {
    // Initialize service and load overlays
    const initializeService = async () => {
      await overlayService.initialize();
      setOverlays(overlayService.getEnabledOverlays());
    };

    initializeService();

    // Events disabled to prevent recursion
  }, []);

  const handleOverlayUpdate = (overlayId: string, updates: Partial<Overlay>) => {
    overlayService.updateOverlay(overlayId, updates);
    // Don't update state here to prevent infinite loop during dragging
    // State will be updated when dragging ends
  };

  const renderOverlay = (overlay: Overlay) => {
    if (!overlay.enabled) return null;

    const containerSize = { width: containerWidth, height: containerHeight };

    switch (overlay.type) {
      case 'text':
        const textOverlay = overlay as TextOverlayType;
        return (
          <TextOverlay
            key={overlay.id}
            overlay={textOverlay}
            isSelected={overlay.id === selectedOverlayId}
            isEditing={overlay.id === editingOverlayId}
            otherOverlays={overlays.filter(o => o.id !== overlay.id) as TextOverlayType[]}
            onUpdate={(updates) => handleOverlayUpdate(overlay.id, updates)}
            onSelect={() => onOverlaySelect?.(overlay.id)}
            onStartEdit={() => onEditingChange?.(overlay.id)}
            onEndEdit={() => onEditingChange?.(null)}
            onDragEnd={() => setOverlays(overlayService.getEnabledOverlays())}
            containerSize={containerSize}
          />
        );

      case 'image':
        const imageOverlay = overlay as ImageOverlayType;
        return (
          <ImageOverlay
            key={overlay.id}
            overlay={imageOverlay}
            isSelected={overlay.id === selectedOverlayId}
            otherOverlays={overlays.filter(o => o.id !== overlay.id) as ImageOverlayType[]}
            onUpdate={(updates) => handleOverlayUpdate(overlay.id, updates)}
            onSelect={() => onOverlaySelect?.(overlay.id)}
            onDragEnd={() => setOverlays(overlayService.getEnabledOverlays())}
            containerSize={containerSize}
          />
        );

      // TODO: Add support for web and video overlays
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
    pointerEvents: 'box-none', // Allow touches to pass through empty areas
  },
});

export default OverlayRenderer;