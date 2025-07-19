import { EventEmitter } from 'eventemitter3';
import { TextOverlay, Overlay } from '@/types/overlay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dimensions } from 'react-native';

interface TextOverlayTemplate {
  id: string;
  name: string;
  text: string;
  style: TextOverlay['style'] & {
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through';
    textShadowColor?: string;
    textShadowOffset?: { width: number; height: number };
    textShadowRadius?: number;
    letterSpacing?: number;
    lineHeight?: number;
    transform?: Array<{ rotate: string } | { skewX: string } | { skewY: string }>;
    opacity?: number;
  };
  position: { x: number; y: number };
  animation?: TextAnimation;
}

interface TextAnimation {
  type: 'fadeIn' | 'slideUp' | 'typewriter' | 'pulse' | 'bounce' | 'glow' | 'none';
  duration?: number;
  delay?: number;
  loop?: boolean;
}

interface TextMeasurement {
  width: number;
  height: number;
  lines: number;
}

export class TextOverlayManager extends EventEmitter {
  private static instance: TextOverlayManager;
  private overlays: Map<string, TextOverlay> = new Map();
  private templates: Map<string, TextOverlayTemplate> = new Map();
  private activeOverlayId: string | null = null;
  private screenDimensions: { width: number; height: number };
  private fontCache: Map<string, boolean> = new Map();

  private constructor() {
    super();
    const { width, height } = Dimensions.get('window');
    this.screenDimensions = { width, height };
    this.initializeDefaultTemplates();
    this.loadPersistedTemplates();
  }

  static getInstance(): TextOverlayManager {
    if (!TextOverlayManager.instance) {
      TextOverlayManager.instance = new TextOverlayManager();
    }
    return TextOverlayManager.instance;
  }

