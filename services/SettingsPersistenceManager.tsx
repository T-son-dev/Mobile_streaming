import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraSettings, cameraSettingsManager } from './CameraSettingsManager';
import { AdaptiveQualitySettings, adaptiveQualityManager } from './AdaptiveQualityManager';
import { ResolutionSettings, resolutionManager } from './ResolutionManager';
import { PerformanceThresholds, performanceMonitor } from './PerformanceMonitor';

export interface AppSettings {
  version: string;
  lastSaved: number;
  camera: CameraSettings;
  adaptiveQuality: AdaptiveQualitySettings;
  resolution: ResolutionSettings;
  performance: {
    thresholds: PerformanceThresholds;
    autoStart: boolean;
    alertsEnabled: boolean;
  };
  streaming: {
    autoReconnect: boolean;
    maxReconnectAttempts: number;
    defaultPlatform: 'youtube' | 'facebook' | 'twitch' | 'custom';
    saveCredentials: boolean;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    showAdvancedControls: boolean;
    enableHapticFeedback: boolean;
    showPerformanceOverlay: boolean;
    analyticsEnabled: boolean;
  };
  notifications: {
    performanceAlerts: boolean;
    streamingEvents: boolean;
    batteryWarnings: boolean;
    networkIssues: boolean;
  };
  backup: {
    autoBackup: boolean;
    backupInterval: number; // hours
    maxBackups: number;
    lastBackup: number;
  };
}

export interface SettingsBackup {
  id: string;
  timestamp: number;
  version: string;
  settings: AppSettings;
  deviceInfo: {
    platform: string;
    version: string;
    model?: string;
  };
  checksum: string;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  migrationRequired: boolean;
  targetVersion?: string;
}

class SettingsPersistenceManager {
  private static instance: SettingsPersistenceManager;
  private currentSettings: AppSettings | null = null;
  private backups: SettingsBackup[] = [];
  private autoBackupInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEYS = {
    SETTINGS: 'app_settings_v2',
    BACKUPS: 'settings_backups',
    MIGRATION_STATUS: 'settings_migration_status'
  };
  private readonly CURRENT_VERSION = '2.0.0';

  private constructor() {}

