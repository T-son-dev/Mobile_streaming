import { Dimensions, Platform } from 'react-native';
import { Overlay } from '@/types/overlay';
let HapticFeedback: any = null;
try {
  HapticFeedback = require('react-native-haptic-feedback').default;
} catch (error) {
  console.warn('react-native-haptic-feedback not available:', error);
  HapticFeedback = {
    trigger: () => {},
  };
}

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

interface SafeArea {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface CollisionResult {
  collides: boolean;
  overlappingIds: string[];
  suggestedPosition?: Position;
}

interface SnapPoint {
  position: Position;
  type: 'grid' | 'edge' | 'center' | 'overlay';
  strength: number;
}

export interface PositioningOptions {
  magneticSnapping: boolean;
  gridAlignment: boolean;
  safeAreaDetection: boolean;
  collisionPrevention: boolean;
  orientationAdaptive: boolean;
  multiTouchSupport: boolean;
  gridSize?: number;
  snapThreshold?: number;
  edgeMargin?: number;
}

export class PositioningEngine {
  private static instance: PositioningEngine;
  private screenDimensions: { width: number; height: number };
  private safeArea: SafeArea;
  private options: PositioningOptions;
  private activeGestures: Map<string, any> = new Map();

  private constructor() {
    const { width, height } = Dimensions.get('window');
    this.screenDimensions = { width, height };
    
    // Default safe area for camera controls
    this.safeArea = {
      top: 50,
      bottom: 100,
      left: 20,
      right: 20,
    };

    this.options = {
      magneticSnapping: true,
      gridAlignment: true,
      safeAreaDetection: true,
      collisionPrevention: true,
      orientationAdaptive: true,
      multiTouchSupport: true,
      gridSize: 10,
      snapThreshold: 15,
      edgeMargin: 20,
    };

    // Listen for orientation changes
    const subscription = Dimensions.addEventListener('change', this.handleDimensionChange);
  }

  static getInstance(): PositioningEngine {
    if (!PositioningEngine.instance) {
      PositioningEngine.instance = new PositioningEngine();
    }
    return PositioningEngine.instance;
  }

  private handleDimensionChange = ({ window }: { window: any }) => {
    this.screenDimensions = { width: window.width, height: window.height };
  };

  updateOptions(options: Partial<PositioningOptions>): void {
    this.options = { ...this.options, ...options };
  }

  updateSafeArea(safeArea: Partial<SafeArea>): void {
    this.safeArea = { ...this.safeArea, ...safeArea };
  }

  // Convert between percentage and pixel coordinates
  percentToPixel(position: Position): Position {
    return {
      x: (position.x / 100) * this.screenDimensions.width,
      y: (position.y / 100) * this.screenDimensions.height,
    };
  }

  pixelToPercent(position: Position): Position {
    return {
      x: (position.x / this.screenDimensions.width) * 100,
      y: (position.y / this.screenDimensions.height) * 100,
    };
  }

  // Get bounds of an overlay in pixels
  private getOverlayBounds(overlay: Overlay): Bounds {
    const position = this.percentToPixel(overlay.position);
    return {
      left: position.x,
      top: position.y,
      right: position.x + overlay.size.width,
      bottom: position.y + overlay.size.height,
    };
  }

  // Check if two bounds intersect
  private boundsIntersect(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(
      bounds1.right < bounds2.left ||
      bounds1.left > bounds2.right ||
      bounds1.bottom < bounds2.top ||
      bounds1.top > bounds2.bottom
    );
  }

  // Collision detection
  detectCollisions(
    overlay: Overlay,
    otherOverlays: Overlay[],
    proposedPosition?: Position
  ): CollisionResult {
    const testOverlay = proposedPosition
      ? { ...overlay, position: proposedPosition }
      : overlay;
    
    const testBounds = this.getOverlayBounds(testOverlay);
    const overlappingIds: string[] = [];

    for (const other of otherOverlays) {
      if (other.id === overlay.id || !other.enabled) continue;
      
      const otherBounds = this.getOverlayBounds(other);
      if (this.boundsIntersect(testBounds, otherBounds)) {
        overlappingIds.push(other.id);
      }
    }

    const result: CollisionResult = {
      collides: overlappingIds.length > 0,
      overlappingIds,
    };

    // Suggest alternative position if collision detected
    if (result.collides && this.options.collisionPrevention) {
      result.suggestedPosition = this.findNonCollidingPosition(overlay, otherOverlays);
    }

    return result;
  }