  private initializeDefaultTemplates() {
    const defaultTemplates: TextOverlayTemplate[] = [
      {
        id: 'stream-title',
        name: 'Stream Title',
        text: 'Live Stream',
        style: {
          fontSize: 32,
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: 12,
          fontFamily: 'System',
          textShadowColor: '#000000',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        },
        position: { x: 5, y: 5 },
        animation: { type: 'fadeIn', duration: 1000 },
      },
      {
        id: 'watermark',
        name: 'Watermark',
        text: '© 2025 StreamCast',
        style: {
          fontSize: 14,
          color: '#ffffff',
          opacity: 0.7,
          fontFamily: 'System',
          backgroundColor: 'transparent',
        },
        position: { x: 80, y: 90 },
        animation: { type: 'none' },
      },
      {
        id: 'social-media',
        name: 'Social Media',
        text: '@YourHandle',
        style: {
          fontSize: 18,
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: 'rgba(126, 211, 33, 0.8)',
          padding: 8,
          fontFamily: 'System',
        },
        position: { x: 5, y: 85 },
        animation: { type: 'slideUp', duration: 800 },
      },
      {
        id: 'live-badge',
        name: 'Live Badge',
        text: 'LIVE',
        style: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#ffffff',
          backgroundColor: '#ef4444',
          padding: 6,
          fontFamily: 'System',
        },
        position: { x: 85, y: 5 },
        animation: { type: 'pulse', duration: 2000, loop: true },
      },
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  private async loadPersistedTemplates() {
    try {
      const savedTemplates = await AsyncStorage.getItem('text_overlay_templates');
      if (savedTemplates) {
        const templates = JSON.parse(savedTemplates);
        Object.entries(templates).forEach(([id, template]) => {
          this.templates.set(id, template as TextOverlayTemplate);
        });
      }
    } catch (error) {
      console.error('Failed to load persisted templates:', error);
    }
  }

  private async saveTemplates() {
    try {
      const templatesObj = Object.fromEntries(this.templates);
      await AsyncStorage.setItem('text_overlay_templates', JSON.stringify(templatesObj));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }

  createTextOverlay(params: {
    text: string;
    position?: { x: number; y: number };
    style?: Partial<TextOverlay['style']>;
    templateId?: string;
  }): TextOverlay {
    const id = Date.now().toString();
    let baseOverlay: Partial<TextOverlay> = {
      id,
      type: 'text',
      name: `Text ${this.overlays.size + 1}`,
      enabled: true,
      position: params.position || { x: 10, y: 10 },
      size: { width: 200, height: 50 },
      zIndex: this.overlays.size,
      content: params.text,
    };

    if (params.templateId && this.templates.has(params.templateId)) {
      const template = this.templates.get(params.templateId)!;
      baseOverlay = {
        ...baseOverlay,
        content: template.text,
        style: { ...template.style },
        position: { ...template.position },
      };
    }

    const overlay: TextOverlay = {
      ...baseOverlay,
      style: {
        color: '#ffffff',
        fontSize: 24,
        fontFamily: 'System',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
        ...params.style,
      },
    } as TextOverlay;

    this.overlays.set(id, overlay);
    this.emit('overlayCreated', overlay);
    return overlay;
  }

  updateTextOverlay(id: string, updates: Partial<TextOverlay>): boolean {
    const overlay = this.overlays.get(id);
    if (!overlay) return false;

    const updatedOverlay = { ...overlay, ...updates };
    this.overlays.set(id, updatedOverlay);
    this.emit('overlayUpdated', updatedOverlay);
    return true;
  }

  deleteTextOverlay(id: string): boolean {
    const overlay = this.overlays.get(id);
    if (!overlay) return false;

    this.overlays.delete(id);
    if (this.activeOverlayId === id) {
      this.activeOverlayId = null;
    }
    this.emit('overlayDeleted', id);
    return true;
  }

  getTextOverlay(id: string): TextOverlay | undefined {
    return this.overlays.get(id);
  }

  getAllTextOverlays(): TextOverlay[] {
    return Array.from(this.overlays.values());
  }

  setActiveOverlay(id: string | null): void {
    this.activeOverlayId = id;
    this.emit('activeOverlayChanged', id);
  }

  getActiveOverlay(): TextOverlay | null {
    return this.activeOverlayId ? this.overlays.get(this.activeOverlayId) || null : null;
  }

  // Text measurement for auto-sizing
  measureText(text: string, style: TextOverlay['style']): TextMeasurement {
    // Simplified measurement - in production, use a proper text measurement library
    const avgCharWidth = style.fontSize * 0.6;
    const lineHeight = style.fontSize * 1.2;
    const maxWidth = this.screenDimensions.width * 0.8;
    
    const words = text.split(' ');
    let lines = 1;
    let currentLineWidth = 0;
    let maxLineWidth = 0;

    words.forEach(word => {
      const wordWidth = word.length * avgCharWidth;
      if (currentLineWidth + wordWidth > maxWidth) {
        lines++;
        currentLineWidth = wordWidth;
      } else {
        currentLineWidth += wordWidth + avgCharWidth; // Space between words
      }
      maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
    });

    return {
      width: Math.min(maxLineWidth, maxWidth),
      height: lines * lineHeight + (style.padding || 0) * 2,
      lines,
    };
  }

  // Template management
  createTemplate(template: Omit<TextOverlayTemplate, 'id'>): TextOverlayTemplate {
    const id = `custom-${Date.now()}`;
    const newTemplate = { ...template, id };
    this.templates.set(id, newTemplate);
    this.saveTemplates();
    this.emit('templateCreated', newTemplate);
    return newTemplate;
  }

  deleteTemplate(id: string): boolean {
    if (id.startsWith('stream-') || id.startsWith('watermark') || id.startsWith('social-') || id.startsWith('live-')) {
      return false; // Can't delete default templates
    }
    const deleted = this.templates.delete(id);
    if (deleted) {
      this.saveTemplates();
      this.emit('templateDeleted', id);
    }
    return deleted;
  }

  getTemplates(): TextOverlayTemplate[] {
    return Array.from(this.templates.values());
  }

  // Batch operations
  enableAllOverlays(): void {
    this.overlays.forEach(overlay => {
      overlay.enabled = true;
    });
    this.emit('overlaysEnabledChanged');
  }

  disableAllOverlays(): void {
    this.overlays.forEach(overlay => {
      overlay.enabled = false;
    });
    this.emit('overlaysEnabledChanged');
  }

  clearAllOverlays(): void {
    this.overlays.clear();
    this.activeOverlayId = null;
    this.emit('overlaysCleared');
  }

  // Z-index management
  reorderOverlay(id: string, newZIndex: number): void {
    const overlay = this.overlays.get(id);
    if (!overlay) return;

    const overlaysArray = Array.from(this.overlays.values());
    overlaysArray.sort((a, b) => a.zIndex - b.zIndex);

    // Remove the overlay from its current position
    const currentIndex = overlaysArray.findIndex(o => o.id === id);
    if (currentIndex === -1) return;
    
    overlaysArray.splice(currentIndex, 1);
    
    // Insert at new position
    overlaysArray.splice(newZIndex, 0, overlay);
    
    // Update z-indices
    overlaysArray.forEach((o, index) => {
      o.zIndex = index;
      this.overlays.set(o.id, o);
    });

    this.emit('overlaysReordered');
  }

  // Export/Import functionality
  exportOverlays(): string {
    const data = {
      overlays: Array.from(this.overlays.values()),
      templates: Array.from(this.templates.values()).filter(t => t.id.startsWith('custom-')),
    };
    return JSON.stringify(data, null, 2);
  }

  importOverlays(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.overlays) {
        data.overlays.forEach((overlay: TextOverlay) => {
          this.overlays.set(overlay.id, overlay);
        });
      }
      if (data.templates) {
        data.templates.forEach((template: TextOverlayTemplate) => {
          this.templates.set(template.id, template);
        });
        this.saveTemplates();
      }
      this.emit('overlaysImported');
      return true;
    } catch (error) {
      console.error('Failed to import overlays:', error);
      return false;
    }
  }

  // Performance optimization
  getVisibleOverlays(): TextOverlay[] {
    return Array.from(this.overlays.values()).filter(overlay => overlay.enabled);
  }

  dispose(): void {
    this.removeAllListeners();
    this.overlays.clear();
    this.templates.clear();
    this.activeOverlayId = null;
  }
}

export const textOverlayManager = TextOverlayManager.getInstance();