  public static getInstance(): SettingsPersistenceManager {
    if (!SettingsPersistenceManager.instance) {
      SettingsPersistenceManager.instance = new SettingsPersistenceManager();
    }
    return SettingsPersistenceManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing settings persistence manager...');

      // Load existing settings
      await this.loadSettings();

      // Perform migration if needed
      await this.performMigrationIfNeeded();

      // Create default settings if none exist
      if (!this.currentSettings) {
        this.currentSettings = this.createDefaultSettings();
        await this.saveSettings();
      }

      // Load backups
      await this.loadBackups();

      // Start auto-backup if enabled
      if (this.currentSettings.backup.autoBackup) {
        this.startAutoBackup();
      }

      // Restore individual service settings
      await this.restoreServiceSettings();

      console.log('Settings persistence manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize settings persistence manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): AppSettings {
    const now = Date.now();
    
    return {
      version: this.CURRENT_VERSION,
      lastSaved: now,
      camera: cameraSettingsManager.getCurrentSettings() || {} as CameraSettings,
      adaptiveQuality: adaptiveQualityManager.getCurrentSettings() || {} as AdaptiveQualitySettings,
      resolution: resolutionManager.getCurrentSettings() || {} as ResolutionSettings,
      performance: {
        thresholds: performanceMonitor.getThresholds(),
        autoStart: true,
        alertsEnabled: true
      },
      streaming: {
        autoReconnect: true,
        maxReconnectAttempts: 5,
        defaultPlatform: 'custom',
        saveCredentials: false
      },
      ui: {
        theme: 'auto',
        showAdvancedControls: false,
        enableHapticFeedback: true,
        showPerformanceOverlay: false,
        analyticsEnabled: true
      },
      notifications: {
        performanceAlerts: true,
        streamingEvents: true,
        batteryWarnings: true,
        networkIssues: true
      },
      backup: {
        autoBackup: true,
        backupInterval: 24, // 24 hours
        maxBackups: 10,
        lastBackup: 0
      }
    };
  }

  async saveSettings(): Promise<boolean> {
    try {
      if (!this.currentSettings) {
        console.warn('No settings to save');
        return false;
      }

      // Update timestamp
      this.currentSettings.lastSaved = Date.now();

      // Save to storage
      await AsyncStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(this.currentSettings));

      // Create backup if auto-backup is enabled
      if (this.currentSettings.backup.autoBackup) {
        await this.createBackup('auto');
      }

      console.log('Settings saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  }

  async loadSettings(): Promise<boolean> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const validation = this.validateSettings(parsed);
        
        if (validation.isValid) {
          this.currentSettings = parsed;
          console.log('Settings loaded successfully');
          return true;
        } else {
          console.warn('Invalid settings found:', validation.errors);
          if (validation.migrationRequired) {
            await this.performMigration(parsed, validation.targetVersion);
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return false;
    }
  }

  private validateSettings(settings: any): SettingsValidationResult {
    const result: SettingsValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      migrationRequired: false
    };

    // Check version
    if (!settings.version) {
      result.migrationRequired = true;
      result.targetVersion = this.CURRENT_VERSION;
      result.warnings.push('Settings version missing, migration required');
    } else if (settings.version !== this.CURRENT_VERSION) {
      result.migrationRequired = true;
      result.targetVersion = this.CURRENT_VERSION;
      result.warnings.push(`Settings version ${settings.version} outdated, current: ${this.CURRENT_VERSION}`);
    }

    // Validate required fields
    const requiredFields = ['camera', 'streaming', 'ui', 'notifications'];
    for (const field of requiredFields) {
      if (!settings[field]) {
        result.errors.push(`Missing required field: ${field}`);
        result.isValid = false;
      }
    }

    // Validate data types
    if (settings.lastSaved && typeof settings.lastSaved !== 'number') {
      result.errors.push('Invalid lastSaved timestamp');
      result.isValid = false;
    }

    return result;
  }

  private async performMigrationIfNeeded(): Promise<void> {
    try {
      const migrationStatus = await AsyncStorage.getItem(this.STORAGE_KEYS.MIGRATION_STATUS);
      const lastMigration = migrationStatus ? JSON.parse(migrationStatus) : null;

      if (!lastMigration || lastMigration.version !== this.CURRENT_VERSION) {
        console.log('Performing settings migration...');
        await this.performFullMigration();
        
        await AsyncStorage.setItem(this.STORAGE_KEYS.MIGRATION_STATUS, JSON.stringify({
          version: this.CURRENT_VERSION,
          timestamp: Date.now(),
          previousVersion: lastMigration?.version || 'unknown'
        }));
        
        console.log('Settings migration completed');
      }
    } catch (error) {
      console.error('Migration failed:', error);
    }
  }

  private async performMigration(oldSettings: any, targetVersion?: string): Promise<void> {
    try {
      console.log(`Migrating settings to version ${targetVersion || this.CURRENT_VERSION}`);

      // Create backup of old settings
      await this.createBackup('migration', oldSettings);

      // Create new settings structure
      const newSettings = this.createDefaultSettings();

      // Migrate compatible settings
      if (oldSettings.streaming) {
        newSettings.streaming = { ...newSettings.streaming, ...oldSettings.streaming };
      }
      
      if (oldSettings.ui) {
        newSettings.ui = { ...newSettings.ui, ...oldSettings.ui };
      }

      if (oldSettings.notifications) {
        newSettings.notifications = { ...newSettings.notifications, ...oldSettings.notifications };
      }

      // Update version and save
      newSettings.version = this.CURRENT_VERSION;
      this.currentSettings = newSettings;
      await this.saveSettings();

      console.log('Settings migration completed successfully');
    } catch (error) {
      console.error('Settings migration failed:', error);
      throw error;
    }
  }

  private async performFullMigration(): Promise<void> {
    // Check for legacy settings keys and migrate
    const legacyKeys = [
      'camera_settings',
      'streaming_config',
      'performance_settings',
      'user_preferences'
    ];

    const legacyData: any = {};
    for (const key of legacyKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          legacyData[key] = JSON.parse(data);
        }
      } catch (error) {
        console.warn(`Failed to load legacy setting: ${key}`, error);
      }
    }

    if (Object.keys(legacyData).length > 0) {
      console.log('Migrating legacy settings...');
      const newSettings = this.createDefaultSettings();
      
      // Migrate legacy data to new structure
      if (legacyData.camera_settings) {
        newSettings.camera = { ...newSettings.camera, ...legacyData.camera_settings };
      }

      this.currentSettings = newSettings;
      await this.saveSettings();

      // Clean up legacy keys
      for (const key of legacyKeys) {
        await AsyncStorage.removeItem(key);
      }
    }
  }

  async createBackup(type: 'manual' | 'auto' | 'migration', customSettings?: any): Promise<string> {
    try {
      const settings = customSettings || this.currentSettings;
      if (!settings) {
        throw new Error('No settings to backup');
      }

      const backup: SettingsBackup = {
        id: `backup_${type}_${Date.now()}`,
        timestamp: Date.now(),
        version: this.CURRENT_VERSION,
        settings,
        deviceInfo: {
          platform: 'mobile', // Replace with actual platform detection
          version: this.CURRENT_VERSION
        },
        checksum: this.generateChecksum(settings)
      };

      this.backups.push(backup);

      // Limit number of backups
      const maxBackups = this.currentSettings?.backup.maxBackups || 10;
      if (this.backups.length > maxBackups) {
        this.backups = this.backups
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, maxBackups);
      }

      await this.saveBackups();

      if (this.currentSettings && type !== 'migration') {
        this.currentSettings.backup.lastBackup = Date.now();
        await this.saveSettings();
      }

      console.log(`Backup created: ${backup.id}`);
      return backup.id;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        console.error('Backup not found:', backupId);
        return false;
      }

