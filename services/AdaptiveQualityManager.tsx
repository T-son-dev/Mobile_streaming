import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolutionManager, ResolutionPreset } from './ResolutionManager';
import { performanceMonitor, PerformanceMetrics } from './PerformanceMonitor';
import { streamingService } from './streamingService';

export interface QualityProfile {
  id: string;
  name: string;
  conditions: QualityConditions;
  actions: QualityActions;
  priority: number;
  enabled: boolean;
}

export interface QualityConditions {
  networkSpeed?: {
    min?: number; // kbps
    max?: number; // kbps
  };
  batteryLevel?: {
    min?: number; // percentage
    max?: number; // percentage
  };
  memoryUsage?: {
    max?: number; // percentage
  };
  cpuUsage?: {
    max?: number; // percentage
  };
  thermalState?: 'normal' | 'fair' | 'serious' | 'critical';
  droppedFramesRate?: {
    max?: number; // percentage
  };
  fps?: {
    min?: number;
  };
  streamDuration?: {
    min?: number; // seconds
  };
}

export interface QualityActions {
  resolution?: ResolutionPreset;
  bitrate?: number; // kbps
  fps?: number;
  enableBatteryOptimization?: boolean;
  enableStabilization?: boolean;
  enableNoiseReduction?: boolean;
  bufferSize?: 'small' | 'medium' | 'large';
  lowLatencyMode?: boolean;
}

export interface AdaptationEvent {
  id: string;
  timestamp: number;
  trigger: string;
  conditions: QualityConditions;
  actions: QualityActions;
  previousSettings: any;
  newSettings: any;
  success: boolean;
  reason?: string;
}

export interface AdaptiveQualitySettings {
  enabled: boolean;
  aggressiveMode: boolean;
  minQualityLevel: ResolutionPreset;
  maxQualityLevel: ResolutionPreset;
  adaptationInterval: number; // seconds
  stabilityDelay: number; // seconds before adapting back up
  performanceThreshold: {
    cpu: number; // percentage
    memory: number; // percentage
    battery: number; // percentage
    network: number; // kbps
  };
  userPreferences: {
    prioritizeBattery: boolean;
    prioritizeQuality: boolean;
    prioritizeStability: boolean;
    allowBackgroundAdaptation: boolean;
  };
}

class AdaptiveQualityManager {
  private static instance: AdaptiveQualityManager;
  private isEnabled = false;
  private currentSettings: AdaptiveQualitySettings | null = null;
  private qualityProfiles: QualityProfile[] = [];
  private adaptationHistory: AdaptationEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastAdaptation = 0;
  private stabilityTimer: NodeJS.Timeout | null = null;
  private listeners: Array<(event: AdaptationEvent) => void> = [];

  private constructor() {}

