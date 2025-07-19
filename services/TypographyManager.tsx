import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FontFamily {
  id: string;
  name: string;
  family: string;
  weights: FontWeight[];
  isSystem: boolean;
  isCustom: boolean;
}

interface FontWeight {
  weight: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  name: string;
  available: boolean;
}

interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic';
  color: string;
  backgroundColor?: string;
  padding?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecorationLine?: 'none' | 'underline' | 'line-through';
  textShadowColor?: string;
  textShadowOffset?: { width: number; height: number };
  textShadowRadius?: number;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  opacity?: number;
}

interface TextEffect {
  id: string;
  name: string;
  apply: (style: TextStyle) => TextStyle;
}

export class TypographyManager {
  private static instance: TypographyManager;
  private fontFamilies: Map<string, FontFamily> = new Map();
  private customFonts: Map<string, any> = new Map();
  private textEffects: Map<string, TextEffect> = new Map();
  private fontCache: Map<string, boolean> = new Map();

  private constructor() {
    this.initializeSystemFonts();
    this.initializeTextEffects();
    this.loadCustomFonts();
  }

  static getInstance(): TypographyManager {
    if (!TypographyManager.instance) {
      TypographyManager.instance = new TypographyManager();
    }
    return TypographyManager.instance;
  }

  private initializeSystemFonts() {
    const systemFonts: FontFamily[] = [
      {
        id: 'system',
        name: 'System',
        family: Platform.OS === 'ios' ? 'System' : 'Roboto',
        isSystem: true,
        isCustom: false,
        weights: [
          { weight: '100', name: 'Thin', available: true },
          { weight: '200', name: 'Extra Light', available: true },
          { weight: '300', name: 'Light', available: true },
          { weight: '400', name: 'Regular', available: true },
          { weight: '500', name: 'Medium', available: true },
          { weight: '600', name: 'Semi Bold', available: true },
          { weight: '700', name: 'Bold', available: true },
          { weight: '800', name: 'Extra Bold', available: true },
          { weight: '900', name: 'Black', available: true },
        ],
      },
      {
        id: 'helvetica',
        name: 'Helvetica',
        family: 'Helvetica',
        isSystem: true,
        isCustom: false,
        weights: [
          { weight: '300', name: 'Light', available: true },
          { weight: '400', name: 'Regular', available: true },
          { weight: '700', name: 'Bold', available: true },
        ],
      },
      {
        id: 'arial',
        name: 'Arial',
        family: 'Arial',
        isSystem: true,
        isCustom: false,
        weights: [
          { weight: '400', name: 'Regular', available: true },
          { weight: '700', name: 'Bold', available: true },
        ],
      },
      {
        id: 'courier',
        name: 'Courier New',
        family: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        isSystem: true,
        isCustom: false,
        weights: [
          { weight: '400', name: 'Regular', available: true },
          { weight: '700', name: 'Bold', available: true },
        ],
      },
      {
        id: 'georgia',
        name: 'Georgia',
        family: 'Georgia',
        isSystem: true,
        isCustom: false,
        weights: [
          { weight: '400', name: 'Regular', available: true },
          { weight: '700', name: 'Bold', available: true },
        ],
      },
      {
        id: 'times',
        name: 'Times New Roman',
        family: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
        isSystem: true,
        isCustom: false,
        weights: [
          { weight: '400', name: 'Regular', available: true },
          { weight: '700', name: 'Bold', available: true },
        ],
      },
    ];

    // Add platform-specific fonts
    if (Platform.OS === 'ios') {
      systemFonts.push(
        {
          id: 'sf-pro',
          name: 'SF Pro Display',
          family: 'SF Pro Display',
          isSystem: true,
          isCustom: false,
          weights: [
            { weight: '100', name: 'Ultralight', available: true },
            { weight: '200', name: 'Thin', available: true },
            { weight: '300', name: 'Light', available: true },
            { weight: '400', name: 'Regular', available: true },
            { weight: '500', name: 'Medium', available: true },
            { weight: '600', name: 'Semibold', available: true },
            { weight: '700', name: 'Bold', available: true },
            { weight: '800', name: 'Heavy', available: true },
            { weight: '900', name: 'Black', available: true },
          ],
        },
        {
          id: 'avenir',
          name: 'Avenir',
          family: 'Avenir',
          isSystem: true,
          isCustom: false,
          weights: [
            { weight: '300', name: 'Light', available: true },
            { weight: '400', name: 'Regular', available: true },
            { weight: '500', name: 'Medium', available: true },
            { weight: '600', name: 'Heavy', available: true },
            { weight: '900', name: 'Black', available: true },
          ],
        }
      );
    }

    systemFonts.forEach(font => {
      this.fontFamilies.set(font.id, font);
    });
  }