      // Validate backup integrity
      const expectedChecksum = this.generateChecksum(backup.settings);
      if (backup.checksum !== expectedChecksum) {
        console.error('Backup integrity check failed');
        return false;
      }

      // Create backup of current settings before restore
      await this.createBackup('manual');

      // Restore settings
      this.currentSettings = backup.settings;
      await this.saveSettings();

      // Restore to individual services
      await this.restoreServiceSettings();

      console.log(`Settings restored from backup: ${backupId}`);
      return true;
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
    }
  }

  private async restoreServiceSettings(): Promise<void> {
    try {
      if (!this.currentSettings) return;

      // Restore performance thresholds
      if (this.currentSettings.performance.thresholds) {
        performanceMonitor.updateThresholds(this.currentSettings.performance.thresholds);
      }

      // Auto-start performance monitoring if enabled
      if (this.currentSettings.performance.autoStart) {
        performanceMonitor.startMonitoring();
      }

      console.log('Service settings restored');
    } catch (error) {
      console.error('Failed to restore service settings:', error);
    }
  }

  private generateChecksum(data: any): string {
    // Simple checksum generation (in production, use a proper hash function)
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  private async loadBackups(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEYS.BACKUPS);
      if (saved) {
        this.backups = JSON.parse(saved);
        console.log(`Loaded ${this.backups.length} backups`);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  }

  private async saveBackups(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEYS.BACKUPS, JSON.stringify(this.backups));
      console.log('Backups saved successfully');
    } catch (error) {
      console.error('Failed to save backups:', error);
    }
  }

  private startAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
    }

    const interval = (this.currentSettings?.backup.backupInterval || 24) * 60 * 60 * 1000; // Convert hours to ms
    
    this.autoBackupInterval = setInterval(async () => {
      try {
        await this.createBackup('auto');
      } catch (error) {
        console.error('Auto-backup failed:', error);
      }
    }, interval);

    console.log(`Auto-backup started with ${this.currentSettings?.backup.backupInterval || 24}h interval`);
  }

  private stopAutoBackup(): void {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
      console.log('Auto-backup stopped');
    }
  }

  // Public API
  async updateSettings(updates: Partial<AppSettings>): Promise<boolean> {
    try {
      if (this.currentSettings) {
        this.currentSettings = { ...this.currentSettings, ...updates };
        return await this.saveSettings();
      }
      return false;
    } catch (error) {
      console.error('Failed to update settings:', error);
      return false;
    }
  }

  async exportSettings(): Promise<string> {
    try {
      if (!this.currentSettings) {
        throw new Error('No settings to export');
      }

      const exportData = {
        settings: this.currentSettings,
        backups: this.backups,
        exportedAt: Date.now(),
        version: this.CURRENT_VERSION
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
      
      // Validate import data
      if (!importData.settings) {
        throw new Error('Invalid import data: missing settings');
      }

      // Create backup before import
      await this.createBackup('manual');

      // Import settings
      const validation = this.validateSettings(importData.settings);
      if (!validation.isValid) {
        throw new Error(`Invalid settings: ${validation.errors.join(', ')}`);
      }

      this.currentSettings = importData.settings;
      await this.saveSettings();

      // Import backups if available
      if (importData.backups && Array.isArray(importData.backups)) {
        this.backups = [...this.backups, ...importData.backups];
        await this.saveBackups();
      }

      // Restore to services
      await this.restoreServiceSettings();

      console.log('Settings imported successfully');
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }

  async resetAllSettings(): Promise<boolean> {
    try {
      // Create backup before reset
      await this.createBackup('manual');

      // Reset to defaults
      this.currentSettings = this.createDefaultSettings();
      await this.saveSettings();

      // Restore to services
      await this.restoreServiceSettings();

      console.log('All settings reset to defaults');
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return false;
    }
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const index = this.backups.findIndex(b => b.id === backupId);
      if (index === -1) {
        return false;
      }

      this.backups.splice(index, 1);
      await this.saveBackups();

      console.log(`Backup deleted: ${backupId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
    }
  }

  // Getters
  getCurrentSettings(): AppSettings | null {
    return this.currentSettings ? { ...this.currentSettings } : null;
  }

  getBackups(): SettingsBackup[] {
    return [...this.backups];
  }

  getStorageUsage(): { settings: number; backups: number; total: number } {
    const settingsSize = this.currentSettings ? JSON.stringify(this.currentSettings).length : 0;
    const backupsSize = JSON.stringify(this.backups).length;
    
    return {
      settings: settingsSize,
      backups: backupsSize,
      total: settingsSize + backupsSize
    };
  }

  dispose(): void {
    console.log('Disposing settings persistence manager...');
    this.stopAutoBackup();
  }
}

export const settingsPersistenceManager = SettingsPersistenceManager.getInstance();
export default settingsPersistenceManager;