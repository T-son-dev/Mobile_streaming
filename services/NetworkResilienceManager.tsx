import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceMonitor } from './PerformanceMonitor';
import { streamingService } from './streamingService';

export interface NetworkTest {
  id: string;
  name: string;
  description: string;
  testType: 'latency' | 'bandwidth' | 'stability' | 'packet_loss' | 'jitter' | 'connectivity';
  duration: number; // seconds
  enabled: boolean;
  priority: number;
}

export interface NetworkTestResult {
  testId: string;
  timestamp: number;
  testName: string;
  result: 'pass' | 'fail' | 'warning' | 'error';
  metrics: {
    latency?: number; // ms
    downloadSpeed?: number; // Mbps
    uploadSpeed?: number; // Mbps
    packetLoss?: number; // percentage
    jitter?: number; // ms
    stability?: number; // score 0-100
    connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  };
  details: string;
  recommendations: string[];
  executionTime: number; // ms
  errorMessage?: string;
}

export interface NetworkProfile {
  id: string;
  name: string;
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  characteristics: {
    averageLatency: number;
    averageDownload: number;
    averageUpload: number;
    reliability: number; // 0-100
    stability: number; // 0-100
    qualityScore: number; // 0-100
  };
  recommendations: {
    maxResolution: '480p' | '720p' | '1080p' | '4K';
    maxBitrate: number;
    adaptiveQuality: boolean;
    bufferSize: 'small' | 'medium' | 'large';
  };
  testHistory: NetworkTestResult[];
  createdAt: number;
  lastTested: number;
}

export interface NetworkEvent {
  id: string;
  timestamp: number;
  type: 'connection_lost' | 'connection_restored' | 'speed_degraded' | 'speed_improved' | 'high_latency' | 'packet_loss_detected';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metrics: any;
  impact: string;
  autoRecovered: boolean;
  recoveryTime?: number; // ms
}

export interface NetworkResilienceSettings {
  enabled: boolean;
  continuousMonitoring: boolean;
  testInterval: number; // seconds
  alertThresholds: {
    latency: number; // ms
    packetLoss: number; // percentage
    speedDegradation: number; // percentage
    connectionTimeout: number; // seconds
  };
  autoAdaptation: boolean;
  retrySettings: {
    maxRetries: number;
    retryDelay: number; // ms
    exponentialBackoff: boolean;
  };
  failoverSettings: {
    enabled: boolean;
    switchToMobileData: boolean;
    qualityDowngrade: boolean;
  };
}