  public static getInstance(): AdaptiveQualityManager {
    if (!AdaptiveQualityManager.instance) {
      AdaptiveQualityManager.instance = new AdaptiveQualityManager();
    }
    return AdaptiveQualityManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing adaptive quality manager...');

      // Load saved settings
      await this.loadSettings();

      // Create default settings if none exist
      if (!this.currentSettings) {
        this.currentSettings = this.createDefaultSettings();
        await this.saveSettings();
      }

      // Load quality profiles
      await this.loadProfiles();

      // Create default profiles if none exist
      if (this.qualityProfiles.length === 0) {
        this.createDefaultProfiles();
        await this.saveProfiles();
      }

      console.log('Adaptive quality manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize adaptive quality manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): AdaptiveQualitySettings {
    return {
      enabled: true,
      aggressiveMode: false,
      minQualityLevel: ResolutionPreset.LOW,
      maxQualityLevel: ResolutionPreset.ULTRA,
      adaptationInterval: 5, // 5 seconds
      stabilityDelay: 30, // 30 seconds
      performanceThreshold: {
        cpu: 80,
        memory: 85,
        battery: 15,
        network: 1000
      },
      userPreferences: {
        prioritizeBattery: true,
        prioritizeQuality: false,
        prioritizeStability: true,
        allowBackgroundAdaptation: true
      }
    };
  }

  private createDefaultProfiles(): void {
    this.qualityProfiles = [
      // Battery Conservation Profile
      {
        id: 'battery_saver',
        name: 'Battery Saver',
        conditions: {
          batteryLevel: { max: 20 }
        },
        actions: {
          resolution: ResolutionPreset.LOW,
          bitrate: 1000,
          fps: 24,
          enableBatteryOptimization: true,
          enableStabilization: false,
          enableNoiseReduction: false,
          bufferSize: 'small',
          lowLatencyMode: false
        },
        priority: 10,
        enabled: true
      },

      // Network Adaptation Profile
      {
        id: 'poor_network',
        name: 'Poor Network',
        conditions: {
          networkSpeed: { max: 1500 },
          droppedFramesRate: { max: 5 }
        },
        actions: {
          resolution: ResolutionPreset.LOW,
          bitrate: 800,
          fps: 24,
          bufferSize: 'large',
          lowLatencyMode: false
        },
        priority: 8,
        enabled: true
      },

      // Performance Optimization Profile
      {
        id: 'performance_issues',
        name: 'Performance Issues',
        conditions: {
          cpuUsage: { max: 85 },
          memoryUsage: { max: 90 },
          thermalState: 'serious'
        },
        actions: {
          resolution: ResolutionPreset.MEDIUM,
          bitrate: 2000,
          fps: 24,
          enableStabilization: false,
          enableNoiseReduction: false
        },
        priority: 7,
        enabled: true
      },

      // High Quality Profile
      {
        id: 'optimal_conditions',
        name: 'Optimal Conditions',
        conditions: {
          networkSpeed: { min: 6000 },
          batteryLevel: { min: 50 },
          cpuUsage: { max: 60 },
          memoryUsage: { max: 70 }
        },
        actions: {
          resolution: ResolutionPreset.HIGH,
          bitrate: 5000,
          fps: 60,
          enableStabilization: true,
          enableNoiseReduction: true,
          bufferSize: 'medium',
          lowLatencyMode: false
        },
        priority: 5,
        enabled: true
      },

      // Ultra Quality Profile
      {
        id: 'excellent_conditions',
        name: 'Excellent Conditions',
        conditions: {
          networkSpeed: { min: 10000 },
          batteryLevel: { min: 80 },
          cpuUsage: { max: 50 },
          memoryUsage: { max: 60 },
          thermalState: 'normal'
        },
        actions: {
          resolution: ResolutionPreset.ULTRA,
          bitrate: 8000,
          fps: 60,
          enableStabilization: true,
          enableNoiseReduction: true,
          bufferSize: 'medium',
          lowLatencyMode: true
        },
        priority: 3,
        enabled: true
      }
    ];
  }

  startAdaptiveQuality(): void {
    if (!this.currentSettings?.enabled || this.isEnabled) {
      return;
    }

    console.log('Starting adaptive quality management');
    this.isEnabled = true;

    // Start monitoring interval
    this.monitoringInterval = setInterval(() => {
      this.evaluateAndAdapt();
    }, (this.currentSettings.adaptationInterval || 5) * 1000);
  }

  stopAdaptiveQuality(): void {
    if (!this.isEnabled) {
      return;
    }

    console.log('Stopping adaptive quality management');
    this.isEnabled = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
      this.stabilityTimer = null;
    }
  }

  private async evaluateAndAdapt(): Promise<void> {
    try {
      if (!this.currentSettings || !streamingService.isStreamingActive()) {
        return;
      }

      const metrics = performanceMonitor.getCurrentMetrics();
      if (!metrics) {
        return;
      }

      // Check if enough time has passed since last adaptation
      const now = Date.now();
      const timeSinceLastAdaptation = now - this.lastAdaptation;
      const minInterval = this.currentSettings.adaptationInterval * 1000;

      if (timeSinceLastAdaptation < minInterval) {
        return;
      }

      // Find matching profile
      const matchingProfile = this.findBestMatchingProfile(metrics);
      if (!matchingProfile) {
        return;
      }

      // Apply adaptations
      const success = await this.applyAdaptations(matchingProfile, metrics);
      
      // Record adaptation event
      this.recordAdaptationEvent(matchingProfile, metrics, success);

      if (success) {
        this.lastAdaptation = now;
      }

    } catch (error) {
      console.error('Error during quality adaptation:', error);
    }
  }

