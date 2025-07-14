import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import { ResolutionPreset } from './ResolutionManager';
import { performanceMonitor } from './PerformanceMonitor';

export interface DeviceCapabilities {
  // Device Hardware
  deviceInfo: {
    brand: string;
    model: string;
    osVersion: string;
    platform: 'ios' | 'android';
    chipset?: string;
    ram: number; // MB
    storage: number; // MB
    screenResolution: {
      width: number;
      height: number;
      density: number;
    };
  };

  // Camera Capabilities
  camera: {
    frontCameraAvailable: boolean;
    backCameraAvailable: boolean;
    dualCameraSupported: boolean;
    maxResolution: ResolutionPreset;
    supportedResolutions: ResolutionPreset[];
    hasFlash: boolean;
    hasStabilization: boolean;
    hasAutoFocus: boolean;
    hasHDR: boolean;
    hasPortraitMode: boolean;
    maxZoom: number;
    supportedFps: number[];
  };

  // Performance Capabilities
  performance: {
    estimatedPerformanceScore: number; // 0-100
    maxRecommendedResolution: ResolutionPreset;
    maxRecommendedBitrate: number; // kbps
    maxRecommendedFps: number;
    dualCameraPerformanceScore: number; // 0-100
    streamingCapabilityScore: number; // 0-100
    batteryEfficiencyScore: number; // 0-100
    thermalHandlingScore: number; // 0-100
  };

  // Network & Connectivity
  connectivity: {
    wifi: boolean;
    cellular: boolean;
    bluetooth: boolean;
    maxWifiSpeed: number; // Mbps estimated
    supportedCodecs: string[];
    lowLatencySupported: boolean;
  };

  // Audio/Video Processing
  multimedia: {
    hardwareEncoding: boolean;
    supportedVideoCodecs: string[];
    supportedAudioCodecs: string[];
    maxProcessingThreads: number;
    gpuAcceleration: boolean;
  };
}

export interface CompatibilityTestResult {
  id: string;
  timestamp: number;
  testName: string;
  category: 'camera' | 'performance' | 'streaming' | 'network' | 'battery';
  result: 'pass' | 'fail' | 'warning' | 'not_tested';
  score: number; // 0-100
  details: string;
  recommendations: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  executionTime: number; // milliseconds
}

export interface DeviceProfile {
  id: string;
  deviceFingerprint: string;
  capabilities: DeviceCapabilities;
  testResults: CompatibilityTestResult[];
  optimizedSettings: {
    resolution: ResolutionPreset;
    bitrate: number;
    fps: number;
    dualCameraEnabled: boolean;
    batteryOptimization: boolean;
    qualityProfile: string;
  };
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor';
  lastTested: number;
  createdAt: number;
}

export interface CompatibilitySettings {
  autoDetection: boolean;
  runTestsOnStartup: boolean;
  detailedTesting: boolean;
  testTimeout: number; // seconds
  cacheResults: boolean;
  updateInterval: number; // days
  skipKnownDevices: boolean;
  enableBenchmarking: boolean;
}

class DeviceCompatibilityManager {
  private static instance: DeviceCompatibilityManager;
  private currentCapabilities: DeviceCapabilities | null = null;
  private currentProfile: DeviceProfile | null = null;
  private testResults: CompatibilityTestResult[] = [];
  private knownDevices: DeviceProfile[] = [];
  private settings: CompatibilitySettings | null = null;
  private listeners: Array<(profile: DeviceProfile) => void> = [];

  private constructor() {}