class NetworkResilienceManager {
  private static instance: NetworkResilienceManager;
  private isMonitoring = false;
  private settings: NetworkResilienceSettings | null = null;
  private currentProfile: NetworkProfile | null = null;
  private networkProfiles: NetworkProfile[] = [];
  private testResults: NetworkTestResult[] = [];
  private networkEvents: NetworkEvent[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastNetworkState: any = null;
  private listeners: Array<(event: NetworkEvent) => void> = [];

  private readonly defaultTests: NetworkTest[] = [
    {
      id: 'latency_test',
      name: 'Latency Test',
      description: 'Measures round-trip time to streaming servers',
      testType: 'latency',
      duration: 10,
      enabled: true,
      priority: 10
    },
    {
      id: 'bandwidth_test',
      name: 'Bandwidth Test',
      description: 'Tests upload and download speeds',
      testType: 'bandwidth',
      duration: 15,
      enabled: true,
      priority: 9
    },
    {
      id: 'stability_test',
      name: 'Connection Stability',
      description: 'Tests connection consistency over time',
      testType: 'stability',
      duration: 30,
      enabled: true,
      priority: 8
    },
    {
      id: 'packet_loss_test',
      name: 'Packet Loss Test',
      description: 'Measures packet loss percentage',
      testType: 'packet_loss',
      duration: 20,
      enabled: true,
      priority: 7
    },
    {
      id: 'jitter_test',
      name: 'Jitter Test',
      description: 'Measures variation in packet arrival times',
      testType: 'jitter',
      duration: 15,
      enabled: true,
      priority: 6
    }
  ];

  private constructor() {}

  public static getInstance(): NetworkResilienceManager {
    if (!NetworkResilienceManager.instance) {
      NetworkResilienceManager.instance = new NetworkResilienceManager();
    }
    return NetworkResilienceManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing network resilience manager...');

      // Load settings
      await this.loadSettings();
      if (!this.settings) {
        this.settings = this.createDefaultSettings();
        await this.saveSettings();
      }

      // Load network profiles
      await this.loadNetworkProfiles();

      // Detect current network
      await this.detectCurrentNetwork();

      // Start monitoring if enabled
      if (this.settings.continuousMonitoring) {
        this.startMonitoring();
      }

      console.log('Network resilience manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize network resilience manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): NetworkResilienceSettings {
    return {
      enabled: true,
      continuousMonitoring: true,
      testInterval: 60, // 1 minute
      alertThresholds: {
        latency: 200, // ms
        packetLoss: 5, // percentage
        speedDegradation: 50, // percentage
        connectionTimeout: 10 // seconds
      },
      autoAdaptation: true,
      retrySettings: {
        maxRetries: 3,
        retryDelay: 1000, // 1 second
        exponentialBackoff: true
      },
      failoverSettings: {
        enabled: true,
        switchToMobileData: false,
        qualityDowngrade: true
      }
    };
  }

  async runNetworkTests(): Promise<NetworkTestResult[]> {
    try {
      console.log('Running comprehensive network tests...');
      
      const results: NetworkTestResult[] = [];
      
      for (const test of this.defaultTests) {
        if (!test.enabled) continue;
        
        console.log(`Running ${test.name}...`);
        const result = await this.executeTest(test);
        results.push(result);
        
        // Add delay between tests
        await this.delay(1000);
      }

      // Store results
      this.testResults = [...this.testResults, ...results];
      
      // Limit history size
      if (this.testResults.length > 100) {
        this.testResults = this.testResults.slice(-100);
      }

      // Update current network profile
      await this.updateNetworkProfile(results);

      console.log(`Network tests completed: ${results.length} tests run`);
      return results;
    } catch (error) {
      console.error('Network tests failed:', error);
      return [];
    }
  }

  private async executeTest(test: NetworkTest): Promise<NetworkTestResult> {
    const startTime = Date.now();
    
    try {
      let result: NetworkTestResult;

      switch (test.testType) {
        case 'latency':
          result = await this.testLatency(test);
          break;
        case 'bandwidth':
          result = await this.testBandwidth(test);
          break;
        case 'stability':
          result = await this.testStability(test);
          break;
        case 'packet_loss':
          result = await this.testPacketLoss(test);
          break;
        case 'jitter':
          result = await this.testJitter(test);
          break;
        case 'connectivity':
          result = await this.testConnectivity(test);
          break;
        default:
          throw new Error(`Unknown test type: ${test.testType}`);
      }

      result.executionTime = Date.now() - startTime;
      return result;

    } catch (error) {
      return {
        testId: test.id,
        timestamp: Date.now(),
        testName: test.name,
        result: 'error',
        metrics: {},
        details: `Test failed: ${error}`,
        recommendations: ['Check network connection', 'Try running test again'],
        executionTime: Date.now() - startTime,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testLatency(test: NetworkTest): Promise<NetworkTestResult> {
    const measurements: number[] = [];
    const targetUrl = 'https://8.8.8.8'; // Google DNS for latency testing
    
    // Perform multiple ping measurements
    for (let i = 0; i < 10; i++) {
      const pingTime = await this.measurePingTime(targetUrl);
      if (pingTime > 0) {
        measurements.push(pingTime);
      }
      await this.delay(500);
    }

    if (measurements.length === 0) {
      throw new Error('Unable to measure latency');
    }

    const averageLatency = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const maxLatency = Math.max(...measurements);
    const minLatency = Math.min(...measurements);

    let result: 'pass' | 'warning' | 'fail' = 'pass';
    if (averageLatency > 300) result = 'fail';
    else if (averageLatency > 150) result = 'warning';

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      result,
      metrics: {
        latency: Math.round(averageLatency)
      },
      details: `Average: ${averageLatency.toFixed(1)}ms, Min: ${minLatency.toFixed(1)}ms, Max: ${maxLatency.toFixed(1)}ms`,
      recommendations: this.getLatencyRecommendations(averageLatency),
      executionTime: 0
    };
  }

  private async measurePingTime(url: string): Promise<number> {
    try {
      const startTime = Date.now();
      
      // Simulate network request (in real implementation, use actual ping)
      const response = await fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        return Date.now() - startTime;
      }
      return -1;
    } catch (error) {
      return -1;
    }
  }

  private getLatencyRecommendations(latency: number): string[] {
    if (latency < 50) {
      return ['Excellent latency for streaming', 'All quality settings supported'];
    } else if (latency < 100) {
      return ['Good latency for streaming', 'High quality streaming recommended'];
    } else if (latency < 200) {
      return ['Moderate latency', 'Medium quality recommended', 'Monitor for fluctuations'];
    } else {
      return ['High latency detected', 'Use lower quality settings', 'Consider switching networks'];
    }
  }

  private async testBandwidth(test: NetworkTest): Promise<NetworkTestResult> {
    // Simulate bandwidth testing (in real implementation, use actual speed test)
    const downloadSpeed = await this.measureDownloadSpeed();
    const uploadSpeed = await this.measureUploadSpeed();

    let result: 'pass' | 'warning' | 'fail' = 'pass';
    if (uploadSpeed < 1) result = 'fail';
    else if (uploadSpeed < 3) result = 'warning';

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      result,
      metrics: {
        downloadSpeed: Math.round(downloadSpeed * 100) / 100,
        uploadSpeed: Math.round(uploadSpeed * 100) / 100
      },
      details: `Download: ${downloadSpeed.toFixed(2)} Mbps, Upload: ${uploadSpeed.toFixed(2)} Mbps`,
      recommendations: this.getBandwidthRecommendations(uploadSpeed),
      executionTime: 0
    };
  }

  private async measureDownloadSpeed(): Promise<number> {
    // Simulate download speed measurement
    const metrics = performanceMonitor.getCurrentMetrics();
    const baseSpeed = metrics?.networkSpeed?.download || 10;
    
    // Add some variation
    return baseSpeed * (0.8 + Math.random() * 0.4);
  }

  private async measureUploadSpeed(): Promise<number> {
    // Simulate upload speed measurement
    const metrics = performanceMonitor.getCurrentMetrics();
    const baseSpeed = metrics?.networkSpeed?.upload || 5;
    
    // Add some variation
    return baseSpeed * (0.8 + Math.random() * 0.4);
  }

  private getBandwidthRecommendations(uploadSpeed: number): string[] {
    if (uploadSpeed >= 10) {
      return ['Excellent bandwidth for 4K streaming', 'All quality settings supported'];
    } else if (uploadSpeed >= 6) {
      return ['Good bandwidth for 1080p streaming', 'High quality recommended'];
    } else if (uploadSpeed >= 3) {
      return ['Moderate bandwidth for 720p streaming', 'Medium quality recommended'];
    } else if (uploadSpeed >= 1) {
      return ['Limited bandwidth', 'Use 480p or lower quality', 'Consider switching networks'];
    } else {
      return ['Insufficient bandwidth for streaming', 'Check network connection', 'Switch to better network'];
    }
  }

  private async testStability(test: NetworkTest): Promise<NetworkTestResult> {
    const measurements: number[] = [];
    const testDuration = test.duration * 1000; // Convert to milliseconds
    const startTime = Date.now();
    
    // Take measurements every 2 seconds
    while (Date.now() - startTime < testDuration) {
      const speed = await this.measureUploadSpeed();
      measurements.push(speed);
      await this.delay(2000);
    }

    if (measurements.length < 2) {
      throw new Error('Insufficient data for stability test');
    }

    // Calculate stability score based on variation
    const average = measurements.reduce((sum, val) => sum + val, 0) / measurements.length;
    const variance = measurements.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / measurements.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / average) * 100;

    // Lower coefficient of variation = more stable
    const stability = Math.max(0, 100 - coefficientOfVariation * 2);

    let result: 'pass' | 'warning' | 'fail' = 'pass';
    if (stability < 60) result = 'fail';
    else if (stability < 80) result = 'warning';

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      result,
      metrics: {
        stability: Math.round(stability)
      },
      details: `Connection stability: ${stability.toFixed(1)}%, Variation: ${coefficientOfVariation.toFixed(1)}%`,
      recommendations: this.getStabilityRecommendations(stability),
      executionTime: 0
    };
  }