  // Find a non-colliding position near the original
  private findNonCollidingPosition(
    overlay: Overlay,
    otherOverlays: Overlay[]
  ): Position | undefined {
    const originalPos = this.percentToPixel(overlay.position);
    const searchRadius = 50;
    const step = 10;

    // Spiral search pattern
    for (let radius = step; radius <= searchRadius; radius += step) {
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = (angle * Math.PI) / 180;
        const testPos = {
          x: originalPos.x + radius * Math.cos(rad),
          y: originalPos.y + radius * Math.sin(rad),
        };

        const testPosPercent = this.pixelToPercent(testPos);
        const collision = this.detectCollisions(overlay, otherOverlays, testPosPercent);
        
        if (!collision.collides && this.isPositionValid(testPosPercent, overlay.size)) {
          return testPosPercent;
        }
      }
    }

    return undefined;
  }

  // Check if position is within valid bounds
  isPositionValid(position: Position, size: Size): boolean {
    const pixelPos = this.percentToPixel(position);
    
    // Check screen bounds
    if (
      pixelPos.x < 0 ||
      pixelPos.y < 0 ||
      pixelPos.x + size.width > this.screenDimensions.width ||
      pixelPos.y + size.height > this.screenDimensions.height
    ) {
      return false;
    }

    // Check safe areas if enabled
    if (this.options.safeAreaDetection) {
      const bounds = {
        left: pixelPos.x,
        top: pixelPos.y,
        right: pixelPos.x + size.width,
        bottom: pixelPos.y + size.height,
      };

      const safeAreaBounds = {
        left: this.safeArea.left,
        top: this.safeArea.top,
        right: this.screenDimensions.width - this.safeArea.right,
        bottom: this.screenDimensions.height - this.safeArea.bottom,
      };

      // Check if overlay is completely within safe area
      if (
        bounds.left < safeAreaBounds.left ||
        bounds.top < safeAreaBounds.top ||
        bounds.right > safeAreaBounds.right ||
        bounds.bottom > safeAreaBounds.bottom
      ) {
        return true; // Allow but warn
      }
    }

    return true;
  }