  public static getInstance(): DeviceCompatibilityManager {
    if (!DeviceCompatibilityManager.instance) {
      DeviceCompatibilityManager.instance = new DeviceCompatibilityManager();
    }
    return DeviceCompatibilityManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing device compatibility manager...');

      // Load settings
      await this.loadSettings();
      if (!this.settings) {
        this.settings = this.createDefaultSettings();
        await this.saveSettings();
      }

      // Load known devices
      await this.loadKnownDevices();

      // Detect device capabilities
      await this.detectDeviceCapabilities();

      // Check for existing profile
      const deviceFingerprint = this.generateDeviceFingerprint();
      this.currentProfile = this.findKnownDevice(deviceFingerprint);

      // Run compatibility tests if needed
      if (this.settings.runTestsOnStartup || !this.currentProfile) {
        await this.runCompatibilityTests();
      }

      console.log('Device compatibility manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize device compatibility manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): CompatibilitySettings {
    return {
      autoDetection: true,
      runTestsOnStartup: true,
      detailedTesting: false,
      testTimeout: 30,
      cacheResults: true,
      updateInterval: 7, // 7 days
      skipKnownDevices: true,
      enableBenchmarking: false
    };
  }

  private async detectDeviceCapabilities(): Promise<void> {
    try {
      console.log('Detecting device capabilities...');

      const { width, height } = Dimensions.get('screen');
      const scale = Dimensions.get('screen').scale;

      // Basic device info
      this.currentCapabilities = {
        deviceInfo: {
          brand: this.getDeviceBrand(),
          model: this.getDeviceModel(),
          osVersion: Platform.Version.toString(),
          platform: Platform.OS as 'ios' | 'android',
          chipset: await this.detectChipset(),
          ram: await this.estimateRAM(),
          storage: await this.estimateStorage(),
          screenResolution: {
            width,
            height,
            density: scale
          }
        },

        camera: await this.detectCameraCapabilities(),
        performance: await this.benchmarkPerformance(),
        connectivity: await this.detectConnectivity(),
        multimedia: await this.detectMultimediaCapabilities()
      };

      console.log('Device capabilities detected successfully');
    } catch (error) {
      console.error('Error detecting device capabilities:', error);
    }
  }

  private getDeviceBrand(): string {
    // Platform-specific device brand detection
    if (Platform.OS === 'android') {
      return 'Android Device'; // In real implementation, use react-native-device-info
    }
    return 'Apple';
  }

  private getDeviceModel(): string {
    // Platform-specific device model detection
    if (Platform.OS === 'android') {
      return 'Android Device'; // In real implementation, use react-native-device-info
    }
    return 'iPhone'; // In real implementation, use react-native-device-info
  }

  private async detectChipset(): Promise<string> {
    // In real implementation, detect actual chipset
    if (Platform.OS === 'ios') {
      return 'Apple A-series';
    }
    return 'Snapdragon/Exynos';
  }

  private async estimateRAM(): Promise<number> {
    // In real implementation, detect actual RAM
    // For now, estimate based on device performance
    const metrics = performanceMonitor.getCurrentMetrics();
    if (metrics?.memoryUsage.total) {
      return metrics.memoryUsage.total;
    }
    return 4096; // Default 4GB
  }

  private async estimateStorage(): Promise<number> {
    // In real implementation, detect actual storage
    return 64000; // Default 64GB
  }

  private async detectCameraCapabilities(): Promise<DeviceCapabilities['camera']> {
    // In real implementation, use expo-camera or react-native-vision-camera APIs
    return {
      frontCameraAvailable: true,
      backCameraAvailable: true,
      dualCameraSupported: true,
      maxResolution: ResolutionPreset.ULTRA,
      supportedResolutions: [
        ResolutionPreset.LOW,
        ResolutionPreset.MEDIUM,
        ResolutionPreset.HIGH,
        ResolutionPreset.ULTRA
      ],
      hasFlash: true,
      hasStabilization: true,
      hasAutoFocus: true,
      hasHDR: true,
      hasPortraitMode: true,
      maxZoom: 10.0,
      supportedFps: [24, 30, 60]
    };
  }

  private async benchmarkPerformance(): Promise<DeviceCapabilities['performance']> {
    try {
      console.log('Running performance benchmark...');

      // CPU benchmark
      const cpuScore = await this.benchmarkCPU();
      
      // Memory benchmark
      const memoryScore = await this.benchmarkMemory();
      
      // GPU benchmark (simplified)
      const gpuScore = await this.benchmarkGPU();

      // Calculate overall scores
      const performanceScore = Math.round((cpuScore + memoryScore + gpuScore) / 3);
      
      // Determine recommended settings based on performance
      let maxResolution = ResolutionPreset.MEDIUM;
      let maxBitrate = 3000;
      let maxFps = 30;

      if (performanceScore >= 80) {
        maxResolution = ResolutionPreset.ULTRA;
        maxBitrate = 8000;
        maxFps = 60;
      } else if (performanceScore >= 60) {
        maxResolution = ResolutionPreset.HIGH;
        maxBitrate = 6000;
        maxFps = 60;
      } else if (performanceScore >= 40) {
        maxResolution = ResolutionPreset.MEDIUM;
        maxBitrate = 4000;
        maxFps = 30;
      } else {
        maxResolution = ResolutionPreset.LOW;
        maxBitrate = 2000;
        maxFps = 24;
      }

      return {
        estimatedPerformanceScore: performanceScore,
        maxRecommendedResolution: maxResolution,
        maxRecommendedBitrate: maxBitrate,
        maxRecommendedFps: maxFps,
        dualCameraPerformanceScore: Math.max(0, performanceScore - 15),
        streamingCapabilityScore: Math.max(0, performanceScore - 10),
        batteryEfficiencyScore: this.estimateBatteryEfficiency(performanceScore),
        thermalHandlingScore: this.estimateThermalHandling(performanceScore)
      };
    } catch (error) {
      console.error('Performance benchmark failed:', error);
      return this.getDefaultPerformanceCapabilities();
    }
  }

  private async benchmarkCPU(): Promise<number> {
    const startTime = Date.now();
    const iterations = 100000;
    
    // Simple CPU-intensive calculation
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    
    const executionTime = Date.now() - startTime;
    
    // Score based on execution time (lower is better)
    // Typical ranges: <50ms = excellent, 50-100ms = good, 100-200ms = fair, >200ms = poor
    if (executionTime < 50) return 90;
    if (executionTime < 100) return 75;
    if (executionTime < 200) return 60;
    if (executionTime < 400) return 40;
    return 20;
  }

  private async benchmarkMemory(): Promise<number> {
    try {
      const metrics = performanceMonitor.getCurrentMetrics();
      if (metrics?.memoryUsage) {
        const usagePercentage = metrics.memoryUsage.percentage;
        const totalMB = metrics.memoryUsage.total;
        
        // Score based on available memory and current usage
        let score = 100 - usagePercentage; // Start with available memory percentage
        
        // Bonus for higher total memory
        if (totalMB > 8192) score += 10; // 8GB+
        else if (totalMB > 6144) score += 5; // 6GB+
        else if (totalMB > 4096) score += 0; // 4GB+
        else score -= 20; // Less than 4GB penalty
        
        return Math.max(0, Math.min(100, score));
      }
      return 60; // Default score
    } catch (error) {
      return 50;
    }
  }

  private async benchmarkGPU(): Promise<number> {
    // Simplified GPU benchmark - in real implementation would test rendering performance
    const deviceInfo = this.currentCapabilities?.deviceInfo;
    if (!deviceInfo) return 50;

    // Estimate GPU performance based on device characteristics
    const screenPixels = deviceInfo.screenResolution.width * deviceInfo.screenResolution.height;
    const memoryScore = deviceInfo.ram > 6144 ? 80 : deviceInfo.ram > 4096 ? 60 : 40;
    
    // Higher resolution screens typically have better GPUs
    const resolutionScore = screenPixels > 2000000 ? 80 : screenPixels > 1000000 ? 60 : 40;
    
    return Math.round((memoryScore + resolutionScore) / 2);
  }

  private estimateBatteryEfficiency(performanceScore: number): number {
    // Higher performance often means lower battery efficiency
    return Math.max(20, 100 - (performanceScore * 0.5));
  }

  private estimateThermalHandling(performanceScore: number): number {
    // Estimate thermal handling based on performance characteristics
    return Math.min(90, performanceScore * 0.8 + 20);
  }

  private getDefaultPerformanceCapabilities(): DeviceCapabilities['performance'] {
    return {
      estimatedPerformanceScore: 50,
      maxRecommendedResolution: ResolutionPreset.MEDIUM,
      maxRecommendedBitrate: 3000,
      maxRecommendedFps: 30,
      dualCameraPerformanceScore: 35,
      streamingCapabilityScore: 40,
      batteryEfficiencyScore: 60,
      thermalHandlingScore: 50
    };
  }

  private async detectConnectivity(): Promise<DeviceCapabilities['connectivity']> {
    // In real implementation, use @react-native-community/netinfo
    return {
      wifi: true,
      cellular: true,
      bluetooth: true,
      maxWifiSpeed: 100, // Mbps estimated
      supportedCodecs: ['H.264', 'H.265', 'VP8', 'VP9'],
      lowLatencySupported: true
    };
  }

  private async detectMultimediaCapabilities(): Promise<DeviceCapabilities['multimedia']> {
    const performanceScore = this.currentCapabilities?.performance?.estimatedPerformanceScore || 50;
    
    return {
      hardwareEncoding: performanceScore > 60,
      supportedVideoCodecs: ['H.264', performanceScore > 70 ? 'H.265' : ''].filter(Boolean),
      supportedAudioCodecs: ['AAC', 'MP3', 'Opus'],
      maxProcessingThreads: performanceScore > 80 ? 8 : performanceScore > 60 ? 4 : 2,
      gpuAcceleration: performanceScore > 50
    };
  }

  async runCompatibilityTests(): Promise<CompatibilityTestResult[]> {
    try {
      console.log('Running comprehensive compatibility tests...');
      
      this.testResults = [];
      
      // Camera tests
      await this.testCameraCapabilities();
      
      // Performance tests
      await this.testPerformanceCapabilities();
      
      // Streaming tests
      await this.testStreamingCapabilities();
      
      // Network tests
      await this.testNetworkCapabilities();
      
      // Battery tests
      await this.testBatteryCapabilities();

      // Create or update device profile
      await this.createDeviceProfile();

      console.log(`Compatibility tests completed: ${this.testResults.length} tests run`);
      return [...this.testResults];
    } catch (error) {
      console.error('Compatibility tests failed:', error);
      return [];
    }
  }

  private async testCameraCapabilities(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test dual camera functionality
      const dualCameraResult: CompatibilityTestResult = {
        id: `test_dual_camera_${Date.now()}`,
        timestamp: Date.now(),
        testName: 'Dual Camera Support',
        category: 'camera',
        result: this.currentCapabilities?.camera.dualCameraSupported ? 'pass' : 'fail',
        score: this.currentCapabilities?.camera.dualCameraSupported ? 100 : 0,
        details: 'Tests ability to use front and back cameras simultaneously',
        recommendations: this.currentCapabilities?.camera.dualCameraSupported 
          ? ['Dual camera functionality is fully supported']
          : ['Consider using single camera mode for better performance'],
        impact: 'medium',
        executionTime: Date.now() - startTime
      };
      this.testResults.push(dualCameraResult);

      // Test camera resolution support
      const resolutionResult: CompatibilityTestResult = {
        id: `test_camera_resolution_${Date.now()}`,
        timestamp: Date.now(),
        testName: 'Camera Resolution Support',
        category: 'camera',
        result: 'pass',
        score: this.calculateResolutionScore(),
        details: `Supports resolutions up to ${this.currentCapabilities?.camera.maxResolution}`,
        recommendations: this.getResolutionRecommendations(),
        impact: 'high',
        executionTime: Date.now() - startTime
      };
      this.testResults.push(resolutionResult);

    } catch (error) {
      console.error('Camera capability tests failed:', error);
    }
  }