  private getStabilityRecommendations(stability: number): string[] {
    if (stability >= 90) {
      return ['Excellent connection stability', 'Reliable for continuous streaming'];
    } else if (stability >= 70) {
      return ['Good connection stability', 'Suitable for most streaming scenarios'];
    } else if (stability >= 50) {
      return ['Moderate stability', 'Enable adaptive quality', 'Monitor connection quality'];
    } else {
      return ['Poor connection stability', 'Use lower quality settings', 'Enable aggressive buffering', 'Consider switching networks'];
    }
  }

  private async testPacketLoss(test: NetworkTest): Promise<NetworkTestResult> {
    // Simulate packet loss testing
    const packetsToSend = 50;
    const packetsSent = packetsToSend;
    const packetsLost = Math.floor(Math.random() * 3); // Simulate 0-2 packets lost
    const packetLossPercentage = (packetsLost / packetsSent) * 100;

    let result: 'pass' | 'warning' | 'fail' = 'pass';
    if (packetLossPercentage > 5) result = 'fail';
    else if (packetLossPercentage > 2) result = 'warning';

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      result,
      metrics: {
        packetLoss: Math.round(packetLossPercentage * 100) / 100
      },
      details: `${packetsLost}/${packetsSent} packets lost (${packetLossPercentage.toFixed(2)}%)`,
      recommendations: this.getPacketLossRecommendations(packetLossPercentage),
      executionTime: 0
    };
  }

  private getPacketLossRecommendations(packetLoss: number): string[] {
    if (packetLoss === 0) {
      return ['No packet loss detected', 'Excellent for streaming'];
    } else if (packetLoss < 1) {
      return ['Minimal packet loss', 'Good for streaming'];
    } else if (packetLoss < 3) {
      return ['Low packet loss', 'May cause occasional quality issues', 'Enable buffering'];
    } else {
      return ['High packet loss detected', 'Streaming quality affected', 'Check network connection', 'Consider switching networks'];
    }
  }

  private async testJitter(test: NetworkTest): Promise<NetworkTestResult> {
    // Simulate jitter testing
    const jitterValue = Math.random() * 20; // 0-20ms jitter

    let result: 'pass' | 'warning' | 'fail' = 'pass';
    if (jitterValue > 15) result = 'fail';
    else if (jitterValue > 8) result = 'warning';

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      result,
      metrics: {
        jitter: Math.round(jitterValue * 100) / 100
      },
      details: `Network jitter: ${jitterValue.toFixed(2)}ms`,
      recommendations: this.getJitterRecommendations(jitterValue),
      executionTime: 0
    };
  }

  private getJitterRecommendations(jitter: number): string[] {
    if (jitter < 5) {
      return ['Low jitter - excellent for streaming', 'Real-time streaming supported'];
    } else if (jitter < 10) {
      return ['Moderate jitter', 'Enable buffering for better experience'];
    } else {
      return ['High jitter detected', 'May cause streaming interruptions', 'Use larger buffer sizes', 'Consider network optimization'];
    }
  }

  private async testConnectivity(test: NetworkTest): Promise<NetworkTestResult> {
    try {
      // Test basic connectivity
      const response = await fetch('https://google.com', { 
        method: 'HEAD',
        timeout: 10000
      });

      const result = response.ok ? 'pass' : 'fail';

      return {
        testId: test.id,
        timestamp: Date.now(),
        testName: test.name,
        result,
        metrics: {
          connectionQuality: response.ok ? 'good' : 'poor'
        },
        details: response.ok ? 'Internet connectivity available' : 'No internet connectivity',
        recommendations: response.ok 
          ? ['Internet connection is working'] 
          : ['Check internet connection', 'Verify network settings'],
        executionTime: 0
      };
    } catch (error) {
      return {
        testId: test.id,
        timestamp: Date.now(),
        testName: test.name,
        result: 'fail',
        metrics: {
          connectionQuality: 'poor'
        },
        details: 'Connectivity test failed',
        recommendations: ['Check internet connection', 'Verify network settings'],
        executionTime: 0,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async detectCurrentNetwork(): Promise<void> {
    try {
      // In real implementation, use @react-native-community/netinfo
      const networkType = 'wifi'; // Simulated
      
      // Find existing profile or create new one
      const profileId = `${networkType}_${Date.now()}`;
      this.currentProfile = this.networkProfiles.find(p => p.type === networkType) || {
        id: profileId,
        name: `${networkType.toUpperCase()} Network`,
        type: networkType as 'wifi' | 'cellular',
        characteristics: {
          averageLatency: 0,
          averageDownload: 0,
          averageUpload: 0,
          reliability: 0,
          stability: 0,
          qualityScore: 0
        },
        recommendations: {
          maxResolution: '720p',
          maxBitrate: 3000,
          adaptiveQuality: true,
          bufferSize: 'medium'
        },
        testHistory: [],
        createdAt: Date.now(),
        lastTested: 0
      };

      console.log(`Current network detected: ${this.currentProfile.name}`);
    } catch (error) {
      console.error('Failed to detect current network:', error);
    }
  }

  private async updateNetworkProfile(results: NetworkTestResult[]): Promise<void> {
    if (!this.currentProfile) return;

    try {
      // Update test history
      this.currentProfile.testHistory = [...this.currentProfile.testHistory, ...results];
      
      // Limit history size
      if (this.currentProfile.testHistory.length > 50) {
        this.currentProfile.testHistory = this.currentProfile.testHistory.slice(-50);
      }

      // Calculate updated characteristics
      const recentResults = this.currentProfile.testHistory.slice(-10); // Last 10 tests
      
      const latencies = recentResults.map(r => r.metrics.latency).filter(l => l !== undefined) as number[];
      const downloads = recentResults.map(r => r.metrics.downloadSpeed).filter(d => d !== undefined) as number[];
      const uploads = recentResults.map(r => r.metrics.uploadSpeed).filter(u => u !== undefined) as number[];
      const stabilities = recentResults.map(r => r.metrics.stability).filter(s => s !== undefined) as number[];

      if (latencies.length > 0) {
        this.currentProfile.characteristics.averageLatency = latencies.reduce((sum, val) => sum + val, 0) / latencies.length;
      }
      
      if (downloads.length > 0) {
        this.currentProfile.characteristics.averageDownload = downloads.reduce((sum, val) => sum + val, 0) / downloads.length;
      }
      
      if (uploads.length > 0) {
        this.currentProfile.characteristics.averageUpload = uploads.reduce((sum, val) => sum + val, 0) / uploads.length;
      }
      
      if (stabilities.length > 0) {
        this.currentProfile.characteristics.stability = stabilities.reduce((sum, val) => sum + val, 0) / stabilities.length;
      }

      // Calculate reliability based on test success rate
      const successfulTests = recentResults.filter(r => r.result === 'pass').length;
      this.currentProfile.characteristics.reliability = (successfulTests / recentResults.length) * 100;

      // Calculate overall quality score
      this.currentProfile.characteristics.qualityScore = this.calculateQualityScore(this.currentProfile.characteristics);

      // Update recommendations
      this.updateNetworkRecommendations();

      this.currentProfile.lastTested = Date.now();

      // Save profile
      await this.saveNetworkProfiles();

      console.log(`Network profile updated: ${this.currentProfile.name}`);
    } catch (error) {
      console.error('Failed to update network profile:', error);
    }
  }

  private calculateQualityScore(characteristics: NetworkProfile['characteristics']): number {
    // Weight different factors
    const latencyScore = Math.max(0, 100 - (characteristics.averageLatency / 2)); // 200ms = 0 score
    const uploadScore = Math.min(100, characteristics.averageUpload * 10); // 10 Mbps = 100 score
    const reliabilityScore = characteristics.reliability;
    const stabilityScore = characteristics.stability;

    return Math.round((latencyScore * 0.3 + uploadScore * 0.4 + reliabilityScore * 0.2 + stabilityScore * 0.1));
  }

  private updateNetworkRecommendations(): void {
    if (!this.currentProfile) return;

    const upload = this.currentProfile.characteristics.averageUpload;
    const stability = this.currentProfile.characteristics.stability;
    const quality = this.currentProfile.characteristics.qualityScore;

    // Determine max resolution
    if (upload >= 8 && stability >= 80) {
      this.currentProfile.recommendations.maxResolution = '4K';
      this.currentProfile.recommendations.maxBitrate = 8000;
    } else if (upload >= 5 && stability >= 70) {
      this.currentProfile.recommendations.maxResolution = '1080p';
      this.currentProfile.recommendations.maxBitrate = 6000;
    } else if (upload >= 3 && stability >= 60) {
      this.currentProfile.recommendations.maxResolution = '720p';
      this.currentProfile.recommendations.maxBitrate = 4000;
    } else {
      this.currentProfile.recommendations.maxResolution = '480p';
      this.currentProfile.recommendations.maxBitrate = 2000;
    }

    // Determine adaptive quality and buffer size
    this.currentProfile.recommendations.adaptiveQuality = stability < 80;
    
    if (stability >= 90) {
      this.currentProfile.recommendations.bufferSize = 'small';
    } else if (stability >= 70) {
      this.currentProfile.recommendations.bufferSize = 'medium';
    } else {
      this.currentProfile.recommendations.bufferSize = 'large';
    }
  }

  startMonitoring(): void {
    if (this.isMonitoring || !this.settings?.continuousMonitoring) {
      return;
    }

    console.log('Starting network resilience monitoring');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      await this.performMonitoringCheck();
    }, (this.settings.testInterval || 60) * 1000);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    console.log('Stopping network resilience monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async performMonitoringCheck(): Promise<void> {
    try {
      // Run basic network tests
      const latencyTest = this.defaultTests.find(t => t.id === 'latency_test');
      if (latencyTest) {
        const result = await this.executeTest(latencyTest);
        
        // Check for network events
        this.checkForNetworkEvents(result);
        
        // Auto-adapt if enabled
        if (this.settings?.autoAdaptation) {
          await this.handleAutoAdaptation(result);
        }
      }
    } catch (error) {
      console.error('Monitoring check failed:', error);
    }
  }

  private checkForNetworkEvents(result: NetworkTestResult): void {
    if (!this.settings) return;

    const latency = result.metrics.latency;
    
    // Check for high latency
    if (latency && latency > this.settings.alertThresholds.latency) {
      this.recordNetworkEvent({
        type: 'high_latency',
        severity: latency > this.settings.alertThresholds.latency * 2 ? 'high' : 'medium',
        description: `High latency detected: ${latency}ms`,
        metrics: { latency },
        impact: 'Streaming quality may be affected'
      });
    }

    // Additional event checks would go here
  }

  private recordNetworkEvent(eventData: Omit<NetworkEvent, 'id' | 'timestamp' | 'autoRecovered'>): void {
    const event: NetworkEvent = {
      ...eventData,
      id: `event_${Date.now()}`,
      timestamp: Date.now(),
      autoRecovered: false
    };

    this.networkEvents.push(event);
    
    // Limit events history
    if (this.networkEvents.length > 100) {
      this.networkEvents.shift();
    }

    this.notifyListeners(event);
    console.warn(`Network event: ${event.description}`);
  }

  private async handleAutoAdaptation(result: NetworkTestResult): Promise<void> {
    // Implement automatic quality adaptation based on network conditions
    if (result.result === 'fail' || result.result === 'warning') {
      console.log('Auto-adapting to network conditions...');
      
      // In real implementation, would adjust streaming quality
      if (streamingService.isStreamingActive()) {
        // Lower quality based on network conditions
        await streamingService.updateStreamQuality('720p');
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Storage methods
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('network_resilience_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
        console.log('Network resilience settings loaded');
      }
    } catch (error) {
      console.error('Failed to load network resilience settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.settings) {
        await AsyncStorage.setItem('network_resilience_settings', JSON.stringify(this.settings));
        console.log('Network resilience settings saved');
      }
    } catch (error) {
      console.error('Failed to save network resilience settings:', error);
    }
  }

  private async loadNetworkProfiles(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('network_profiles');
      if (saved) {
        this.networkProfiles = JSON.parse(saved);
        console.log(`Loaded ${this.networkProfiles.length} network profiles`);
      }
    } catch (error) {
      console.error('Failed to load network profiles:', error);
    }
  }

  private async saveNetworkProfiles(): Promise<void> {
    try {
      await AsyncStorage.setItem('network_profiles', JSON.stringify(this.networkProfiles));
      console.log('Network profiles saved');
    } catch (error) {
      console.error('Failed to save network profiles:', error);
    }
  }

  // Public API
  async updateSettings(updates: Partial<NetworkResilienceSettings>): Promise<void> {
    if (this.settings) {
      this.settings = { ...this.settings, ...updates };
      await this.saveSettings();

      // Restart monitoring if interval changed
      if (updates.testInterval && this.isMonitoring) {
        this.stopMonitoring();
        this.startMonitoring();
      }
    }
  }

  getCurrentProfile(): NetworkProfile | null {
    return this.currentProfile ? { ...this.currentProfile } : null;
  }

  getTestResults(): NetworkTestResult[] {
    return [...this.testResults];
  }

  getNetworkEvents(): NetworkEvent[] {
    return [...this.networkEvents];
  }

  getNetworkProfiles(): NetworkProfile[] {
    return [...this.networkProfiles];
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  subscribe(listener: (event: NetworkEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(event: NetworkEvent): void {
    this.listeners.forEach(listener => listener(event));
  }

  dispose(): void {
    console.log('Disposing network resilience manager...');
    this.stopMonitoring();
    this.listeners = [];
  }
}

export const networkResilienceManager = NetworkResilienceManager.getInstance();
export default networkResilienceManager;