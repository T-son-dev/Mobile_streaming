import AsyncStorage from '@react-native-async-storage/async-storage';
import { Overlay, TextOverlay, ImageOverlay, WebOverlay, VideoOverlay } from '@/types/overlay';

const STORAGE_KEY = 'overlays';

type EventListener = (...args: any[]) => void;

export class OverlayService {
  private overlays: Map<string, Overlay> = new Map();
  private static instance: OverlayService | null = null;
  private listeners: Map<string, EventListener[]> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    // Don't call async methods in constructor
  }

  static getInstance(): OverlayService {
    if (!OverlayService.instance) {
      OverlayService.instance = new OverlayService();
    }
    return OverlayService.instance;
  }

  // Initialize the service (call this before using)
  async initialize(): Promise<void> {
    if (!this.isInitialized) {
      await this.loadOverlays();
      this.isInitialized = true;
    }
  }

  // Event emitter methods
  on(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  off(event: string, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Load overlays from storage
  private async loadOverlays(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const overlayArray = JSON.parse(stored) as Overlay[];
        overlayArray.forEach(overlay => {
          this.overlays.set(overlay.id, overlay);
        });
        // Don't emit during initialization to avoid recursion
      }
    } catch (error) {
      console.error('Failed to load overlays:', error);
    }
  }

  // Save overlays to storage
  private async saveOverlays(): Promise<void> {
    try {
      const overlayArray = Array.from(this.overlays.values());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(overlayArray));
    } catch (error) {
      console.error('Failed to save overlays:', error);
    }
  }

  // Get all overlays
  getAllOverlays(): Overlay[] {
    return Array.from(this.overlays.values()).sort((a, b) => a.zIndex - b.zIndex);
  }

  // Get overlays by type
  getOverlaysByType<T extends Overlay>(type: T['type']): T[] {
    return Array.from(this.overlays.values())
      .filter(overlay => overlay.type === type) as T[];
  }

  // Get enabled overlays
  getEnabledOverlays(): Overlay[] {
    return Array.from(this.overlays.values())
      .filter(overlay => overlay.enabled)
      .sort((a, b) => a.zIndex - b.zIndex);
  }

  // Get a specific overlay
  getOverlay(id: string): Overlay | undefined {
    return this.overlays.get(id);
  }

  // Create overlay
  createOverlay(overlay: Omit<Overlay, 'id'>): Overlay {
    const newOverlay: Overlay = {
      ...overlay,
      id: Date.now().toString(),
    } as Overlay;

    this.overlays.set(newOverlay.id, newOverlay);
    this.saveOverlays();
    this.emit('overlayCreated', newOverlay);
    return newOverlay;
  }

  // Update overlay
  updateOverlay(id: string, updates: Partial<Overlay>): Overlay | null {
    const overlay = this.overlays.get(id);
    if (!overlay) return null;

    const updatedOverlay = { ...overlay, ...updates } as Overlay;
    this.overlays.set(id, updatedOverlay);
    this.saveOverlays();
    this.emit('overlayUpdated', updatedOverlay);
    return updatedOverlay;
  }

  // Delete overlay
  deleteOverlay(id: string): boolean {
    const overlay = this.overlays.get(id);
    if (!overlay) return false;

    this.overlays.delete(id);
    this.saveOverlays();
    this.emit('overlayDeleted', id);
    return true;
  }

  // Reorder overlays (update z-index)
  reorderOverlays(overlayIds: string[]): void {
    overlayIds.forEach((id, index) => {
      const overlay = this.overlays.get(id);
      if (overlay) {
        overlay.zIndex = index;
        this.overlays.set(id, overlay);
      }
    });
    this.saveOverlays();
    this.emit('overlaysReordered', this.getAllOverlays());
  }

  // Enable/disable overlay
  toggleOverlay(id: string): Overlay | null {
    const overlay = this.overlays.get(id);
    if (!overlay) return null;

    overlay.enabled = !overlay.enabled;
    this.overlays.set(id, overlay);
    this.saveOverlays();
    this.emit('overlayUpdated', overlay);
    return overlay;
  }

  // Enable all overlays
  enableAllOverlays(): void {
    this.overlays.forEach(overlay => {
      overlay.enabled = true;
    });
    this.saveOverlays();
    this.emit('overlaysUpdated', this.getAllOverlays());
  }

  // Disable all overlays
  disableAllOverlays(): void {
    this.overlays.forEach(overlay => {
      overlay.enabled = false;
    });
    this.saveOverlays();
    this.emit('overlaysUpdated', this.getAllOverlays());
  }

  // Clear all overlays
  clearAllOverlays(): void {
    this.overlays.clear();
    this.saveOverlays();
    this.emit('overlaysCleared');
  }

  // Import overlays from array
  importOverlays(overlays: Overlay[]): void {
    overlays.forEach(overlay => {
      this.overlays.set(overlay.id, overlay);
    });
    this.saveOverlays();
    this.emit('overlaysImported', this.getAllOverlays());
  }

  // Export overlays to array
  exportOverlays(): Overlay[] {
    return this.getAllOverlays();
  }

  // Find overlays at position
  findOverlaysAtPosition(x: number, y: number): Overlay[] {
    return this.getEnabledOverlays().filter(overlay => {
      const left = overlay.position.x;
      const top = overlay.position.y;
      const right = left + (overlay.size.width / 100); // Convert to percentage
      const bottom = top + (overlay.size.height / 100);

      return x >= left && x <= right && y >= top && y <= bottom;
    });
  }

  // Check for collision
  checkCollision(overlay: Overlay, newPosition: { x: number; y: number }): boolean {
    const otherOverlays = this.getEnabledOverlays().filter(o => o.id !== overlay.id);
    
    for (const other of otherOverlays) {
      const testBounds = {
        left: newPosition.x,
        top: newPosition.y,
        right: newPosition.x + (overlay.size.width / 100),
        bottom: newPosition.y + (overlay.size.height / 100),
      };

      const otherBounds = {
        left: other.position.x,
        top: other.position.y,
        right: other.position.x + (other.size.width / 100),
        bottom: other.position.y + (other.size.height / 100),
      };

      if (!(
        testBounds.right < otherBounds.left ||
        testBounds.left > otherBounds.right ||
        testBounds.bottom < otherBounds.top ||
        testBounds.top > otherBounds.bottom
      )) {
        return true;
      }
    }

    return false;
  }
}

// Export singleton instance
export const overlayService = OverlayService.getInstance();