import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraType, FlashMode } from 'expo-camera';
import { CameraLayout, ResolutionPreset } from './DualCameraManager';

export interface CameraSettings {
  // Layout Preferences
  preferredLayout: CameraLayout;
  lastUsedLayout: CameraLayout;
  layoutSwitchHistory: CameraLayout[];
  
  // Camera Hardware Settings
  frontCamera: {
    zoom: number;
    flashMode: FlashMode;
    autoFocus: boolean;
    resolution: ResolutionPreset;
    whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'fluorescent' | 'incandescent';
    exposure: number; // -2 to +2
  };
  
  backCamera: {
    zoom: number;
    flashMode: FlashMode;
    autoFocus: boolean;
    resolution: ResolutionPreset;
    whiteBalance: 'auto' | 'sunny' | 'cloudy' | 'fluorescent' | 'incandescent';
    exposure: number; // -2 to +2
  };
  
  // Quality Preferences
  qualitySettings: {
    preferredResolution: ResolutionPreset;
    autoQualityEnabled: boolean;
    batteryOptimizationEnabled: boolean;
    networkAdaptiveEnabled: boolean;
    maxResolutionOnBattery: ResolutionPreset;
    lowBatteryThreshold: number; // percentage
  };
  
  // Advanced Settings
  advanced: {
    stabilization: boolean;
    noiseReduction: boolean;
    hdr: boolean;
    nightMode: boolean;
    portraitMode: boolean;
    videoStabilization: boolean;
  };
  
  // User Preferences
  preferences: {
    quickSwitchEnabled: boolean;
    gestureControlsEnabled: boolean;
    voiceControlsEnabled: boolean;
    saveToGallery: boolean;
    watermarkEnabled: boolean;
    gridLinesEnabled: boolean;
  };
  
  // Streaming Integration
  streaming: {
    autoStartPerformanceMonitoring: boolean;
    adaptiveQualityEnabled: boolean;
    lowLatencyMode: boolean;
    bufferSize: 'small' | 'medium' | 'large';
    maxBitrate: number;
    targetFps: number;
  };
  
  // Usage Statistics
  usage: {
    totalStreamingTime: number; // seconds
    layoutUsageCount: Record<CameraLayout, number>;
    averageSessionDuration: number; // seconds
    favoriteResolution: ResolutionPreset;
    lastUpdated: number;
    createdAt: number;
  };
}

interface CameraProfile {
  id: string;
  name: string;
  description: string;
  settings: Partial<CameraSettings>;
  isDefault: boolean;
  createdAt: number;
  lastUsed: number;
}

class CameraSettingsManager {
  private static instance: CameraSettingsManager;
  private currentSettings: CameraSettings | null = null;
  private profiles: CameraProfile[] = [];
  private listeners: Array<(settings: CameraSettings) => void> = [];
  private readonly STORAGE_KEYS = {
    SETTINGS: 'camera_settings',
    PROFILES: 'camera_profiles',
    CURRENT_PROFILE: 'current_camera_profile'
  };

  private constructor() {}

