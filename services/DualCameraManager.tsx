import { CameraType, FlashMode } from 'expo-camera';
import { cameraPermissions } from './CameraPermissions';

export enum CameraLayout {
  PIP = 'pip',
  SPLIT = 'split',
  OVERLAY = 'overlay',
  SINGLE_FRONT = 'single_front',
  SINGLE_BACK = 'single_back'
}

export enum ResolutionPreset {
  LOW = '480p',
  MEDIUM = '720p',
  HIGH = '1080p',
  ULTRA = '4K'
}

export interface CameraConfiguration {
  layout: CameraLayout;
  resolution: ResolutionPreset;
  fps: number;
  flashMode: FlashMode;
  enableAudio: boolean;
  zoom: number;
  autoFocus: boolean;
}

export interface CameraDevice {
  id: string;
  type: CameraType;
  isActive: boolean;
  ref: any | null;
  zoom: number;
  flashMode: FlashMode;
}

export interface DualCameraState {
  frontCamera: CameraDevice;
  backCamera: CameraDevice;
  layout: CameraLayout;
  resolution: ResolutionPreset;
  isRecording: boolean;
  isStreaming: boolean;
  isInitialized: boolean;
  error: string | null;
}

class DualCameraManager {
  private static instance: DualCameraManager;
  private state: DualCameraState;
  private configuration: CameraConfiguration;
  private listeners: Array<(state: DualCameraState) => void> = [];

  private constructor() {
    this.state = {
      frontCamera: {
        id: 'front',
        type: 'front' as CameraType,
        isActive: false,
        ref: null,
        zoom: 1.0,
        flashMode: 'off' as FlashMode
      },
      backCamera: {
        id: 'back',
        type: 'back' as CameraType,
        isActive: false,
        ref: null,
        zoom: 1.0,
        flashMode: 'off' as FlashMode
      },
      layout: CameraLayout.SINGLE_BACK,
      resolution: ResolutionPreset.MEDIUM,
      isRecording: false,
      isStreaming: false,
      isInitialized: false,
      error: null
    };

    this.configuration = {
      layout: CameraLayout.SINGLE_BACK,
      resolution: ResolutionPreset.MEDIUM,
      fps: 30,
      flashMode: 'off' as FlashMode,
      enableAudio: true,
      zoom: 1.0,
      autoFocus: true
    };
  }