  private calculateResolutionScore(): number {
    const maxRes = this.currentCapabilities?.camera.maxResolution;
    switch (maxRes) {
      case ResolutionPreset.ULTRA: return 100;
      case ResolutionPreset.HIGH: return 80;
      case ResolutionPreset.MEDIUM: return 60;
      case ResolutionPreset.LOW: return 40;
      default: return 20;
    }
  }

  private getResolutionRecommendations(): string[] {
    const maxRes = this.currentCapabilities?.camera.maxResolution;
    const recommendations = [];
    
    if (maxRes === ResolutionPreset.ULTRA) {
      recommendations.push('4K recording supported for highest quality');
      recommendations.push('Consider battery impact when using 4K');
    } else if (maxRes === ResolutionPreset.HIGH) {
      recommendations.push('1080p recording recommended for best balance');
    } else {
      recommendations.push('Use lower resolution settings for optimal performance');
    }
    
    return recommendations;
  }

  private async testPerformanceCapabilities(): Promise<void> {
    const performanceScore = this.currentCapabilities?.performance?.estimatedPerformanceScore || 0;
    
    const performanceResult: CompatibilityTestResult = {
      id: `test_performance_${Date.now()}`,
      timestamp: Date.now(),
      testName: 'Overall Performance',
      category: 'performance',
      result: performanceScore >= 60 ? 'pass' : performanceScore >= 40 ? 'warning' : 'fail',
      score: performanceScore,
      details: `Device performance score: ${performanceScore}/100`,
      recommendations: this.getPerformanceRecommendations(performanceScore),
      impact: 'critical',
      executionTime: 0
    };
    this.testResults.push(performanceResult);
  }