  public static getInstance(): CameraSettingsManager {
    if (!CameraSettingsManager.instance) {
      CameraSettingsManager.instance = new CameraSettingsManager();
    }
    return CameraSettingsManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing camera settings manager...');
      
      // Load saved settings
      await this.loadSettings();
      
      // Load saved profiles
      await this.loadProfiles();
      
      // Create default settings if none exist
      if (!this.currentSettings) {
        this.currentSettings = this.createDefaultSettings();
        await this.saveSettings();
      }
      
      console.log('Camera settings manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize camera settings manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): CameraSettings {
    const now = Date.now();
    
    return {
      preferredLayout: CameraLayout.SINGLE_BACK,
      lastUsedLayout: CameraLayout.SINGLE_BACK,
      layoutSwitchHistory: [CameraLayout.SINGLE_BACK],
      
      frontCamera: {
        zoom: 1.0,
        flashMode: 'off' as FlashMode,
        autoFocus: true,
        resolution: ResolutionPreset.MEDIUM,
        whiteBalance: 'auto',
        exposure: 0
      },
      
      backCamera: {
        zoom: 1.0,
        flashMode: 'off' as FlashMode,
        autoFocus: true,
        resolution: ResolutionPreset.MEDIUM,
        whiteBalance: 'auto',
        exposure: 0
      },
      
      qualitySettings: {
        preferredResolution: ResolutionPreset.MEDIUM,
        autoQualityEnabled: true,
        batteryOptimizationEnabled: true,
        networkAdaptiveEnabled: true,
        maxResolutionOnBattery: ResolutionPreset.MEDIUM,
        lowBatteryThreshold: 20
      },
      
      advanced: {
        stabilization: true,
        noiseReduction: true,
        hdr: false,
        nightMode: false,
        portraitMode: false,
        videoStabilization: true
      },
      
      preferences: {
        quickSwitchEnabled: true,
        gestureControlsEnabled: false,
        voiceControlsEnabled: false,
        saveToGallery: false,
        watermarkEnabled: false,
        gridLinesEnabled: false
      },
      
      streaming: {
        autoStartPerformanceMonitoring: true,
        adaptiveQualityEnabled: true,
        lowLatencyMode: false,
        bufferSize: 'medium',
        maxBitrate: 6000,
        targetFps: 30
      },
      
      usage: {
        totalStreamingTime: 0,
        layoutUsageCount: {
          [CameraLayout.SINGLE_FRONT]: 0,
          [CameraLayout.SINGLE_BACK]: 0,
          [CameraLayout.PIP]: 0,
          [CameraLayout.SPLIT]: 0,
          [CameraLayout.OVERLAY]: 0
        },
        averageSessionDuration: 0,
        favoriteResolution: ResolutionPreset.MEDIUM,
        lastUpdated: now,
        createdAt: now
      }
    };
  }

  async updateCameraSettings(cameraType: CameraType, updates: Partial<CameraSettings['frontCamera']>): Promise<void> {
    if (!this.currentSettings) return;

    try {
      if (cameraType === 'front') {
        this.currentSettings.frontCamera = { ...this.currentSettings.frontCamera, ...updates };
      } else {
        this.currentSettings.backCamera = { ...this.currentSettings.backCamera, ...updates };
      }

      this.currentSettings.usage.lastUpdated = Date.now();
      await this.saveSettings();
      this.notifyListeners();

      console.log(`${cameraType} camera settings updated:`, updates);
    } catch (error) {
      console.error('Failed to update camera settings:', error);
    }
  }

  async updateLayoutPreference(layout: CameraLayout): Promise<void> {
    if (!this.currentSettings) return;

    try {
      // Update layout history
      const history = [...this.currentSettings.layoutSwitchHistory];
      history.push(layout);
      if (history.length > 10) {
        history.shift(); // Keep only last 10 switches
      }

      // Update usage count
      this.currentSettings.usage.layoutUsageCount[layout]++;

      // Update settings
      this.currentSettings.lastUsedLayout = layout;
      this.currentSettings.layoutSwitchHistory = history;
      this.currentSettings.usage.lastUpdated = Date.now();

      await this.saveSettings();
      this.notifyListeners();

      console.log(`Layout preference updated to: ${layout}`);
    } catch (error) {
      console.error('Failed to update layout preference:', error);
    }
  }

  async updateQualitySettings(updates: Partial<CameraSettings['qualitySettings']>): Promise<void> {
    if (!this.currentSettings) return;

    try {
      this.currentSettings.qualitySettings = { 
        ...this.currentSettings.qualitySettings, 
        ...updates 
      };
      this.currentSettings.usage.lastUpdated = Date.now();

      await this.saveSettings();
      this.notifyListeners();

      console.log('Quality settings updated:', updates);
    } catch (error) {
      console.error('Failed to update quality settings:', error);
    }
  }

  async updateAdvancedSettings(updates: Partial<CameraSettings['advanced']>): Promise<void> {
    if (!this.currentSettings) return;

    try {
      this.currentSettings.advanced = { 
        ...this.currentSettings.advanced, 
        ...updates 
      };
      this.currentSettings.usage.lastUpdated = Date.now();

      await this.saveSettings();
      this.notifyListeners();

      console.log('Advanced settings updated:', updates);
    } catch (error) {
      console.error('Failed to update advanced settings:', error);
    }
  }

  async updateUserPreferences(updates: Partial<CameraSettings['preferences']>): Promise<void> {
    if (!this.currentSettings) return;

    try {
      this.currentSettings.preferences = { 
        ...this.currentSettings.preferences, 
        ...updates 
      };
      this.currentSettings.usage.lastUpdated = Date.now();

      await this.saveSettings();
      this.notifyListeners();

      console.log('User preferences updated:', updates);
    } catch (error) {
      console.error('Failed to update user preferences:', error);
    }
  }

  async updateStreamingSettings(updates: Partial<CameraSettings['streaming']>): Promise<void> {
    if (!this.currentSettings) return;

    try {
      this.currentSettings.streaming = { 
        ...this.currentSettings.streaming, 
        ...updates 
      };
      this.currentSettings.usage.lastUpdated = Date.now();

      await this.saveSettings();
      this.notifyListeners();

      console.log('Streaming settings updated:', updates);
    } catch (error) {
      console.error('Failed to update streaming settings:', error);
    }
  }

  async recordStreamingSession(durationSeconds: number): Promise<void> {
    if (!this.currentSettings) return;

    try {
      const usage = this.currentSettings.usage;
      usage.totalStreamingTime += durationSeconds;
      
      // Calculate new average session duration
      const sessionCount = Object.values(usage.layoutUsageCount).reduce((sum, count) => sum + count, 0);
      if (sessionCount > 0) {
        usage.averageSessionDuration = usage.totalStreamingTime / sessionCount;
      }

      usage.lastUpdated = Date.now();

      await this.saveSettings();
      this.notifyListeners();

      console.log(`Streaming session recorded: ${durationSeconds}s`);
    } catch (error) {
      console.error('Failed to record streaming session:', error);
    }
  }

  // Profile Management
  async createProfile(name: string, description: string, settings?: Partial<CameraSettings>): Promise<string> {
    try {
      const profile: CameraProfile = {
        id: `profile_${Date.now()}`,
        name,
        description,
        settings: settings || (this.currentSettings ? { ...this.currentSettings } : {}),
        isDefault: false,
        createdAt: Date.now(),
        lastUsed: 0
      };

      this.profiles.push(profile);
      await this.saveProfiles();

      console.log(`Profile created: ${name}`);
      return profile.id;
    } catch (error) {
      console.error('Failed to create profile:', error);
      throw error;
    }
  }

  async loadProfile(profileId: string): Promise<boolean> {
    try {
      const profile = this.profiles.find(p => p.id === profileId);
      if (!profile) {
        console.error('Profile not found:', profileId);
        return false;
      }

      // Merge profile settings with current settings
      if (this.currentSettings && profile.settings) {
        this.currentSettings = { ...this.currentSettings, ...profile.settings };
        profile.lastUsed = Date.now();
        
        await this.saveSettings();
        await this.saveProfiles();
        this.notifyListeners();

        console.log(`Profile loaded: ${profile.name}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return false;
    }
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    try {
      const index = this.profiles.findIndex(p => p.id === profileId);
      if (index === -1) {
        return false;
      }

      this.profiles.splice(index, 1);
      await this.saveProfiles();

      console.log('Profile deleted:', profileId);
      return true;
    } catch (error) {
      console.error('Failed to delete profile:', error);
      return false;
    }
  }

  // Storage Management
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (saved) {
        this.currentSettings = JSON.parse(saved);
        console.log('Camera settings loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load camera settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.currentSettings) {
        await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.currentSettings));
        console.log('Camera settings saved to storage');
      }
    } catch (error) {
      console.error('Failed to save camera settings:', error);
    }
  }

  private async loadProfiles(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEYS.PROFILES);
      if (saved) {
        this.profiles = JSON.parse(saved);
        console.log('Camera profiles loaded from storage');
      }
    } catch (error) {
      console.error('Failed to load camera profiles:', error);
    }
  }

  private async saveProfiles(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.PROFILES, JSON.stringify(this.profiles));
      console.log('Camera profiles saved to storage');
    } catch (error) {
      console.error('Failed to save camera profiles:', error);
    }
  }

  async exportSettings(): Promise<string> {
    try {
      const exportData = {
        settings: this.currentSettings,
        profiles: this.profiles,
        exportedAt: Date.now(),
        version: '1.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export settings:', error);
      throw error;
    }
  }

  async importSettings(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.settings) {
        this.currentSettings = importData.settings;
        await this.saveSettings();
      }

      if (importData.profiles && Array.isArray(importData.profiles)) {
        this.profiles = importData.profiles;
        await this.saveProfiles();
      }

      this.notifyListeners();
      console.log('Settings imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  async resetToDefaults(): Promise<void> {
    try {
      this.currentSettings = this.createDefaultSettings();
      await this.saveSettings();
      this.notifyListeners();

      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  }

  // Public API
  getCurrentSettings(): CameraSettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null;
  }

  getProfiles(): CameraProfile[] {
    return [...this.profiles];
  }

  getCameraSettings(cameraType: CameraType): CameraSettings['frontCamera'] | CameraSettings['backCamera'] | null {
    if (!this.currentSettings) return null;
    
    return cameraType === 'front' 
      ? { ...this.currentSettings.frontCamera }
      : { ...this.currentSettings.backCamera };
  }

  getUsageStatistics(): CameraSettings['usage'] | null {
    return this.currentSettings ? { ...this.currentSettings.usage } : null;
  }

  private notifyListeners(): void {
    if (this.currentSettings) {
      this.listeners.forEach(listener => listener(this.currentSettings!));
    }
  }

  subscribe(listener: (settings: CameraSettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  dispose(): void {
    console.log('Disposing camera settings manager...');
    this.listeners = [];
  }
}

export const cameraSettingsManager = CameraSettingsManager.getInstance();
export default cameraSettingsManager;