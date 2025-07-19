export type OverlayType = 'text' | 'image' | 'web' | 'video';

export interface BaseOverlay {
  id: string;
  type: OverlayType;
  name: string;
  enabled: boolean;
  position: {
    x: number; // percentage 0-100
    y: number; // percentage 0-100
  };
  size: {
    width: number; // percentage or pixels
    height: number; // percentage or pixels
  };
  zIndex: number;
}

export interface TextOverlay extends BaseOverlay {
  type: 'text';
  content: string;
  style: {
    color: string;
    fontSize: number;
    fontFamily: string;
    backgroundColor?: string;
    padding?: number;
    fontWeight?: string;
    fontStyle?: 'normal' | 'italic';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textDecorationLine?: 'none' | 'underline' | 'line-through';
    textShadowColor?: string;
    textShadowOffset?: { width: number; height: number };
    textShadowRadius?: number;
    letterSpacing?: number;
    lineHeight?: number;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    opacity?: number;
    animation?: {
      type: 'fadeIn' | 'slideUp' | 'typewriter' | 'pulse' | 'bounce' | 'glow' | 'none';
      duration?: number;
      delay?: number;
      loop?: boolean;
    };
  };
}

export interface ImageOverlay extends BaseOverlay {
  type: 'image';
  url: string;
  opacity?: number;
}

export interface WebOverlay extends BaseOverlay {
  type: 'web';
  url: string;
  refreshInterval?: number; // in seconds
}

export interface VideoOverlay extends BaseOverlay {
  type: 'video';
  url: string;
  loop?: boolean;
  muted?: boolean;
}

export type Overlay = TextOverlay | ImageOverlay | WebOverlay | VideoOverlay;

export interface OverlayEditorState {
  overlays: Overlay[];
  selectedOverlayId: string | null;
  previewMode: boolean;
}