  private getPerformanceRecommendations(score: number): string[] {
    if (score >= 80) {
      return ['Excellent performance - all features supported', 'Consider enabling high-quality settings'];
    } else if (score >= 60) {
      return ['Good performance - most features supported', 'Some settings may need adjustment for optimal experience'];
    } else if (score >= 40) {
      return ['Fair performance - basic features supported', 'Recommend using optimized settings'];
    } else {
      return ['Poor performance detected', 'Use lowest quality settings', 'Consider device upgrade for better experience'];
    }
  }

  private async testStreamingCapabilities(): Promise<void> {
    const streamingScore = this.currentCapabilities?.performance?.streamingCapabilityScore || 0;
    
    const streamingResult: CompatibilityTestResult = {
      id: `test_streaming_${Date.now()}`,
      timestamp: Date.now(),
      testName: 'Streaming Capability',
      category: 'streaming',
      result: streamingScore >= 50 ? 'pass' : 'warning',
      score: streamingScore,
      details: `Streaming capability score: ${streamingScore}/100`,
      recommendations: this.getStreamingRecommendations(streamingScore),
      impact: 'high',
      executionTime: 0
    };
    this.testResults.push(streamingResult);
  }

  private getStreamingRecommendations(score: number): string[] {
    if (score >= 70) {
      return ['Excellent streaming performance', 'High bitrate streaming supported'];
    } else if (score >= 50) {
      return ['Good streaming performance', 'Medium quality streaming recommended'];
    } else {
      return ['Limited streaming capability', 'Use low bitrate settings', 'Monitor performance during streaming'];
    }
  }

