import AsyncStorage from '@react-native-async-storage/async-storage';
import { dualCameraManager, ResolutionPreset } from './DualCameraManager';
import { videoComposer } from './VideoComposer';

export interface ResolutionProfile {
  preset: ResolutionPreset;
  width: number;
  height: number;
  bitrate: number;
  fps: number;
  quality: number;
  fileSize: number; // MB per minute
}

export interface DeviceCapabilities {
  maxResolution: ResolutionPreset;
  supportedResolutions: ResolutionPreset[];
  hardwareAcceleration: boolean;
  dualCameraSupport: boolean;
  maxFps: number;
}

export interface ResolutionSettings {
  currentResolution: ResolutionPreset;
  autoQuality: boolean;
  networkAdaptive: boolean;
  preferredResolution: ResolutionPreset;
  batteryOptimization: boolean;
}

class ResolutionManager {
  private static instance: ResolutionManager;
  private currentSettings: ResolutionSettings | null = null;
  private deviceCapabilities: DeviceCapabilities | null = null;
  private networkSpeed = 0;
  private batteryLevel = 100;
  private isMonitoring = false;
  private listeners: Array<(settings: ResolutionSettings) => void> = [];

  private constructor() {}

  public static getInstance(): ResolutionManager {
    if (!ResolutionManager.instance) {
      ResolutionManager.instance = new ResolutionManager();
    }
    return ResolutionManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing resolution manager...');

      // Detect device capabilities
      await this.detectDeviceCapabilities();

      // Load saved settings
      await this.loadSettings();

      // Set initial resolution
      if (this.currentSettings) {
        await this.applyResolution(this.currentSettings.currentResolution);
      }

      console.log('Resolution manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize resolution manager:', error);
      return false;
    }
  }

  async setResolution(preset: ResolutionPreset, saveSettings = true): Promise<boolean> {
    try {
      console.log(`Setting resolution to: ${preset}`);

      if (!this.deviceCapabilities?.supportedResolutions.includes(preset)) {
        throw new Error(`Resolution ${preset} not supported on this device`);
      }

      // Apply resolution to camera manager
      const cameraSuccess = await dualCameraManager.setResolution(preset);
      if (!cameraSuccess) {
        throw new Error('Failed to set camera resolution');
      }

      // Apply resolution to video composer
      const composerSuccess = await videoComposer.updateResolution(preset);
      if (!composerSuccess) {
        throw new Error('Failed to set video composer resolution');
      }

      // Update current settings
      if (this.currentSettings) {
        this.currentSettings.currentResolution = preset;
        
        if (saveSettings) {
          await this.saveSettings();
        }
        
        this.notifyListeners();
      }

      console.log(`Resolution set to: ${preset}`);
      return true;
    } catch (error) {
      console.error('Failed to set resolution:', error);
      return false;
    }
  }

  async setAutoQuality(enabled: boolean): Promise<void> {
    if (this.currentSettings) {
      this.currentSettings.autoQuality = enabled;
      await this.saveSettings();
      this.notifyListeners();

      if (enabled) {
        this.startAdaptiveMonitoring();
      } else {
        this.stopAdaptiveMonitoring();
      }
    }
  }

  async setBatteryOptimization(enabled: boolean): Promise<void> {
    if (this.currentSettings) {
      this.currentSettings.batteryOptimization = enabled;
      await this.saveSettings();
      this.notifyListeners();

      if (enabled) {
        await this.optimizeForBattery();
      }
    }
  }

  async setNetworkAdaptive(enabled: boolean): Promise<void> {
    if (this.currentSettings) {
      this.currentSettings.networkAdaptive = enabled;
      await this.saveSettings();
      this.notifyListeners();
    }
  }

  getResolutionProfile(preset: ResolutionPreset): ResolutionProfile {
    switch (preset) {
      case ResolutionPreset.LOW:
        return {
          preset,
          width: 640,
          height: 480,
          bitrate: 1500,
          fps: 30,
          quality: 0.7,
          fileSize: 11
        };
      case ResolutionPreset.MEDIUM:
        return {
          preset,
          width: 1280,
          height: 720,
          bitrate: 3000,
          fps: 30,
          quality: 0.8,
          fileSize: 22
        };
      case ResolutionPreset.HIGH:
        return {
          preset,
          width: 1920,
          height: 1080,
          bitrate: 6000,
          fps: 60,
          quality: 0.9,
          fileSize: 45
        };
      case ResolutionPreset.ULTRA:
        return {
          preset,
          width: 3840,
          height: 2160,
          bitrate: 12000,
          fps: 60,
          quality: 1.0,
          fileSize: 90
        };
      default:
        return this.getResolutionProfile(ResolutionPreset.MEDIUM);
    }
  }

  getOptimalResolution(networkSpeed: number, batteryLevel: number): ResolutionPreset {
    if (!this.deviceCapabilities) {
      return ResolutionPreset.MEDIUM;
    }

    // Battery optimization
    if (this.currentSettings?.batteryOptimization && batteryLevel < 20) {
      return ResolutionPreset.LOW;
    }

    if (batteryLevel < 50) {
      // Limit to medium quality when battery is low
      const maxResolution = ResolutionPreset.MEDIUM;
      return this.getBestResolutionForNetwork(networkSpeed, maxResolution);
    }

    // Network-based optimization
    return this.getBestResolutionForNetwork(networkSpeed);
  }

  private getBestResolutionForNetwork(
    networkSpeed: number, 
    maxResolution?: ResolutionPreset
  ): ResolutionPreset {
    const supportedResolutions = this.deviceCapabilities?.supportedResolutions || [];
    
    // Network speed thresholds (kbps)
    if (networkSpeed >= 8000 && supportedResolutions.includes(ResolutionPreset.ULTRA)) {
      return maxResolution === ResolutionPreset.MEDIUM ? ResolutionPreset.MEDIUM : ResolutionPreset.ULTRA;
    }
    if (networkSpeed >= 4000 && supportedResolutions.includes(ResolutionPreset.HIGH)) {
      return maxResolution === ResolutionPreset.MEDIUM ? ResolutionPreset.MEDIUM : ResolutionPreset.HIGH;
    }
    if (networkSpeed >= 2000 && supportedResolutions.includes(ResolutionPreset.MEDIUM)) {
      return ResolutionPreset.MEDIUM;
    }
    
    return ResolutionPreset.LOW;
  }

  async updateNetworkSpeed(speed: number): Promise<void> {
    this.networkSpeed = speed;
    
    if (this.currentSettings?.autoQuality && this.currentSettings?.networkAdaptive) {
      const optimalResolution = this.getOptimalResolution(speed, this.batteryLevel);
      
      if (optimalResolution !== this.currentSettings.currentResolution) {
        console.log(`Auto-adapting resolution from ${this.currentSettings.currentResolution} to ${optimalResolution} due to network speed: ${speed}kbps`);
        await this.setResolution(optimalResolution, false); // Don't save auto-adaptations
      }
    }
  }

  async updateBatteryLevel(level: number): Promise<void> {
    this.batteryLevel = level;
    
    if (this.currentSettings?.autoQuality && this.currentSettings?.batteryOptimization) {
      const optimalResolution = this.getOptimalResolution(this.networkSpeed, level);
      
      if (optimalResolution !== this.currentSettings.currentResolution) {
        console.log(`Auto-adapting resolution from ${this.currentSettings.currentResolution} to ${optimalResolution} due to battery level: ${level}%`);
        await this.setResolution(optimalResolution, false);
      }
    }
  }

  private async detectDeviceCapabilities(): Promise<void> {
    // In a real implementation, this would detect actual device capabilities
    // For now, we'll simulate based on common device profiles
    
    this.deviceCapabilities = {
      maxResolution: ResolutionPreset.ULTRA,
      supportedResolutions: [
        ResolutionPreset.LOW,
        ResolutionPreset.MEDIUM,
        ResolutionPreset.HIGH,
        ResolutionPreset.ULTRA
      ],
      hardwareAcceleration: true,
      dualCameraSupport: true,
      maxFps: 60
    };
    
    console.log('Device capabilities detected:', this.deviceCapabilities);
  }

  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('resolution_settings');
      if (saved) {
        this.currentSettings = JSON.parse(saved);
        console.log('Resolution settings loaded:', this.currentSettings);
      } else {
        // Create default settings
        this.currentSettings = {
          currentResolution: ResolutionPreset.MEDIUM,
          autoQuality: true,
          networkAdaptive: true,
          preferredResolution: ResolutionPreset.MEDIUM,
          batteryOptimization: true
        };
        await this.saveSettings();
      }
    } catch (error) {
      console.error('Failed to load resolution settings:', error);
      // Fallback to defaults
      this.currentSettings = {
        currentResolution: ResolutionPreset.MEDIUM,
        autoQuality: false,
        networkAdaptive: false,
        preferredResolution: ResolutionPreset.MEDIUM,
        batteryOptimization: false
      };
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.currentSettings) {
        await AsyncStorage.setItem('resolution_settings', JSON.stringify(this.currentSettings));
        console.log('Resolution settings saved');
      }
    } catch (error) {
      console.error('Failed to save resolution settings:', error);
    }
  }

  private async applyResolution(preset: ResolutionPreset): Promise<void> {
    await dualCameraManager.setResolution(preset);
    await videoComposer.updateResolution(preset);
  }

  private startAdaptiveMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting adaptive resolution monitoring');
    
    // In a real implementation, this would monitor network and battery
    // For now, we'll simulate monitoring
  }

  private stopAdaptiveMonitoring(): void {
    this.isMonitoring = false;
    console.log('Stopping adaptive resolution monitoring');
  }

  private async optimizeForBattery(): Promise<void> {
    if (this.batteryLevel < 30 && this.currentSettings) {
      const lowPowerResolution = ResolutionPreset.LOW;
      if (this.currentSettings.currentResolution !== lowPowerResolution) {
        console.log('Optimizing resolution for battery conservation');
        await this.setResolution(lowPowerResolution, false);
      }
    }
  }

  private notifyListeners(): void {
    if (this.currentSettings) {
      this.listeners.forEach(listener => listener(this.currentSettings!));
    }
  }

  subscribe(listener: (settings: ResolutionSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getCurrentSettings(): ResolutionSettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null;
  }

  getDeviceCapabilities(): DeviceCapabilities | null {
    return this.deviceCapabilities ? { ...this.deviceCapabilities } : null;
  }

  getNetworkSpeed(): number {
    return this.networkSpeed;
  }

  getBatteryLevel(): number {
    return this.batteryLevel;
  }

  dispose(): void {
    console.log('Disposing resolution manager...');
    this.stopAdaptiveMonitoring();
    this.listeners = [];
  }
}

export const resolutionManager = ResolutionManager.getInstance();
export default resolutionManager;