  private initializeTextEffects() {
    const effects: TextEffect[] = [
      {
        id: 'neon-glow',
        name: 'Neon Glow',
        apply: (style: TextStyle) => ({
          ...style,
          textShadowColor: style.color || '#ffffff',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }),
      },
      {
        id: 'drop-shadow',
        name: 'Drop Shadow',
        apply: (style: TextStyle) => ({
          ...style,
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 4,
        }),
      },
      {
        id: 'outline',
        name: 'Outline',
        apply: (style: TextStyle) => ({
          ...style,
          textShadowColor: '#000000',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 1,
        }),
      },
      {
        id: 'retro',
        name: 'Retro 3D',
        apply: (style: TextStyle) => ({
          ...style,
          textShadowColor: '#ff0000',
          textShadowOffset: { width: 3, height: 3 },
          textShadowRadius: 0,
        }),
      },
      {
        id: 'soft-glow',
        name: 'Soft Glow',
        apply: (style: TextStyle) => ({
          ...style,
          textShadowColor: style.color || '#ffffff',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 20,
          opacity: 0.9,
        }),
      },
    ];

    effects.forEach(effect => {
      this.textEffects.set(effect.id, effect);
    });
  }

  private async loadCustomFonts() {
    try {
      const savedFonts = await AsyncStorage.getItem('custom_fonts');
      if (savedFonts) {
        const fonts = JSON.parse(savedFonts);
        Object.entries(fonts).forEach(([id, font]) => {
          this.customFonts.set(id, font);
          this.fontFamilies.set(id, font as FontFamily);
        });
      }
    } catch (error) {
      console.error('Failed to load custom fonts:', error);
    }
  }

  private async saveCustomFonts() {
    try {
      const customFonts = Array.from(this.fontFamilies.values()).filter(f => f.isCustom);
      const fontsObj = Object.fromEntries(customFonts.map(f => [f.id, f]));
      await AsyncStorage.setItem('custom_fonts', JSON.stringify(fontsObj));
    } catch (error) {
      console.error('Failed to save custom fonts:', error);
    }
  }

  // Font management
  getFontFamilies(): FontFamily[] {
    return Array.from(this.fontFamilies.values());
  }

  getFontFamily(id: string): FontFamily | undefined {
    return this.fontFamilies.get(id);
  }

  async addCustomFont(fontData: {
    name: string;
    family: string;
    fontFile?: any; // Font file data
  }): Promise<FontFamily | null> {
    try {
      const id = `custom-${Date.now()}`;
      const newFont: FontFamily = {
        id,
        name: fontData.name,
        family: fontData.family,
        isSystem: false,
        isCustom: true,
        weights: [
          { weight: '400', name: 'Regular', available: true },
        ],
      };

      this.fontFamilies.set(id, newFont);
      if (fontData.fontFile) {
        this.customFonts.set(id, fontData.fontFile);
      }

      await this.saveCustomFonts();
      return newFont;
    } catch (error) {
      console.error('Failed to add custom font:', error);
      return null;
    }
  }

  // Text style creation
  createTextStyle(params: Partial<TextStyle>): TextStyle {
    const defaultStyle: TextStyle = {
      fontFamily: 'System',
      fontSize: 24,
      fontWeight: '400',
      fontStyle: 'normal',
      color: '#ffffff',
      backgroundColor: 'transparent',
      padding: 0,
      textAlign: 'left',
      textDecorationLine: 'none',
      letterSpacing: 0,
      opacity: 1,
    };

    return { ...defaultStyle, ...params };
  }

