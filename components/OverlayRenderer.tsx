import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Overlay, ImageOverlay as ImageOverlayType, TextOverlay as TextOverlayType } from '@/types/overlay';
import TextOverlay from './TextOverlay';
import ImageOverlay from './ImageOverlay';
import { overlayService } from '@/services/OverlayService';
import BugReporter from '../services/BugReporter';
import PerformanceProfiler from '../services/PerformanceProfiler';

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
  const [containerDimensions, setContainerDimensions] = useState({ 
    width: containerWidth, 
    height: containerHeight 
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const renderCountRef = useRef(0);
  const performanceCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Performance monitoring
  useEffect(() => {
    renderCountRef.current += 1;
    
    // Monitor render performance
    if (renderCountRef.current > 100) {
      BugReporter.warn('OverlayRenderer', 'High render count detected', {
        renderCount: renderCountRef.current,
        overlayCount: overlays.length
      });
    }

    // Start performance check if needed
    if (!performanceCheckRef.current && overlays.length > 5) {
      performanceCheckRef.current = setTimeout(() => {
        PerformanceProfiler.getCurrentMetrics();
      }, 1000);
    }

    return () => {
      if (performanceCheckRef.current) {
        clearTimeout(performanceCheckRef.current);
        performanceCheckRef.current = null;
      }
    };
  }, [overlays]);

  // Enhanced initialization with error handling
  useEffect(() => {
    const initializeService = async () => {
      try {
        BugReporter.debug('OverlayRenderer', 'Initializing overlay service');
        await overlayService.initialize();
        
        const loadedOverlays = overlayService.getEnabledOverlays();
        setOverlays(loadedOverlays);
        setIsInitialized(true);
        setError(null);
        
        BugReporter.info('OverlayRenderer', 'Overlay service initialized', {
          overlayCount: loadedOverlays.length
        });
      } catch (error) {
        const errorMessage = `Failed to initialize overlay service: ${error instanceof Error ? error.message : String(error)}`;
        setError(errorMessage);
        BugReporter.error('OverlayRenderer', errorMessage, error);
        
        // Report as bug
        BugReporter.reportBug({
          type: 'functionality',
          severity: 'high',
          title: 'Overlay Service Initialization Failed',
          description: errorMessage,
          reproductionSteps: ['Load overlay renderer', 'Initialize overlay service'],
          expectedBehavior: 'Overlay service should initialize successfully',
          actualBehavior: errorMessage,
          screenshots: [],
          tags: ['overlay', 'initialization'],
          metadata: { 
            error: error instanceof Error ? error.message : String(error), 
            stack: error instanceof Error ? error.stack : undefined 
          }
        });
      }
    };

    initializeService();
  }, []);

  // Handle orientation changes and dimension updates
  useEffect(() => {
    const handleDimensionChange = ({ window }: any) => {
      try {
        const newDimensions = {
          width: containerWidth || window.width,
          height: containerHeight || window.height
        };
        
        // Validate dimensions
        if (newDimensions.width <= 0 || newDimensions.height <= 0) {
          BugReporter.warn('OverlayRenderer', 'Invalid dimensions received', newDimensions);
          return;
        }
        
        setContainerDimensions(newDimensions);
        
        // Update overlay positions for new dimensions if needed
        if (overlays.length > 0) {
          refreshOverlaysForDimensions(newDimensions);
        }
        
        BugReporter.debug('OverlayRenderer', 'Dimensions changed', {
          ...newDimensions,
          overlayCount: overlays.length
        });
      } catch (error) {
        BugReporter.error('OverlayRenderer', 'Error handling dimension change', error);
      }
    };

    const subscription = Dimensions.addEventListener('change', handleDimensionChange);
    
    return () => {
      try {
        subscription?.remove();
      } catch (error) {
        BugReporter.warn('OverlayRenderer', 'Error removing dimension listener', error);
      }
    };
  }, [containerWidth, containerHeight, overlays]);

  // Refresh overlays when dimensions change
  const refreshOverlaysForDimensions = useCallback((newDimensions: { width: number; height: number }) => {
    try {
      if (!newDimensions || newDimensions.width <= 0 || newDimensions.height <= 0) {
        BugReporter.warn('OverlayRenderer', 'Invalid dimensions for overlay refresh', newDimensions);
        return;
      }

      let adjustedCount = 0;
      const updatedOverlays = overlays.map(overlay => {
        // Validate overlay data
        if (!overlay || !overlay.size || !overlay.position) {
          BugReporter.warn('OverlayRenderer', 'Invalid overlay data during dimension refresh', { overlayId: overlay?.id });
          return overlay;
        }

        // Calculate safe bounds with minimum margins
        const minMargin = 10;
        const maxX = Math.max(minMargin, newDimensions.width - overlay.size.width - minMargin);
        const maxY = Math.max(minMargin, newDimensions.height - overlay.size.height - minMargin);
        
        // Ensure overlay stays within bounds but maintain relative position when possible
        const adjustedPosition = {
          x: Math.max(0, Math.min(overlay.position.x, maxX)),
          y: Math.max(0, Math.min(overlay.position.y, maxY))
        };
        
        // Only update if position actually changed to prevent unnecessary operations
        if (adjustedPosition.x !== overlay.position.x || adjustedPosition.y !== overlay.position.y) {
          try {
            overlayService.updateOverlay(overlay.id, { position: adjustedPosition });
            adjustedCount++;
          } catch (updateError) {
            BugReporter.error('OverlayRenderer', `Failed to update overlay ${overlay.id} position`, updateError);
            return overlay; // Return original overlay if update fails
          }
        }
        
        return {
          ...overlay,
          position: adjustedPosition
        };
      });
      
      setOverlays(updatedOverlays);
      
      if (adjustedCount > 0) {
        BugReporter.info('OverlayRenderer', 'Adjusted overlay positions for dimension change', {
          adjustedCount,
          totalOverlays: overlays.length,
          newDimensions
        });
      }
    } catch (error) {
      BugReporter.error('OverlayRenderer', 'Error adjusting overlays for dimension change', error);
    }
  }, [overlays]);

  const handleOverlayUpdate = useCallback((overlayId: string, updates: Partial<Overlay>) => {
    try {
      // Validate input parameters
      if (!overlayId || typeof overlayId !== 'string') {
        BugReporter.warn('OverlayRenderer', 'Invalid overlay ID provided for update', { overlayId });
        return;
      }

      if (!updates || typeof updates !== 'object') {
        BugReporter.warn('OverlayRenderer', 'Invalid updates provided for overlay', { overlayId, updates });
        return;
      }

      // Validate position updates to prevent overlays from going out of bounds
      if (updates.position) {
        const { x, y } = updates.position;
        const overlay = overlayService.getOverlay(overlayId);
        
        if (overlay) {
          const maxX = Math.max(0, containerDimensions.width - overlay.size.width);
          const maxY = Math.max(0, containerDimensions.height - overlay.size.height);
          
          updates.position = {
            x: Math.max(0, Math.min(x, maxX)),
            y: Math.max(0, Math.min(y, maxY))
          };
        }
      }

      // Validate size updates
      if (updates.size) {
        const { width, height } = updates.size;
        if (width <= 0 || height <= 0) {
          BugReporter.warn('OverlayRenderer', 'Invalid size provided for overlay update', { overlayId, size: updates.size });
          return;
        }

        // Ensure size doesn't exceed container dimensions
        updates.size = {
          width: Math.min(width, containerDimensions.width),
          height: Math.min(height, containerDimensions.height)
        };
      }

      overlayService.updateOverlay(overlayId, updates);
      
      // Don't update state here to prevent infinite loop during dragging
      // State will be updated when dragging ends
    } catch (error) {
      BugReporter.error('OverlayRenderer', 'Error updating overlay', { overlayId, updates, error });
    }
  }, [containerDimensions]);

  const renderOverlay = useCallback((overlay: Overlay) => {
    try {
      // Validate overlay data
      if (!overlay) {
        BugReporter.warn('OverlayRenderer', 'Null overlay provided to renderOverlay');
        return null;
      }

      if (!overlay.enabled) return null;

      // Validate overlay has required properties
      if (!overlay.id || !overlay.type || !overlay.position || !overlay.size) {
        BugReporter.warn('OverlayRenderer', 'Invalid overlay data', { overlayId: overlay.id, type: overlay.type });
        return null;
      }

      const containerSize = { 
        width: containerDimensions.width, 
        height: containerDimensions.height 
      };

      // Safe drag end handler
      const handleDragEnd = () => {
        try {
          setOverlays(overlayService.getEnabledOverlays());
        } catch (error) {
          BugReporter.error('OverlayRenderer', 'Error refreshing overlays after drag', error);
        }
      };

      switch (overlay.type) {
        case 'text':
          try {
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
                onDragEnd={handleDragEnd}
                containerSize={containerSize}
              />
            );
          } catch (error) {
            BugReporter.error('OverlayRenderer', 'Error rendering text overlay', { overlayId: overlay.id, error });
            return null;
          }

        case 'image':
          try {
            const imageOverlay = overlay as ImageOverlayType;
            return (
              <ImageOverlay
                key={overlay.id}
                overlay={imageOverlay}
                isSelected={overlay.id === selectedOverlayId}
                otherOverlays={overlays.filter(o => o.id !== overlay.id) as ImageOverlayType[]}
                onUpdate={(updates) => handleOverlayUpdate(overlay.id, updates)}
                onSelect={() => onOverlaySelect?.(overlay.id)}
                onDragEnd={handleDragEnd}
                containerSize={containerSize}
              />
            );
          } catch (error) {
            BugReporter.error('OverlayRenderer', 'Error rendering image overlay', { overlayId: overlay.id, error });
            return null;
          }

        // TODO: Add support for web and video overlays
        default:
          BugReporter.warn('OverlayRenderer', 'Unsupported overlay type', { overlayId: overlay.id, type: overlay.type });
          return null;
      }
    } catch (error) {
      BugReporter.error('OverlayRenderer', 'Critical error in renderOverlay', { overlayId: overlay?.id, error });
      return null;
    }
  }, [overlays, selectedOverlayId, editingOverlayId, containerDimensions, handleOverlayUpdate, onOverlaySelect, onEditingChange]);

  // Error boundary fallback
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style, { width: containerWidth, height: containerHeight }]}>
        <View style={styles.errorMessage}>
          {/* Error display would be implemented based on design requirements */}
        </View>
      </View>
    );
  }

  // Loading state
  if (!isInitialized) {
    return (
      <View style={[styles.container, style, { width: containerWidth, height: containerHeight }]}>
        {/* Loading indicator would be implemented based on design requirements */}
      </View>
    );
  }

  // Safe overlay sorting with error handling
  let sortedOverlays: Overlay[] = [];
  try {
    sortedOverlays = [...overlays]
      .filter(overlay => overlay && typeof overlay === 'object')
      .sort((a, b) => {
        // Safe z-index comparison
        const aIndex = typeof a.zIndex === 'number' ? a.zIndex : 0;
        const bIndex = typeof b.zIndex === 'number' ? b.zIndex : 0;
        return aIndex - bIndex;
      });
  } catch (error) {
    BugReporter.error('OverlayRenderer', 'Error sorting overlays', error);
    sortedOverlays = overlays.filter(Boolean); // Fallback to unsorted but filtered
  }

  return (
    <View style={[styles.container, style, { 
      width: containerDimensions.width, 
      height: containerDimensions.height 
    }]}>
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
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  errorMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
});

export default OverlayRenderer;