  // Get snap points for magnetic alignment
  getSnapPoints(overlay: Overlay, otherOverlays: Overlay[]): SnapPoint[] {
    const snapPoints: SnapPoint[] = [];
    const pixelPos = this.percentToPixel(overlay.position);

    // Grid snap points
    if (this.options.gridAlignment && this.options.gridSize) {
      const gridSize = this.options.gridSize;
      const nearestGridX = Math.round(pixelPos.x / gridSize) * gridSize;
      const nearestGridY = Math.round(pixelPos.y / gridSize) * gridSize;
      
      snapPoints.push({
        position: this.pixelToPercent({ x: nearestGridX, y: nearestGridY }),
        type: 'grid',
        strength: 0.5,
      });
    }

    // Edge snap points
    if (this.options.magneticSnapping) {
      const margin = this.options.edgeMargin || 20;
      
      // Top edge
      if (pixelPos.y < margin * 2) {
        snapPoints.push({
          position: { x: overlay.position.x, y: this.pixelToPercent({ x: 0, y: margin }).y },
          type: 'edge',
          strength: 1.0,
        });
      }
      
      // Bottom edge
      if (pixelPos.y + overlay.size.height > this.screenDimensions.height - margin * 2) {
        snapPoints.push({
          position: {
            x: overlay.position.x,
            y: this.pixelToPercent({ x: 0, y: this.screenDimensions.height - overlay.size.height - margin }).y,
          },
          type: 'edge',
          strength: 1.0,
        });
      }
      
      // Left edge
      if (pixelPos.x < margin * 2) {
        snapPoints.push({
          position: { x: this.pixelToPercent({ x: margin, y: 0 }).x, y: overlay.position.y },
          type: 'edge',
          strength: 1.0,
        });
      }
      
      // Right edge
      if (pixelPos.x + overlay.size.width > this.screenDimensions.width - margin * 2) {
        snapPoints.push({
          position: {
            x: this.pixelToPercent({ x: this.screenDimensions.width - overlay.size.width - margin, y: 0 }).x,
            y: overlay.position.y,
          },
          type: 'edge',
          strength: 1.0,
        });
      }
    }

    // Center snap points
    const centerX = this.pixelToPercent({ x: this.screenDimensions.width / 2 - overlay.size.width / 2, y: 0 }).x;
    const centerY = this.pixelToPercent({ x: 0, y: this.screenDimensions.height / 2 - overlay.size.height / 2 }).y;
    
    if (Math.abs(overlay.position.x - centerX) < 5) {
      snapPoints.push({
        position: { x: centerX, y: overlay.position.y },
        type: 'center',
        strength: 0.8,
      });
    }
    
    if (Math.abs(overlay.position.y - centerY) < 5) {
      snapPoints.push({
        position: { x: overlay.position.x, y: centerY },
        type: 'center',
        strength: 0.8,
      });
    }

    // Overlay alignment snap points
    otherOverlays.forEach(other => {
      if (other.id === overlay.id || !other.enabled) return;
      
      const otherBounds = this.getOverlayBounds(other);
      const overlayBounds = this.getOverlayBounds(overlay);
      
      // Align tops
      if (Math.abs(overlayBounds.top - otherBounds.top) < this.options.snapThreshold!) {
        snapPoints.push({
          position: { x: overlay.position.x, y: other.position.y },
          type: 'overlay',
          strength: 0.7,
        });
      }
      
      // Align bottoms
      const otherBottom = other.position.y + this.pixelToPercent({ x: 0, y: other.size.height }).y;
      const overlayBottom = overlay.position.y + this.pixelToPercent({ x: 0, y: overlay.size.height }).y;
      if (Math.abs(overlayBottom - otherBottom) < this.options.snapThreshold!) {
        snapPoints.push({
          position: {
            x: overlay.position.x,
            y: otherBottom - this.pixelToPercent({ x: 0, y: overlay.size.height }).y,
          },
          type: 'overlay',
          strength: 0.7,
        });
      }
    });

    return snapPoints;
  }

  // Apply snapping to a position
  applySnapping(position: Position, snapPoints: SnapPoint[]): Position {
    if (!this.options.magneticSnapping || snapPoints.length === 0) {
      return position;
    }

    let snappedPosition = { ...position };
    const threshold = this.options.snapThreshold || 15;

    snapPoints.forEach(snapPoint => {
      const pixelPos = this.percentToPixel(position);
      const snapPixelPos = this.percentToPixel(snapPoint.position);
      
      const distanceX = Math.abs(pixelPos.x - snapPixelPos.x);
      const distanceY = Math.abs(pixelPos.y - snapPixelPos.y);
      
      if (distanceX < threshold * snapPoint.strength) {
        snappedPosition.x = snapPoint.position.x;
        if (Platform.OS === 'ios') {
          HapticFeedback.trigger('impactLight');
        }
      }
      
      if (distanceY < threshold * snapPoint.strength) {
        snappedPosition.y = snapPoint.position.y;
        if (Platform.OS === 'ios') {
          HapticFeedback.trigger('impactLight');
        }
      }
    });

    return snappedPosition;
  }

  // Get snapped position for dragging (used by ImageOverlay)
  getSnappedPosition(
    pixelPosition: Position,
    size: Size,
    otherOverlays: Overlay[],
    showGuides: boolean = false
  ): Position {
    // Convert pixel position to percentage
    const percentPosition = this.pixelToPercent(pixelPosition);
    
    // Create a temporary overlay for snap point calculation
    const tempOverlay: Partial<Overlay> = {
      id: 'temp',
      type: 'image',
      name: 'temp',
      enabled: true,
      position: percentPosition,
      size: size,
      zIndex: 0,
    };
    
    // Get snap points
    const snapPoints = this.getSnapPoints(tempOverlay as Overlay, otherOverlays);
    
    // Apply snapping
    const snappedPercent = this.applySnapping(percentPosition, snapPoints);
    
    // Convert back to pixels
    return this.percentToPixel(snappedPercent);
  }