  private findBestMatchingProfile(metrics: PerformanceMetrics): QualityProfile | null {
    const eligibleProfiles = this.qualityProfiles
      .filter(profile => profile.enabled && this.matchesConditions(profile.conditions, metrics))
      .sort((a, b) => b.priority - a.priority); // Higher priority first

    return eligibleProfiles[0] || null;
  }

  private matchesConditions(conditions: QualityConditions, metrics: PerformanceMetrics): boolean {
    // Network speed check
    if (conditions.networkSpeed) {
      const speed = metrics.networkSpeed.upload;
      if (conditions.networkSpeed.min && speed < conditions.networkSpeed.min) return false;
      if (conditions.networkSpeed.max && speed > conditions.networkSpeed.max) return false;
    }

    // Battery level check
    if (conditions.batteryLevel) {
      const battery = metrics.batteryLevel;
      if (conditions.batteryLevel.min && battery < conditions.batteryLevel.min) return false;
      if (conditions.batteryLevel.max && battery > conditions.batteryLevel.max) return false;
    }

    // Memory usage check
    if (conditions.memoryUsage) {
      const memory = metrics.memoryUsage.percentage;
      if (conditions.memoryUsage.max && memory > conditions.memoryUsage.max) return false;
    }

    // CPU usage check
    if (conditions.cpuUsage) {
      const cpu = metrics.cpuUsage.percentage;
      if (conditions.cpuUsage.max && cpu > conditions.cpuUsage.max) return false;
    }

    // Thermal state check
    if (conditions.thermalState && metrics.thermalState !== conditions.thermalState) {
      // Allow matching if actual state is better than required
      const stateOrder = ['normal', 'fair', 'serious', 'critical'];
      const actualIndex = stateOrder.indexOf(metrics.thermalState);
      const requiredIndex = stateOrder.indexOf(conditions.thermalState);
      if (actualIndex > requiredIndex) return false;
    }

    // Dropped frames rate check
    if (conditions.droppedFramesRate) {
      const dropRate = (metrics.streamingStats.droppedFrames / Math.max(1, metrics.streamingStats.totalFrames)) * 100;
      if (conditions.droppedFramesRate.max && dropRate > conditions.droppedFramesRate.max) return false;
    }

    // FPS check
    if (conditions.fps) {
      const fps = metrics.streamingStats.fps;
      if (conditions.fps.min && fps < conditions.fps.min) return false;
    }

    // Stream duration check
    if (conditions.streamDuration) {
      const duration = metrics.streamingStats.duration;
      if (conditions.streamDuration.min && duration < conditions.streamDuration.min) return false;
    }

    return true;
  }

  private async applyAdaptations(profile: QualityProfile, metrics: PerformanceMetrics): Promise<boolean> {
    try {
      console.log(`Applying quality profile: ${profile.name}`);

      let success = true;

      // Apply resolution changes
      if (profile.actions.resolution) {
        const resolutionSuccess = await resolutionManager.setResolution(profile.actions.resolution, false);
        if (!resolutionSuccess) {
          success = false;
          console.warn('Failed to apply resolution adaptation');
        }
      }

      // Apply streaming quality changes
      if (profile.actions.bitrate || profile.actions.fps) {
        const quality = this.determineQualityFromActions(profile.actions);
        if (quality) {
          const qualitySuccess = await streamingService.updateStreamQuality(quality);
          if (!qualitySuccess) {
            success = false;
            console.warn('Failed to apply streaming quality adaptation');
          }
        }
      }

      // Apply battery optimization
      if (profile.actions.enableBatteryOptimization !== undefined) {
        await resolutionManager.setBatteryOptimization(profile.actions.enableBatteryOptimization);
      }

      console.log(`Quality adaptation ${success ? 'successful' : 'failed'}: ${profile.name}`);
      return success;

    } catch (error) {
      console.error('Error applying adaptations:', error);
      return false;
    }
  }

  private determineQualityFromActions(actions: QualityActions): '720p' | '1080p' | '480p' | '4K' | null {
    if (actions.resolution) {
      switch (actions.resolution) {
        case ResolutionPreset.LOW: return '480p';
        case ResolutionPreset.MEDIUM: return '720p';
        case ResolutionPreset.HIGH: return '1080p';
        case ResolutionPreset.ULTRA: return '4K';
        default: return null;
      }
    }

    // Fallback to bitrate-based determination
    if (actions.bitrate) {
      if (actions.bitrate <= 1500) return '480p';
      if (actions.bitrate <= 3000) return '720p';
      if (actions.bitrate <= 6000) return '1080p';
      return '4K';
    }

    return null;
  }