  // Apply text effect
  applyTextEffect(style: TextStyle, effectId: string): TextStyle {
    const effect = this.textEffects.get(effectId);
    if (!effect) return style;
    
    return effect.apply(style);
  }

  getTextEffects(): TextEffect[] {
    return Array.from(this.textEffects.values());
  }

  // Text measurement utilities
  measureTextWidth(text: string, style: TextStyle): number {
    // Simplified calculation - in production, use a proper text measurement library
    const avgCharWidth = style.fontSize * 0.6;
    const fontWeightMultiplier = this.getFontWeightMultiplier(style.fontWeight || '400');
    const letterSpacingTotal = (text.length - 1) * (style.letterSpacing || 0);
    
    return text.length * avgCharWidth * fontWeightMultiplier + letterSpacingTotal;
  }

  private getFontWeightMultiplier(weight: string): number {
    const weightMap: { [key: string]: number } = {
      '100': 0.85,
      '200': 0.9,
      '300': 0.95,
      '400': 1.0,
      '500': 1.05,
      '600': 1.1,
      '700': 1.15,
      '800': 1.2,
      '900': 1.25,
    };
    return weightMap[weight] || 1.0;
  }

  calculateTextHeight(text: string, style: TextStyle, maxWidth: number): number {
    const lineHeight = style.lineHeight || style.fontSize * 1.2;
    const textWidth = this.measureTextWidth(text, style);
    const lines = Math.ceil(textWidth / maxWidth);
    
    return lines * lineHeight + (style.padding || 0) * 2;
  }

  // Auto-size text to fit container
  autoSizeText(text: string, style: TextStyle, containerSize: { width: number; height: number }): TextStyle {
    let fontSize = style.fontSize;
    let adjustedStyle = { ...style };
    
    // Start with the original size and decrease until it fits
    while (fontSize > 8) {
      adjustedStyle.fontSize = fontSize;
      const textWidth = this.measureTextWidth(text, adjustedStyle);
      const textHeight = this.calculateTextHeight(text, adjustedStyle, containerSize.width);
      
      if (textWidth <= containerSize.width && textHeight <= containerSize.height) {
        break;
      }
      
      fontSize -= 2;
    }
    
    return adjustedStyle;
  }

  // Gradient text support (for future implementation)
  createGradientStyle(baseStyle: TextStyle, gradient: {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
  }): TextStyle {
    // In React Native, gradient text requires special handling
    // This is a placeholder for future implementation
    return {
      ...baseStyle,
      // Gradient properties would be handled by a custom component
    };
  }

  // Character encoding support
  supportsEmoji(): boolean {
    return true; // React Native supports emoji by default
  }

  sanitizeText(text: string): string {
    // Remove any potentially problematic characters
    return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
  }

  // Export/Import font settings
  exportFontSettings(): string {
    const settings = {
      customFonts: Array.from(this.customFonts.entries()),
      fontFamilies: Array.from(this.fontFamilies.values()).filter(f => f.isCustom),
    };
    return JSON.stringify(settings, null, 2);
  }

  async importFontSettings(jsonData: string): Promise<boolean> {
    try {
      const settings = JSON.parse(jsonData);
      
      if (settings.customFonts) {
        settings.customFonts.forEach(([id, font]: [string, any]) => {
          this.customFonts.set(id, font);
        });
      }
      
      if (settings.fontFamilies) {
        settings.fontFamilies.forEach((font: FontFamily) => {
          this.fontFamilies.set(font.id, font);
        });
      }
      
      await this.saveCustomFonts();
      return true;
    } catch (error) {
      console.error('Failed to import font settings:', error);
      return false;
    }
  }

  dispose(): void {
    this.fontFamilies.clear();
    this.customFonts.clear();
    this.textEffects.clear();
    this.fontCache.clear();
  }
}

export const typographyManager = TypographyManager.getInstance();