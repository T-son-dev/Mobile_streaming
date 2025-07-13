import AsyncStorage from '@react-native-async-storage/async-storage';
import { streamingService } from './streamingService';
import { dualCameraManager } from './DualCameraManager';
import { videoComposer } from './VideoComposer';

export interface PerformanceMetrics {
  // System Metrics
  memoryUsage: {
    used: number; // MB
    total: number; // MB
    percentage: number;
  };
  cpuUsage: {
    percentage: number;
    cores: number;
  };
  batteryLevel: number; // percentage
  thermalState: 'normal' | 'fair' | 'serious' | 'critical';
  
  // Network Metrics
  networkSpeed: {
    upload: number; // kbps
    download: number; // kbps
    latency: number; // ms
  };
  
  // Streaming Metrics
  streamingStats: {
    bitrate: number; // kbps
    fps: number;
    resolution: string;
    droppedFrames: number;
    totalFrames: number;
    duration: number; // seconds
  };
  
  // Camera Metrics
  cameraStats: {
    frontCameraActive: boolean;
    backCameraActive: boolean;
    processingTime: number; // ms per frame
    captureLatency: number; // ms
  };
  
  // Performance Scores
  overallScore: number; // 0-100
  stabilityScore: number; // 0-100
  qualityScore: number; // 0-100
  
  timestamp: number;
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  resolved: boolean;
}

export interface PerformanceThresholds {
  memory: {
    warning: number; // MB
    critical: number; // MB
  };
  cpu: {
    warning: number; // percentage
    critical: number; // percentage
  };
  battery: {
    warning: number; // percentage
    critical: number; // percentage
  };
  fps: {
    warning: number; // fps
    critical: number; // fps
  };
  droppedFrames: {
    warning: number; // percentage
    critical: number; // percentage
  };
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metricsHistory: PerformanceMetrics[] = [];
  private activeAlerts: PerformanceAlert[] = [];
  private listeners: Array<(metrics: PerformanceMetrics) => void> = [];
  private alertListeners: Array<(alert: PerformanceAlert) => void> = [];
  
  private thresholds: PerformanceThresholds = {
    memory: { warning: 300, critical: 400 },
    cpu: { warning: 70, critical: 85 },
    battery: { warning: 20, critical: 10 },
    fps: { warning: 20, critical: 15 },
    droppedFrames: { warning: 5, critical: 10 }
  };

  private lastMetrics: PerformanceMetrics | null = null;

  private constructor() {}

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing performance monitor...');
      
      // Load saved thresholds
      await this.loadThresholds();
      
      // Clear old metrics history
      this.metricsHistory = [];
      this.activeAlerts = [];
      