  public static getInstance(): DualCameraManager {
    if (!DualCameraManager.instance) {
      DualCameraManager.instance = new DualCameraManager();
    }
    return DualCameraManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing dual camera manager...');

      // Check and request permissions
      const hasPermissions = await cameraPermissions.ensurePermissions();
      if (!hasPermissions) {
        this.updateState({ error: 'Camera permissions not granted' });
        return false;
      }

      // Initialize cameras based on layout
      await this.initializeCamerasForLayout(this.state.layout);

      this.updateState({ 
        isInitialized: true, 
        error: null 
      });

      console.log('Dual camera manager initialized successfully');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to initialize dual camera manager:', errorMessage);
      this.updateState({ 
        error: errorMessage,
        isInitialized: false 
      });
      return false;
    }
  }

  async setCameraLayout(layout: CameraLayout): Promise<boolean> {
    try {
      console.log(`Switching to camera layout: ${layout}`);

      // Allow layout changes during streaming but not during file recording
      if (this.state.isRecording && !this.state.isStreaming) {
        throw new Error('Cannot change layout while recording to file');
      }

      await this.initializeCamerasForLayout(layout);
      
      this.updateState({ 
        layout,
        error: null 
      });

      this.configuration.layout = layout;
      console.log(`Camera layout switched to: ${layout}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to set camera layout:', errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
  }

  async setResolution(resolution: ResolutionPreset): Promise<boolean> {
    try {
      console.log(`Setting resolution to: ${resolution}`);

      if (this.state.isRecording) {
        throw new Error('Cannot change resolution while recording');
      }

      this.updateState({ 
        resolution,
        error: null 
      });

      this.configuration.resolution = resolution;
      console.log(`Resolution set to: ${resolution}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to set resolution:', errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
  }

  async setZoom(cameraType: CameraType, zoom: number): Promise<boolean> {
    try {
      zoom = Math.max(0.5, Math.min(5.0, zoom)); // Clamp between 0.5x and 5x

      if (cameraType === 'front') {
        this.updateState({
          frontCamera: { ...this.state.frontCamera, zoom }
        });
      } else {
        this.updateState({
          backCamera: { ...this.state.backCamera, zoom }
        });
      }

      console.log(`${cameraType} camera zoom set to: ${zoom}x`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to set zoom:', errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
  }

  async setFlashMode(cameraType: CameraType, flashMode: FlashMode): Promise<boolean> {
    try {
      if (cameraType === 'front') {
        this.updateState({
          frontCamera: { ...this.state.frontCamera, flashMode }
        });
      } else {
        this.updateState({
          backCamera: { ...this.state.backCamera, flashMode }
        });
      }

      console.log(`${cameraType} camera flash mode set to: ${flashMode}`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to set flash mode:', errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
  }

  async startRecording(isStreaming: boolean = false): Promise<boolean> {
    try {
      if (!this.state.isInitialized) {
        throw new Error('Camera manager not initialized');
      }

      if (this.state.isRecording) {
        console.warn('Recording already in progress');
        return true;
      }

      console.log('Starting camera recording...');

      // In a real implementation, this would start recording on active cameras
      // and handle the video composition based on the current layout

      this.updateState({ 
        isRecording: true,
        isStreaming: isStreaming,
        error: null 
      });

      console.log('Camera recording started');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to start recording:', errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
  }

  async stopRecording(): Promise<boolean> {
    try {
      if (!this.state.isRecording) {
        console.warn('No recording in progress');
        return true;
      }

      console.log('Stopping camera recording...');

      // In a real implementation, this would stop recording on all active cameras

      this.updateState({ 
        isRecording: false,
        isStreaming: false,
        error: null 
      });

      console.log('Camera recording stopped');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to stop recording:', errorMessage);
      this.updateState({ error: errorMessage });
      return false;
    }
  }

  switchCamera(): void {
    if (this.state.layout === CameraLayout.SINGLE_FRONT) {
      this.setCameraLayout(CameraLayout.SINGLE_BACK);
    } else if (this.state.layout === CameraLayout.SINGLE_BACK) {
      this.setCameraLayout(CameraLayout.SINGLE_FRONT);
    }
  }

  getResolutionSettings(resolution: ResolutionPreset): { width: number; height: number; quality: number } {
    switch (resolution) {
      case ResolutionPreset.LOW:
        return { width: 640, height: 480, quality: 0.7 };
      case ResolutionPreset.MEDIUM:
        return { width: 1280, height: 720, quality: 0.8 };
      case ResolutionPreset.HIGH:
        return { width: 1920, height: 1080, quality: 0.9 };
      case ResolutionPreset.ULTRA:
        return { width: 3840, height: 2160, quality: 1.0 };
      default:
        return { width: 1280, height: 720, quality: 0.8 };
    }
  }

  getRecordingOptions(): any {
    return {
      mute: !this.configuration.enableAudio,
      maxDuration: 3600, // 1 hour max
      maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB max
    };
  }

  private async initializeCamerasForLayout(layout: CameraLayout): Promise<void> {
    console.log(`Initializing cameras for layout: ${layout}`);

    // Reset camera states
    const updatedState = { ...this.state };
    
    switch (layout) {
      case CameraLayout.SINGLE_FRONT:
        updatedState.frontCamera = { ...updatedState.frontCamera, isActive: true };
        updatedState.backCamera = { ...updatedState.backCamera, isActive: false };
        break;
      case CameraLayout.SINGLE_BACK:
        updatedState.frontCamera = { ...updatedState.frontCamera, isActive: false };
        updatedState.backCamera = { ...updatedState.backCamera, isActive: true };
        break;
      case CameraLayout.PIP:
      case CameraLayout.SPLIT:
      case CameraLayout.OVERLAY:
        updatedState.frontCamera = { ...updatedState.frontCamera, isActive: true };
        updatedState.backCamera = { ...updatedState.backCamera, isActive: true };
        break;
    }

    this.updateState(updatedState);
  }

  private updateState(updates: Partial<DualCameraState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: DualCameraState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): DualCameraState {
    return { ...this.state };
  }

  getConfiguration(): CameraConfiguration {
    return { ...this.configuration };
  }

  dispose(): void {
    console.log('Disposing dual camera manager...');
    this.stopRecording();
    
    // Reset to initial state and notify listeners before clearing them
    this.state = {
      frontCamera: {
        id: 'front',
        type: 'front' as CameraType,
        isActive: false,
        ref: null,
        zoom: 1.0,
        flashMode: 'off' as FlashMode
      },
      backCamera: {
        id: 'back',
        type: 'back' as CameraType,
        isActive: false,
        ref: null,
        zoom: 1.0,
        flashMode: 'off' as FlashMode
      },
      layout: CameraLayout.SINGLE_BACK,
      resolution: ResolutionPreset.MEDIUM,
      isRecording: false,
      isStreaming: false,
      isInitialized: false,
      error: null
    };
    
    // Notify listeners about the reset state before clearing
    this.notifyListeners();
    this.listeners = [];
  }
}

export const dualCameraManager = DualCameraManager.getInstance();
export default dualCameraManager;