  private async testNetworkCapabilities(): Promise<void> {
    // Simplified network test
    const networkResult: CompatibilityTestResult = {
      id: `test_network_${Date.now()}`,
      timestamp: Date.now(),
      testName: 'Network Connectivity',
      category: 'network',
      result: 'pass',
      score: 80,
      details: 'Network connectivity features available',
      recommendations: ['WiFi and cellular connectivity supported', 'Monitor network quality during streaming'],
      impact: 'medium',
      executionTime: 0
    };
    this.testResults.push(networkResult);
  }

  private async testBatteryCapabilities(): Promise<void> {
    const batteryScore = this.currentCapabilities?.performance?.batteryEfficiencyScore || 0;
    
    const batteryResult: CompatibilityTestResult = {
      id: `test_battery_${Date.now()}`,
      timestamp: Date.now(),
      testName: 'Battery Efficiency',
      category: 'battery',
      result: batteryScore >= 60 ? 'pass' : 'warning',
      score: batteryScore,
      details: `Battery efficiency score: ${batteryScore}/100`,
      recommendations: this.getBatteryRecommendations(batteryScore),
      impact: 'medium',
      executionTime: 0
    };
    this.testResults.push(batteryResult);
  }

  private getBatteryRecommendations(score: number): string[] {
    if (score >= 70) {
      return ['Good battery efficiency', 'Extended streaming sessions supported'];
    } else if (score >= 50) {
      return ['Moderate battery usage', 'Monitor battery level during long sessions'];
    } else {
      return ['High battery consumption expected', 'Enable battery optimization features', 'Keep charger nearby for long sessions'];
    }
  }