  // Check collision between overlays (used by ImageOverlay)
  checkCollision(
    overlay: Overlay,
    newPosition: Position,
    otherOverlays: Overlay[]
  ): boolean {
    const tempOverlay = { ...overlay, position: newPosition };
    const bounds = this.getOverlayBounds(tempOverlay);
    
    for (const other of otherOverlays) {
      if (other.id === overlay.id || !other.enabled) continue;
      
      const otherBounds = this.getOverlayBounds(other);
      
      if (this.boundsIntersect(bounds, otherBounds)) {
        return true;
      }
    }
    
    return false;
  }

  // Handle multi-touch gestures
  startGesture(overlayId: string, touchId: number, startPosition: Position): void {
    if (!this.options.multiTouchSupport) return;
    
    this.activeGestures.set(`${overlayId}-${touchId}`, {
      overlayId,
      touchId,
      startPosition,
      currentPosition: startPosition,
    });
  }

  updateGesture(overlayId: string, touchId: number, currentPosition: Position): void {
    const key = `${overlayId}-${touchId}`;
    const gesture = this.activeGestures.get(key);
    if (gesture) {
      gesture.currentPosition = currentPosition;
    }
  }

  endGesture(overlayId: string, touchId: number): void {
    this.activeGestures.delete(`${overlayId}-${touchId}`);
  }

  // Calculate group positioning
  calculateGroupPosition(overlays: Overlay[], targetPosition: Position): Map<string, Position> {
    const positions = new Map<string, Position>();
    
    if (overlays.length === 0) return positions;
    
    // Find the center of the group
    let sumX = 0, sumY = 0;
    overlays.forEach(overlay => {
      const pixelPos = this.percentToPixel(overlay.position);
      sumX += pixelPos.x + overlay.size.width / 2;
      sumY += pixelPos.y + overlay.size.height / 2;
    });
    
    const groupCenter = {
      x: sumX / overlays.length,
      y: sumY / overlays.length,
    };
    
    const targetPixel = this.percentToPixel(targetPosition);
    const deltaX = targetPixel.x - groupCenter.x;
    const deltaY = targetPixel.y - groupCenter.y;
    
    // Calculate new positions maintaining relative positions
    overlays.forEach(overlay => {
      const currentPixel = this.percentToPixel(overlay.position);
      const newPixel = {
        x: currentPixel.x + deltaX,
        y: currentPixel.y + deltaY,
      };
      positions.set(overlay.id, this.pixelToPercent(newPixel));
    });
    
    return positions;
  }

  // Get visual guides for positioning
  getAlignmentGuides(overlay: Overlay, otherOverlays: Overlay[]): Array<{
    type: 'horizontal' | 'vertical';
    position: number;
    overlayIds: string[];
  }> {
    const guides: Array<any> = [];
    const overlayBounds = this.getOverlayBounds(overlay);
    
    otherOverlays.forEach(other => {
      if (other.id === overlay.id || !other.enabled) return;
      
      const otherBounds = this.getOverlayBounds(other);
      
      // Check horizontal alignment
      if (Math.abs(overlayBounds.top - otherBounds.top) < 5) {
        guides.push({
          type: 'horizontal',
          position: otherBounds.top,
          overlayIds: [overlay.id, other.id],
        });
      }
      
      // Check vertical alignment
      if (Math.abs(overlayBounds.left - otherBounds.left) < 5) {
        guides.push({
          type: 'vertical',
          position: otherBounds.left,
          overlayIds: [overlay.id, other.id],
        });
      }
    });
    
    return guides;
  }

  dispose(): void {
    this.activeGestures.clear();
  }
}

export const positioningEngine = PositioningEngine.getInstance();