  private recordAdaptationEvent(profile: QualityProfile, metrics: PerformanceMetrics, success: boolean): void {
    const event: AdaptationEvent = {
      id: `adaptation_${Date.now()}`,
      timestamp: Date.now(),
      trigger: profile.name,
      conditions: profile.conditions,
      actions: profile.actions,
      previousSettings: {
        resolution: metrics.streamingStats.resolution,
        bitrate: metrics.streamingStats.bitrate,
        fps: metrics.streamingStats.fps
      },
      newSettings: profile.actions,
      success,
      reason: success ? 'Adaptation applied successfully' : 'Failed to apply adaptation'
    };

    this.adaptationHistory.push(event);
    
    // Keep only recent history (last 50 events)
    if (this.adaptationHistory.length > 50) {
      this.adaptationHistory.shift();
    }

    // Notify listeners
    this.notifyListeners(event);
  }

  // Public API
  async updateSettings(updates: Partial<AdaptiveQualitySettings>): Promise<void> {
    if (this.currentSettings) {
      this.currentSettings = { ...this.currentSettings, ...updates };
      await this.saveSettings();

      // Restart if interval changed
      if (updates.adaptationInterval && this.isEnabled) {
        this.stopAdaptiveQuality();
        this.startAdaptiveQuality();
      }
    }
  }

  async addProfile(profile: Omit<QualityProfile, 'id'>): Promise<string> {
    const newProfile: QualityProfile = {
      ...profile,
      id: `profile_${Date.now()}`
    };

    this.qualityProfiles.push(newProfile);
    await this.saveProfiles();

    console.log(`Quality profile added: ${profile.name}`);
    return newProfile.id;
  }

  async updateProfile(profileId: string, updates: Partial<QualityProfile>): Promise<boolean> {
    const profile = this.qualityProfiles.find(p => p.id === profileId);
    if (!profile) {
      return false;
    }

    Object.assign(profile, updates);
    await this.saveProfiles();

    console.log(`Quality profile updated: ${profile.name}`);
    return true;
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    const index = this.qualityProfiles.findIndex(p => p.id === profileId);
    if (index === -1) {
      return false;
    }

    this.qualityProfiles.splice(index, 1);
    await this.saveProfiles();

    console.log('Quality profile deleted:', profileId);
    return true;
  }

  // Storage methods
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('adaptive_quality_settings');
      if (saved) {
        this.currentSettings = JSON.parse(saved);
        console.log('Adaptive quality settings loaded');
      }
    } catch (error) {
      console.error('Failed to load adaptive quality settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.currentSettings) {
        await AsyncStorage.setItem('adaptive_quality_settings', JSON.stringify(this.currentSettings));
        console.log('Adaptive quality settings saved');
      }
    } catch (error) {
      console.error('Failed to save adaptive quality settings:', error);
    }
  }

  private async loadProfiles(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('quality_profiles');
      if (saved) {
        this.qualityProfiles = JSON.parse(saved);
        console.log('Quality profiles loaded');
      }
    } catch (error) {
      console.error('Failed to load quality profiles:', error);
    }
  }

  private async saveProfiles(): Promise<void> {
    try {
      await AsyncStorage.setItem('quality_profiles', JSON.stringify(this.qualityProfiles));
      console.log('Quality profiles saved');
    } catch (error) {
      console.error('Failed to save quality profiles:', error);
    }
  }

  private notifyListeners(event: AdaptationEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  // Getters
  getCurrentSettings(): AdaptiveQualitySettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null;
  }

  getProfiles(): QualityProfile[] {
    return [...this.qualityProfiles];
  }

  getAdaptationHistory(): AdaptationEvent[] {
    return [...this.adaptationHistory];
  }

  isActive(): boolean {
    return this.isEnabled;
  }

  subscribe(listener: (event: AdaptationEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  dispose(): void {
    console.log('Disposing adaptive quality manager...');
    this.stopAdaptiveQuality();
    this.listeners = [];
  }
}

export const adaptiveQualityManager = AdaptiveQualityManager.getInstance();
export default adaptiveQualityManager;