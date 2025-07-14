import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolutionManager } from './ResolutionManager';
import { performanceMonitor } from './PerformanceMonitor';
import { streamingService } from './streamingService';
import { adaptiveQualityManager } from './AdaptiveQualityManager';

export interface BatteryOptimizationProfile {
  id: string;
  name: string;
  description: string;
  batteryThreshold: number; // percentage
  actions: BatteryOptimizationActions;
  enabled: boolean;
  priority: number;
}

export interface BatteryOptimizationActions {
  // Resolution and Quality
  reduceResolution?: boolean;
  targetResolution?: '480p' | '720p' | '1080p' | '4K';
  reduceBitrate?: boolean;
  targetBitrate?: number; // kbps
  reduceFPS?: boolean;
  targetFPS?: number;
  
  // Camera Settings
  disableStabilization?: boolean;
  disableNoiseReduction?: boolean;
  disableHDR?: boolean;
  disablePortraitMode?: boolean;
  reduceZoom?: boolean;
  
  // Performance Settings
  enableLowPowerMode?: boolean;
  reduceCPUUsage?: boolean;
  limitMemoryUsage?: boolean;
  disableHapticFeedback?: boolean;
  dimScreen?: boolean;
  
  // Streaming Settings
  enableLowLatencyMode?: boolean;
  reduceBufferSize?: boolean;
  disableAnalytics?: boolean;
  pausePerformanceMonitoring?: boolean;
  
  // System Settings
  disableLocationServices?: boolean;
  reduceNetworkChecks?: boolean;
  pauseBackgroundTasks?: boolean;
}

export interface BatteryUsageStats {
  timestamp: number;
  level: number;
  isCharging: boolean;
  estimatedTimeRemaining: number; // minutes
  drainRate: number; // percentage per hour
  temperature: number; // celsius
  voltage: number; // volts
  current: number; // milliamps
}

export interface BatteryOptimizationEvent {
  id: string;
  timestamp: number;
  profileId: string;
  profileName: string;
  batteryLevel: number;
  actions: BatteryOptimizationActions;
  estimatedSavings: number; // percentage per hour
  success: boolean;
  reason?: string;
}

export interface BatteryOptimizationSettings {
  enabled: boolean;
  aggressiveMode: boolean;
  monitoringInterval: number; // seconds
  lowBatteryThreshold: number; // percentage
  criticalBatteryThreshold: number; // percentage
  autoRevertOnCharging: boolean;
  revertDelay: number; // seconds
  showBatteryWarnings: boolean;
  emergencyMode: {
    enabled: boolean;
    threshold: number; // percentage
    actions: BatteryOptimizationActions;
  };
}

class BatteryOptimizationManager {
  private static instance: BatteryOptimizationManager;
  private isMonitoring = false;
  private isOptimizationActive = false;
  private currentSettings: BatteryOptimizationSettings | null = null;
  private profiles: BatteryOptimizationProfile[] = [];
  private batteryHistory: BatteryUsageStats[] = [];
  private optimizationEvents: BatteryOptimizationEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private revertTimer: NodeJS.Timeout | null = null;
  private originalSettings: any = {};
  private listeners: Array<(event: BatteryOptimizationEvent) => void> = [];

  private constructor() {}