      console.log('Performance monitor initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize performance monitor:', error);
      return false;
    }
  }

  startMonitoring(intervalMs = 1000): void {
    if (this.isMonitoring) {
      console.warn('Performance monitoring already running');
      return;
    }

    console.log(`Starting performance monitoring with ${intervalMs}ms interval`);
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(async () => {
      try {
        const metrics = await this.collectMetrics();
        this.processMetrics(metrics);
      } catch (error) {
        console.error('Error collecting performance metrics:', error);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('Performance monitoring not running');
      return;
    }

    console.log('Stopping performance monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async collectMetrics(): Promise<PerformanceMetrics> {
    const timestamp = Date.now();

    // Collect system metrics
    const memoryUsage = await this.getMemoryUsage();
    const cpuUsage = await this.getCPUUsage();
    const batteryLevel = await this.getBatteryLevel();
    const thermalState = await this.getThermalState();

    // Collect network metrics
    const networkSpeed = await this.getNetworkSpeed();

    // Collect streaming metrics
    const streamingStats = this.getStreamingStats();

    // Collect camera metrics
    const cameraStats = await this.getCameraStats();

    // Calculate performance scores
    const scores = this.calculatePerformanceScores({
      memoryUsage,
      cpuUsage,
      batteryLevel,
      streamingStats,
      cameraStats
    });

    const metrics: PerformanceMetrics = {
      memoryUsage,
      cpuUsage,
      batteryLevel,
      thermalState,
      networkSpeed,
      streamingStats,
      cameraStats,
      ...scores,
      timestamp
    };

    return metrics;
  }

  private async getMemoryUsage(): Promise<PerformanceMetrics['memoryUsage']> {
    // In a real implementation, this would use native memory monitoring
    // For now, we'll simulate realistic memory usage
    const used = Math.floor(Math.random() * 100) + 200; // 200-300 MB
    const total = 8192; // 8GB typical mobile device
    const percentage = (used / total) * 100;

    return { used, total, percentage };
  }

  private async getCPUUsage(): Promise<PerformanceMetrics['cpuUsage']> {
    // In a real implementation, this would use native CPU monitoring
    // Simulate CPU usage based on streaming state
    const isStreaming = streamingService.isStreamingActive();
    const baseUsage = isStreaming ? 40 : 10;
    const variance = Math.random() * 20;
    const percentage = Math.min(100, baseUsage + variance);

    return { percentage, cores: 8 }; // Typical mobile CPU
  }

  private async getBatteryLevel(): Promise<number> {
    // In a real implementation, this would use expo-battery or similar
    // For now, simulate decreasing battery
    return Math.max(0, 100 - Math.floor(Date.now() / 100000) % 100);
  }

  private async getThermalState(): Promise<PerformanceMetrics['thermalState']> {
    // In a real implementation, this would monitor device temperature
    // Simulate thermal state based on usage
    const isStreaming = streamingService.isStreamingActive();
    const states: PerformanceMetrics['thermalState'][] = ['normal', 'fair', 'serious', 'critical'];
    
    if (isStreaming) {
      // Higher thermal load when streaming
      return states[Math.floor(Math.random() * 3)]; // normal, fair, or serious
    } else {
      return 'normal';
    }
  }

  private async getNetworkSpeed(): Promise<PerformanceMetrics['networkSpeed']> {
    // In a real implementation, this would measure actual network performance
    // For now, simulate network conditions
    const upload = Math.floor(Math.random() * 5000) + 1000; // 1-6 Mbps
    const download = upload * 2; // Download typically faster
    const latency = Math.floor(Math.random() * 50) + 20; // 20-70ms

    return { upload, download, latency };
  }

  private getStreamingStats(): PerformanceMetrics['streamingStats'] {
    const stats = streamingService.getStreamStats();
    
    return {
      bitrate: parseInt(stats.bitrate.replace('kbps', '')),
      fps: parseInt(stats.fps.replace('fps', '')),
      resolution: stats.quality || '720p',
      droppedFrames: stats.droppedFrames || 0,
      totalFrames: stats.totalFrames || 0,
      duration: stats.duration || 0
    };
  }

  private async getCameraStats(): Promise<PerformanceMetrics['cameraStats']> {
    const cameraState = dualCameraManager.getState();
    
    return {
      frontCameraActive: cameraState.frontCamera.isActive,
      backCameraActive: cameraState.backCamera.isActive,
      processingTime: Math.random() * 10 + 5, // 5-15ms typical
      captureLatency: Math.random() * 20 + 10 // 10-30ms typical
    };
  }

  private calculatePerformanceScores(data: any): {
    overallScore: number;
    stabilityScore: number;
    qualityScore: number;
  } {
    // Calculate stability score based on system resources
    const memoryScore = Math.max(0, 100 - (data.memoryUsage.percentage * 2));
    const cpuScore = Math.max(0, 100 - data.cpuUsage.percentage);
    const batteryScore = Math.max(0, data.batteryLevel);
    
    const stabilityScore = Math.floor((memoryScore + cpuScore + batteryScore) / 3);

    // Calculate quality score based on streaming performance
    const fpsScore = Math.min(100, (data.streamingStats.fps / 30) * 100);
    const dropScore = Math.max(0, 100 - (data.streamingStats.droppedFrames / Math.max(1, data.streamingStats.totalFrames) * 1000));
    const bitrateScore = Math.min(100, (data.streamingStats.bitrate / 6000) * 100);
    
    const qualityScore = Math.floor((fpsScore + dropScore + bitrateScore) / 3);

    // Overall score is weighted average
    const overallScore = Math.floor((stabilityScore * 0.6) + (qualityScore * 0.4));

    return { overallScore, stabilityScore, qualityScore };
  }

  private processMetrics(metrics: PerformanceMetrics): void {
    // Store metrics
    this.lastMetrics = metrics;
    this.metricsHistory.push(metrics);
    
    // Keep only recent history (last 100 measurements)
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }

    // Check for alerts
    this.checkAlerts(metrics);

    // Notify listeners
    this.notifyMetricsListeners(metrics);
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    const alerts: PerformanceAlert[] = [];

    // Memory alerts
    if (metrics.memoryUsage.used > this.thresholds.memory.critical) {
      alerts.push(this.createAlert('critical', 'Memory usage critical', 'memory', metrics.memoryUsage.used, this.thresholds.memory.critical));
    } else if (metrics.memoryUsage.used > this.thresholds.memory.warning) {
      alerts.push(this.createAlert('warning', 'High memory usage', 'memory', metrics.memoryUsage.used, this.thresholds.memory.warning));
    }

    // CPU alerts
    if (metrics.cpuUsage.percentage > this.thresholds.cpu.critical) {
      alerts.push(this.createAlert('critical', 'CPU usage critical', 'cpu', metrics.cpuUsage.percentage, this.thresholds.cpu.critical));
    } else if (metrics.cpuUsage.percentage > this.thresholds.cpu.warning) {
      alerts.push(this.createAlert('warning', 'High CPU usage', 'cpu', metrics.cpuUsage.percentage, this.thresholds.cpu.warning));
    }

    // Battery alerts
    if (metrics.batteryLevel < this.thresholds.battery.critical) {
      alerts.push(this.createAlert('critical', 'Battery critically low', 'battery', metrics.batteryLevel, this.thresholds.battery.critical));
    } else if (metrics.batteryLevel < this.thresholds.battery.warning) {
      alerts.push(this.createAlert('warning', 'Battery low', 'battery', metrics.batteryLevel, this.thresholds.battery.warning));
    }

    // FPS alerts
    if (metrics.streamingStats.fps < this.thresholds.fps.critical) {
      alerts.push(this.createAlert('critical', 'Frame rate critically low', 'fps', metrics.streamingStats.fps, this.thresholds.fps.critical));
    } else if (metrics.streamingStats.fps < this.thresholds.fps.warning) {
      alerts.push(this.createAlert('warning', 'Low frame rate', 'fps', metrics.streamingStats.fps, this.thresholds.fps.warning));
    }

    // Dropped frames alerts
    const dropPercentage = (metrics.streamingStats.droppedFrames / Math.max(1, metrics.streamingStats.totalFrames)) * 100;
    if (dropPercentage > this.thresholds.droppedFrames.critical) {
      alerts.push(this.createAlert('critical', 'High frame drop rate', 'droppedFrames', dropPercentage, this.thresholds.droppedFrames.critical));
    } else if (dropPercentage > this.thresholds.droppedFrames.warning) {
      alerts.push(this.createAlert('warning', 'Frames being dropped', 'droppedFrames', dropPercentage, this.thresholds.droppedFrames.warning));
    }

    // Process new alerts
    alerts.forEach(alert => {
      this.addAlert(alert);
    });
  }

  private createAlert(type: PerformanceAlert['type'], message: string, metric: string, value: number, threshold: number): PerformanceAlert {
    return {
      id: `${metric}_${Date.now()}`,
      type,
      message,
      metric,
      value,
      threshold,
      timestamp: Date.now(),
      resolved: false
    };
  }

  private addAlert(alert: PerformanceAlert): void {
    // Check if similar alert already exists
    const existingAlert = this.activeAlerts.find(a => 
      a.metric === alert.metric && 
      a.type === alert.type && 
      !a.resolved
    );

    if (!existingAlert) {
      this.activeAlerts.push(alert);
      this.notifyAlertListeners(alert);
      console.warn(`Performance alert: ${alert.message} (${alert.value} > ${alert.threshold})`);
    }
  }

  private async loadThresholds(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('performance_thresholds');
      if (saved) {
        this.thresholds = { ...this.thresholds, ...JSON.parse(saved) };
        console.log('Performance thresholds loaded');
      }
    } catch (error) {
      console.error('Failed to load performance thresholds:', error);
    }
  }

  async saveThresholds(): Promise<void> {
    try {
      await AsyncStorage.setItem('performance_thresholds', JSON.stringify(this.thresholds));
      console.log('Performance thresholds saved');
    } catch (error) {
      console.error('Failed to save performance thresholds:', error);
    }
  }

  private notifyMetricsListeners(metrics: PerformanceMetrics): void {
    this.listeners.forEach(listener => listener(metrics));
  }

  private notifyAlertListeners(alert: PerformanceAlert): void {
    this.alertListeners.forEach(listener => listener(alert));
  }

  // Public API methods
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.lastMetrics;
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  getActiveAlerts(): PerformanceAlert[] {
    return this.activeAlerts.filter(alert => !alert.resolved);
  }

  resolveAlert(alertId: string): void {
    const alert = this.activeAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`Alert resolved: ${alert.message}`);
    }
  }

  updateThresholds(newThresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    this.saveThresholds();
  }

  getThresholds(): PerformanceThresholds {
    return { ...this.thresholds };
  }

  subscribeToMetrics(listener: (metrics: PerformanceMetrics) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToAlerts(listener: (alert: PerformanceAlert) => void): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== listener);
    };
  }

  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  dispose(): void {
    console.log('Disposing performance monitor...');
    this.stopMonitoring();
    this.listeners = [];
    this.alertListeners = [];
    this.metricsHistory = [];
    this.activeAlerts = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;