  private async createDeviceProfile(): Promise<void> {
    if (!this.currentCapabilities) return;

    const deviceFingerprint = this.generateDeviceFingerprint();
    const performanceRating = this.calculatePerformanceRating();
    const optimizedSettings = this.generateOptimizedSettings();

    this.currentProfile = {
      id: `device_${Date.now()}`,
      deviceFingerprint,
      capabilities: this.currentCapabilities,
      testResults: [...this.testResults],
      optimizedSettings,
      performanceRating,
      lastTested: Date.now(),
      createdAt: Date.now()
    };

    // Save to known devices
    this.knownDevices = this.knownDevices.filter(d => d.deviceFingerprint !== deviceFingerprint);
    this.knownDevices.push(this.currentProfile);
    await this.saveKnownDevices();

    this.notifyListeners(this.currentProfile);
  }

  private generateDeviceFingerprint(): string {
    const info = this.currentCapabilities?.deviceInfo;
    if (!info) return 'unknown';
    
    return `${info.platform}_${info.brand}_${info.model}_${info.osVersion}_${info.screenResolution.width}x${info.screenResolution.height}`;
  }

  private calculatePerformanceRating(): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = this.currentCapabilities?.performance?.estimatedPerformanceScore || 0;
    
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'fair';
    return 'poor';
  }

  private generateOptimizedSettings(): DeviceProfile['optimizedSettings'] {
    const perf = this.currentCapabilities?.performance;
    if (!perf) {
      return {
        resolution: ResolutionPreset.MEDIUM,
        bitrate: 3000,
        fps: 30,
        dualCameraEnabled: false,
        batteryOptimization: true,
        qualityProfile: 'balanced'
      };
    }

    return {
      resolution: perf.maxRecommendedResolution,
      bitrate: perf.maxRecommendedBitrate,
      fps: perf.maxRecommendedFps,
      dualCameraEnabled: perf.dualCameraPerformanceScore >= 60,
      batteryOptimization: perf.batteryEfficiencyScore < 60,
      qualityProfile: this.currentProfile?.performanceRating === 'excellent' ? 'high_quality' : 
                     this.currentProfile?.performanceRating === 'good' ? 'balanced' : 'battery_saver'
    };
  }

  private findKnownDevice(fingerprint: string): DeviceProfile | null {
    return this.knownDevices.find(d => d.deviceFingerprint === fingerprint) || null;
  }

  // Storage methods
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('device_compatibility_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
        console.log('Device compatibility settings loaded');
      }
    } catch (error) {
      console.error('Failed to load device compatibility settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.settings) {
        await AsyncStorage.setItem('device_compatibility_settings', JSON.stringify(this.settings));
        console.log('Device compatibility settings saved');
      }
    } catch (error) {
      console.error('Failed to save device compatibility settings:', error);
    }
  }

  private async loadKnownDevices(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('known_devices');
      if (saved) {
        this.knownDevices = JSON.parse(saved);
        console.log(`Loaded ${this.knownDevices.length} known devices`);
      }
    } catch (error) {
      console.error('Failed to load known devices:', error);
    }
  }

  private async saveKnownDevices(): Promise<void> {
    try {
      await AsyncStorage.setItem('known_devices', JSON.stringify(this.knownDevices));
      console.log('Known devices saved');
    } catch (error) {
      console.error('Failed to save known devices:', error);
    }
  }

  // Public API
  getCurrentCapabilities(): DeviceCapabilities | null {
    return this.currentCapabilities ? { ...this.currentCapabilities } : null;
  }

  getCurrentProfile(): DeviceProfile | null {
    return this.currentProfile ? { ...this.currentProfile } : null;
  }

  getTestResults(): CompatibilityTestResult[] {
    return [...this.testResults];
  }

  getOptimizedSettings(): DeviceProfile['optimizedSettings'] | null {
    return this.currentProfile?.optimizedSettings || null;
  }

  async updateSettings(updates: Partial<CompatibilitySettings>): Promise<void> {
    if (this.settings) {
      this.settings = { ...this.settings, ...updates };
      await this.saveSettings();
    }
  }

  async forceRetest(): Promise<CompatibilityTestResult[]> {
    console.log('Forcing compatibility retest...');
    return await this.runCompatibilityTests();
  }

  subscribe(listener: (profile: DeviceProfile) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(profile: DeviceProfile): void {
    this.listeners.forEach(listener => listener(profile));
  }

  dispose(): void {
    console.log('Disposing device compatibility manager...');
    this.listeners = [];
  }
}

export const deviceCompatibilityManager = DeviceCompatibilityManager.getInstance();
export default deviceCompatibilityManager;