  public static getInstance(): BatteryOptimizationManager {
    if (!BatteryOptimizationManager.instance) {
      BatteryOptimizationManager.instance = new BatteryOptimizationManager();
    }
    return BatteryOptimizationManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing battery optimization manager...');

      // Load settings
      await this.loadSettings();

      // Create default settings if none exist
      if (!this.currentSettings) {
        this.currentSettings = this.createDefaultSettings();
        await this.saveSettings();
      }

      // Load profiles
      await this.loadProfiles();

      // Create default profiles if none exist
      if (this.profiles.length === 0) {
        this.createDefaultProfiles();
        await this.saveProfiles();
      }

      // Start monitoring if enabled
      if (this.currentSettings.enabled) {
        this.startMonitoring();
      }

      console.log('Battery optimization manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize battery optimization manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): BatteryOptimizationSettings {
    return {
      enabled: true,
      aggressiveMode: false,
      monitoringInterval: 30, // 30 seconds
      lowBatteryThreshold: 20,
      criticalBatteryThreshold: 10,
      autoRevertOnCharging: true,
      revertDelay: 60, // 1 minute
      showBatteryWarnings: true,
      emergencyMode: {
        enabled: true,
        threshold: 5,
        actions: {
          reduceResolution: true,
          targetResolution: '480p',
          reduceBitrate: true,
          targetBitrate: 800,
          reduceFPS: true,
          targetFPS: 15,
          disableStabilization: true,
          disableNoiseReduction: true,
          disableHDR: true,
          enableLowPowerMode: true,
          reduceCPUUsage: true,
          disableHapticFeedback: true,
          pausePerformanceMonitoring: true,
          disableAnalytics: true
        }
      }
    };
  }

  private createDefaultProfiles(): void {
    this.profiles = [
      // Low Battery Profile
      {
        id: 'low_battery',
        name: 'Low Battery',
        description: 'Moderate optimizations for low battery situations',
        batteryThreshold: 20,
        actions: {
          reduceResolution: true,
          targetResolution: '720p',
          reduceBitrate: true,
          targetBitrate: 2000,
          disableStabilization: false,
          disableNoiseReduction: true,
          enableLowPowerMode: false,
          reduceCPUUsage: true,
          disableHapticFeedback: false,
          pausePerformanceMonitoring: false
        },
        enabled: true,
        priority: 5
      },

      // Critical Battery Profile
      {
        id: 'critical_battery',
        name: 'Critical Battery',
        description: 'Aggressive optimizations for critical battery levels',
        batteryThreshold: 10,
        actions: {
          reduceResolution: true,
          targetResolution: '480p',
          reduceBitrate: true,
          targetBitrate: 1000,
          reduceFPS: true,
          targetFPS: 20,
          disableStabilization: true,
          disableNoiseReduction: true,
          disableHDR: true,
          enableLowPowerMode: true,
          reduceCPUUsage: true,
          disableHapticFeedback: true,
          pausePerformanceMonitoring: true,
          disableAnalytics: true
        },
        enabled: true,
        priority: 10
      },

      // Emergency Mode Profile
      {
        id: 'emergency_mode',
        name: 'Emergency Mode',
        description: 'Maximum battery conservation for emergency situations',
        batteryThreshold: 5,
        actions: {
          reduceResolution: true,
          targetResolution: '480p',
          reduceBitrate: true,
          targetBitrate: 500,
          reduceFPS: true,
          targetFPS: 15,
          disableStabilization: true,
          disableNoiseReduction: true,
          disableHDR: true,
          disablePortraitMode: true,
          enableLowPowerMode: true,
          reduceCPUUsage: true,
          limitMemoryUsage: true,
          disableHapticFeedback: true,
          pausePerformanceMonitoring: true,
          disableAnalytics: true,
          reduceNetworkChecks: true,
          pauseBackgroundTasks: true
        },
        enabled: true,
        priority: 15
      },

      // Power Saver Profile
      {
        id: 'power_saver',
        name: 'Power Saver',
        description: 'Balanced optimizations to extend battery life',
        batteryThreshold: 30,
        actions: {
          reduceBitrate: true,
          targetBitrate: 2500,
          disableNoiseReduction: true,
          reduceCPUUsage: true,
          enableLowLatencyMode: false,
          reduceBufferSize: true,
          reduceNetworkChecks: true
        },
        enabled: false, // Optional profile
        priority: 3
      }
    ];
  }

  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('Battery monitoring already running');
      return;
    }

    console.log('Starting battery optimization monitoring');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      await this.performBatteryCheck();
    }, (this.currentSettings?.monitoringInterval || 30) * 1000);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('Battery monitoring not running');
      return;
    }

    console.log('Stopping battery optimization monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    if (this.revertTimer) {
      clearTimeout(this.revertTimer);
      this.revertTimer = null;
    }
  }

  private async performBatteryCheck(): Promise<void> {
    try {
      const batteryStats = await this.getBatteryStats();
      this.batteryHistory.push(batteryStats);

      // Limit history size
      if (this.batteryHistory.length > 100) {
        this.batteryHistory.shift();
      }

      // Check if optimizations should be applied
      const shouldOptimize = this.shouldApplyOptimizations(batteryStats);
      const shouldRevert = this.shouldRevertOptimizations(batteryStats);

      if (shouldOptimize && !this.isOptimizationActive) {
        await this.applyBatteryOptimizations(batteryStats);
      } else if (shouldRevert && this.isOptimizationActive) {
        await this.revertOptimizations();
      }

    } catch (error) {
      console.error('Error during battery check:', error);
    }
  }

  private async getBatteryStats(): Promise<BatteryUsageStats> {
    // In a real implementation, this would use native battery APIs
    // For now, we'll simulate battery data
    const metrics = performanceMonitor.getCurrentMetrics();
    const currentLevel = metrics?.batteryLevel || 100;

    // Calculate drain rate from history
    let drainRate = 0;
    if (this.batteryHistory.length > 0) {
      const previousLevel = this.batteryHistory[this.batteryHistory.length - 1].level;
      const timeDiff = Date.now() - this.batteryHistory[this.batteryHistory.length - 1].timestamp;
      const levelDiff = previousLevel - currentLevel;
      
      if (timeDiff > 0 && levelDiff > 0) {
        drainRate = (levelDiff / (timeDiff / 1000 / 3600)); // percentage per hour
      }
    }

    return {
      timestamp: Date.now(),
      level: currentLevel,
      isCharging: false, // In real implementation, detect charging state
      estimatedTimeRemaining: drainRate > 0 ? (currentLevel / drainRate) * 60 : 0, // minutes
      drainRate,
      temperature: 25 + Math.random() * 10, // Simulate 25-35°C
      voltage: 3.7 + Math.random() * 0.5, // Simulate 3.7-4.2V
      current: streamingService.isStreamingActive() ? 2000 + Math.random() * 500 : 500 + Math.random() * 200 // mA
    };
  }

  private shouldApplyOptimizations(stats: BatteryUsageStats): boolean {
    if (!this.currentSettings || stats.isCharging) {
      return false;
    }

    // Check emergency mode
    if (this.currentSettings.emergencyMode.enabled && 
        stats.level <= this.currentSettings.emergencyMode.threshold) {
      return true;
    }

    // Check if any profile threshold is met
    const applicableProfiles = this.profiles
      .filter(profile => profile.enabled && stats.level <= profile.batteryThreshold)
      .sort((a, b) => b.priority - a.priority);

    return applicableProfiles.length > 0;
  }

  private shouldRevertOptimizations(stats: BatteryUsageStats): boolean {
    if (!this.currentSettings || !this.isOptimizationActive) {
      return false;
    }

    // Revert if charging and auto-revert is enabled
    if (stats.isCharging && this.currentSettings.autoRevertOnCharging) {
      return true;
    }

    // Revert if battery level is above all thresholds
    const activeThreshold = Math.max(
      ...this.profiles.filter(p => p.enabled).map(p => p.batteryThreshold),
      this.currentSettings.emergencyMode.enabled ? this.currentSettings.emergencyMode.threshold : 0
    );

    return stats.level > activeThreshold + 10; // Add 10% hysteresis
  }

  private async applyBatteryOptimizations(stats: BatteryUsageStats): Promise<void> {
    try {
      console.log(`Applying battery optimizations at ${stats.level}% battery`);

      // Store original settings for revert
      await this.storeOriginalSettings();

      // Determine which profile to apply
      let actionsToApply: BatteryOptimizationActions;
      let profileName: string;
      let profileId: string;

      if (this.currentSettings?.emergencyMode.enabled && 
          stats.level <= this.currentSettings.emergencyMode.threshold) {
        actionsToApply = this.currentSettings.emergencyMode.actions;
        profileName = 'Emergency Mode';
        profileId = 'emergency_mode';
      } else {
        const applicableProfiles = this.profiles
          .filter(profile => profile.enabled && stats.level <= profile.batteryThreshold)
          .sort((a, b) => b.priority - a.priority);

        if (applicableProfiles.length === 0) {
          return;
        }

        const selectedProfile = applicableProfiles[0];
        actionsToApply = selectedProfile.actions;
        profileName = selectedProfile.name;
        profileId = selectedProfile.id;
      }

      // Apply optimizations
      const success = await this.applyActions(actionsToApply);

      // Record optimization event
      const event: BatteryOptimizationEvent = {
        id: `optimization_${Date.now()}`,
        timestamp: Date.now(),
        profileId,
        profileName,
        batteryLevel: stats.level,
        actions: actionsToApply,
        estimatedSavings: this.calculateEstimatedSavings(actionsToApply),
        success,
        reason: success ? 'Optimizations applied successfully' : 'Failed to apply some optimizations'
      };

      this.optimizationEvents.push(event);
      this.isOptimizationActive = success;

      this.notifyListeners(event);

      console.log(`Battery optimizations ${success ? 'applied' : 'failed'}: ${profileName}`);

    } catch (error) {
      console.error('Error applying battery optimizations:', error);
    }
  }

  private async storeOriginalSettings(): Promise<void> {
    try {
      this.originalSettings = {
        resolution: resolutionManager.getCurrentSettings(),
        streaming: streamingService.getCurrentConfig(),
        adaptiveQuality: adaptiveQualityManager.getCurrentSettings(),
        performance: {
          isMonitoring: performanceMonitor.isMonitoringActive()
        }
      };
    } catch (error) {
      console.error('Error storing original settings:', error);
    }
  }

  private async applyActions(actions: BatteryOptimizationActions): Promise<boolean> {
    let allSuccessful = true;

    try {
      // Resolution optimizations
      if (actions.reduceResolution && actions.targetResolution) {
        const success = await streamingService.updateStreamQuality(actions.targetResolution);
        if (!success) allSuccessful = false;
      }

      // Bitrate optimizations
      if (actions.reduceBitrate && actions.targetBitrate) {
        // Note: This would require extending the streaming service to support direct bitrate changes
        console.log(`Would reduce bitrate to ${actions.targetBitrate}kbps`);
      }

      // FPS optimizations
      if (actions.reduceFPS && actions.targetFPS) {
        // Note: This would require extending the streaming service to support FPS changes
        console.log(`Would reduce FPS to ${actions.targetFPS}`);
      }

      // Performance monitoring
      if (actions.pausePerformanceMonitoring) {
        performanceMonitor.stopMonitoring();
      }

      // Adaptive quality
      if (actions.enableLowPowerMode) {
        await resolutionManager.setBatteryOptimization(true);
      }

      console.log('Battery optimization actions applied');
      return allSuccessful;

    } catch (error) {
      console.error('Error applying battery optimization actions:', error);
      return false;
    }
  }

  private calculateEstimatedSavings(actions: BatteryOptimizationActions): number {
    let estimatedSavings = 0;

    // Rough estimates of battery savings (percentage per hour)
    if (actions.reduceResolution) estimatedSavings += 2;
    if (actions.reduceBitrate) estimatedSavings += 1.5;
    if (actions.reduceFPS) estimatedSavings += 1;
    if (actions.disableStabilization) estimatedSavings += 0.5;
    if (actions.disableNoiseReduction) estimatedSavings += 0.5;
    if (actions.pausePerformanceMonitoring) estimatedSavings += 0.3;
    if (actions.reduceCPUUsage) estimatedSavings += 1;
    if (actions.enableLowPowerMode) estimatedSavings += 3;

    return Math.min(estimatedSavings, 15); // Cap at 15% per hour
  }

  private async revertOptimizations(): Promise<void> {
    try {
      console.log('Reverting battery optimizations');

      if (this.revertTimer) {
        clearTimeout(this.revertTimer);
        this.revertTimer = null;
      }

      // Add delay if configured
      const delay = this.currentSettings?.revertDelay || 0;
      if (delay > 0) {
        this.revertTimer = setTimeout(async () => {
          await this.performRevert();
        }, delay * 1000);
      } else {
        await this.performRevert();
      }

    } catch (error) {
      console.error('Error reverting battery optimizations:', error);
    }
  }

  private async performRevert(): Promise<void> {
    try {
      // Restore original settings
      if (this.originalSettings.performance?.isMonitoring) {
        performanceMonitor.startMonitoring();
      }

      if (this.originalSettings.resolution) {
        await resolutionManager.setBatteryOptimization(
          this.originalSettings.resolution.batteryOptimization || false
        );
      }

      this.isOptimizationActive = false;
      this.originalSettings = {};

      console.log('Battery optimizations reverted successfully');

    } catch (error) {
      console.error('Error performing revert:', error);
    }
  }

  // Storage methods
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('battery_optimization_settings');
      if (saved) {
        this.currentSettings = JSON.parse(saved);
        console.log('Battery optimization settings loaded');
      }
    } catch (error) {
      console.error('Failed to load battery optimization settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.currentSettings) {
        await AsyncStorage.setItem('battery_optimization_settings', JSON.stringify(this.currentSettings));
        console.log('Battery optimization settings saved');
      }
    } catch (error) {
      console.error('Failed to save battery optimization settings:', error);
    }
  }

  private async loadProfiles(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('battery_optimization_profiles');
      if (saved) {
        this.profiles = JSON.parse(saved);
        console.log('Battery optimization profiles loaded');
      }
    } catch (error) {
      console.error('Failed to load battery optimization profiles:', error);
    }
  }

  private async saveProfiles(): Promise<void> {
    try {
      await AsyncStorage.setItem('battery_optimization_profiles', JSON.stringify(this.profiles));
      console.log('Battery optimization profiles saved');
    } catch (error) {
      console.error('Failed to save battery optimization profiles:', error);
    }
  }

  // Public API
  async updateSettings(updates: Partial<BatteryOptimizationSettings>): Promise<void> {
    if (this.currentSettings) {
      this.currentSettings = { ...this.currentSettings, ...updates };
      await this.saveSettings();

      // Restart monitoring if interval changed
      if (updates.monitoringInterval && this.isMonitoring) {
        this.stopMonitoring();
        this.startMonitoring();
      }
    }
  }

  async addProfile(profile: Omit<BatteryOptimizationProfile, 'id'>): Promise<string> {
    const newProfile: BatteryOptimizationProfile = {
      ...profile,
      id: `profile_${Date.now()}`
    };

    this.profiles.push(newProfile);
    await this.saveProfiles();

    console.log(`Battery optimization profile added: ${profile.name}`);
    return newProfile.id;
  }

  async updateProfile(profileId: string, updates: Partial<BatteryOptimizationProfile>): Promise<boolean> {
    const profile = this.profiles.find(p => p.id === profileId);
    if (!profile) {
      return false;
    }

    Object.assign(profile, updates);
    await this.saveProfiles();

    console.log(`Battery optimization profile updated: ${profile.name}`);
    return true;
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    const index = this.profiles.findIndex(p => p.id === profileId);
    if (index === -1) {
      return false;
    }

    this.profiles.splice(index, 1);
    await this.saveProfiles();

    console.log('Battery optimization profile deleted:', profileId);
    return true;
  }

  // Getters
  getCurrentSettings(): BatteryOptimizationSettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null;
  }

  getProfiles(): BatteryOptimizationProfile[] {
    return [...this.profiles];
  }

  getBatteryHistory(): BatteryUsageStats[] {
    return [...this.batteryHistory];
  }

  getOptimizationEvents(): BatteryOptimizationEvent[] {
    return [...this.optimizationEvents];
  }

  getCurrentBatteryStats(): BatteryUsageStats | null {
    return this.batteryHistory[this.batteryHistory.length - 1] || null;
  }

  isOptimizationActiveState(): boolean {
    return this.isOptimizationActive;
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  subscribe(listener: (event: BatteryOptimizationEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(event: BatteryOptimizationEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  dispose(): void {
    console.log('Disposing battery optimization manager...');
    this.stopMonitoring();
    if (this.isOptimizationActive) {
      this.performRevert();
    }
    this.listeners = [];
  }
}

export const batteryOptimizationManager = BatteryOptimizationManager.getInstance();
export default batteryOptimizationManager;