import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  timestamp: number;
  memoryUsage: number; // bytes
  cpuUsage: number; // percentage
  frameRate: number; // fps
  batteryLevel?: number; // percentage
  thermalState?: 'normal' | 'fair' | 'serious' | 'critical';
  networkLatency?: number; // ms
  overlayCount: number;
  activeOverlayCount: number;
}

export interface PerformanceReport {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  metrics: PerformanceMetrics[];
  averages: {
    memoryUsage: number;
    cpuUsage: number;
    frameRate: number;
    overlayCount: number;
  };
  peaks: {
    maxMemoryUsage: number;
    maxCpuUsage: number;
    minFrameRate: number;
    maxOverlayCount: number;
  };
  issues: PerformanceIssue[];
  recommendations: string[];
}

export interface PerformanceIssue {
  type: 'memory' | 'cpu' | 'frame_rate' | 'battery' | 'thermal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  description: string;
  value: number;
  threshold: number;
}

class PerformanceProfiler {
  private isRunning = false;
  private sessionId: string = '';
  private startTime: number = 0;
  private metrics: PerformanceMetrics[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = 'performance_reports';
  
  // Performance thresholds
  private readonly thresholds = {
    memory: {
      warning: 400 * 1024 * 1024, // 400MB
      critical: 600 * 1024 * 1024  // 600MB
    },
    cpu: {
      warning: 50, // 50%
      critical: 80  // 80%
    },
    frameRate: {
      warning: 25, // 25fps
      critical: 20  // 20fps
    },
    battery: {
      warning: 30, // 30% per hour drain
      critical: 40  // 40% per hour drain
    }
  };

  async startProfiling(): Promise<string> {
    if (this.isRunning) {
      throw new Error('Profiling already running');
    }

    this.sessionId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    this.metrics = [];
    this.isRunning = true;

    // Start monitoring at 2-second intervals
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 2000);

    console.log(`Performance profiling started - Session: ${this.sessionId}`);
    return this.sessionId;
  }

  async stopProfiling(): Promise<PerformanceReport> {
    if (!this.isRunning) {
      throw new Error('Profiling not running');
    }

    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    const report = this.generateReport();
    await this.saveReport(report);

    console.log(`Performance profiling stopped - Session: ${this.sessionId}`);
    return report;
  }

  private collectMetrics(): void {
    if (!this.isRunning) return;

    try {
      const metrics: PerformanceMetrics = {
        timestamp: Date.now(),
        memoryUsage: this.getCurrentMemoryUsage(),
        cpuUsage: this.getCurrentCpuUsage(),
        frameRate: this.getCurrentFrameRate(),
        batteryLevel: this.getBatteryLevel(),
        thermalState: this.getThermalState(),
        networkLatency: this.getNetworkLatency(),
        overlayCount: this.getOverlayCount(),
        activeOverlayCount: this.getActiveOverlayCount()
      };

      this.metrics.push(metrics);

      // Check for performance issues
      this.checkForIssues(metrics);

    } catch (error) {
      console.error('Error collecting performance metrics:', error);
    }
  }

  private getCurrentMemoryUsage(): number {
    // Platform-specific memory measurement
    // For React Native, this would need native module implementation
    // Simulated for demonstration
    const baseMemory = 200 * 1024 * 1024; // 200MB base
    const overlayMemory = this.getOverlayCount() * 15 * 1024 * 1024; // 15MB per overlay
    const randomVariation = Math.random() * 50 * 1024 * 1024; // Random 0-50MB
    
    return baseMemory + overlayMemory + randomVariation;
  }

  private getCurrentCpuUsage(): number {
    // Platform-specific CPU measurement
    // Simulated based on overlay count and activity
    const baseCpu = 15; // 15% base
    const overlayCpu = this.getActiveOverlayCount() * 3; // 3% per active overlay
    const randomVariation = Math.random() * 20; // Random 0-20%
    
    return Math.min(95, baseCpu + overlayCpu + randomVariation);
  }

  private getCurrentFrameRate(): number {
    // Frame rate measurement would need native implementation
    // Simulated based on performance load
    const memoryUsage = this.getCurrentMemoryUsage();
    const cpuUsage = this.getCurrentCpuUsage();
    
    let frameRate = 30; // Base 30fps
    
    // Reduce frame rate based on load
    if (memoryUsage > 400 * 1024 * 1024) frameRate -= 2;
    if (memoryUsage > 500 * 1024 * 1024) frameRate -= 3;
    if (cpuUsage > 60) frameRate -= 2;
    if (cpuUsage > 80) frameRate -= 5;
    
    // Add some random variation
    frameRate += (Math.random() - 0.5) * 4;
    
    return Math.max(15, Math.min(30, frameRate));
  }

  private getBatteryLevel(): number {
    // Battery level measurement would need native implementation
    // Simulated
    return 75 + Math.random() * 20; // 75-95%
  }

  private getThermalState(): 'normal' | 'fair' | 'serious' | 'critical' {
    // Thermal state would need native implementation
    const cpuUsage = this.getCurrentCpuUsage();
    
    if (cpuUsage > 80) return 'serious';
    if (cpuUsage > 60) return 'fair';
    return 'normal';
  }

  private getNetworkLatency(): number {
    // Network latency measurement
    // Simulated
    return 50 + Math.random() * 100; // 50-150ms
  }

  private getOverlayCount(): number {
    try {
      // This would integrate with the overlay service
      return 5; // Simulated
    } catch {
      return 0;
    }
  }

  private getActiveOverlayCount(): number {
    try {
      // This would integrate with the overlay service
      return 3; // Simulated
    } catch {
      return 0;
    }
  }

  private checkForIssues(metrics: PerformanceMetrics): void {
    // Memory issues
    if (metrics.memoryUsage > this.thresholds.memory.critical) {
      this.logIssue({
        type: 'memory',
        severity: 'critical',
        timestamp: metrics.timestamp,
        description: 'Critical memory usage detected',
        value: metrics.memoryUsage,
        threshold: this.thresholds.memory.critical
      });
    } else if (metrics.memoryUsage > this.thresholds.memory.warning) {
      this.logIssue({
        type: 'memory',
        severity: 'medium',
        timestamp: metrics.timestamp,
        description: 'High memory usage detected',
        value: metrics.memoryUsage,
        threshold: this.thresholds.memory.warning
      });
    }

    // CPU issues
    if (metrics.cpuUsage > this.thresholds.cpu.critical) {
      this.logIssue({
        type: 'cpu',
        severity: 'critical',
        timestamp: metrics.timestamp,
        description: 'Critical CPU usage detected',
        value: metrics.cpuUsage,
        threshold: this.thresholds.cpu.critical
      });
    } else if (metrics.cpuUsage > this.thresholds.cpu.warning) {
      this.logIssue({
        type: 'cpu',
        severity: 'medium',
        timestamp: metrics.timestamp,
        description: 'High CPU usage detected',
        value: metrics.cpuUsage,
        threshold: this.thresholds.cpu.warning
      });
    }

    // Frame rate issues
    if (metrics.frameRate < this.thresholds.frameRate.critical) {
      this.logIssue({
        type: 'frame_rate',
        severity: 'critical',
        timestamp: metrics.timestamp,
        description: 'Critical frame rate drop detected',
        value: metrics.frameRate,
        threshold: this.thresholds.frameRate.critical
      });
    } else if (metrics.frameRate < this.thresholds.frameRate.warning) {
      this.logIssue({
        type: 'frame_rate',
        severity: 'medium',
        timestamp: metrics.timestamp,
        description: 'Frame rate drop detected',
        value: metrics.frameRate,
        threshold: this.thresholds.frameRate.warning
      });
    }

    // Thermal issues
    if (metrics.thermalState === 'critical') {
      this.logIssue({
        type: 'thermal',
        severity: 'critical',
        timestamp: metrics.timestamp,
        description: 'Critical thermal state detected',
        value: 100,
        threshold: 80
      });
    } else if (metrics.thermalState === 'serious') {
      this.logIssue({
        type: 'thermal',
        severity: 'high',
        timestamp: metrics.timestamp,
        description: 'High thermal state detected',
        value: 80,
        threshold: 60
      });
    }
  }

  private issues: PerformanceIssue[] = [];

  private logIssue(issue: PerformanceIssue): void {
    this.issues.push(issue);
    console.warn(`Performance Issue [${issue.severity}]: ${issue.description}`);
    
    // Trigger performance optimization if critical
    if (issue.severity === 'critical') {
      this.triggerPerformanceOptimization(issue.type);
    }
  }

  private triggerPerformanceOptimization(type: PerformanceIssue['type']): void {
    // Implement performance optimization strategies
    switch (type) {
      case 'memory':
        console.log('Triggering memory optimization...');
        // Implement memory cleanup
        break;
      case 'cpu':
        console.log('Triggering CPU optimization...');
        // Implement CPU load reduction
        break;
      case 'frame_rate':
        console.log('Triggering frame rate optimization...');
        // Implement rendering optimization
        break;
      case 'thermal':
        console.log('Triggering thermal management...');
        // Implement thermal throttling
        break;
    }
  }

  private generateReport(): PerformanceReport {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    // Calculate averages
    const averages = {
      memoryUsage: this.calculateAverage(this.metrics.map(m => m.memoryUsage)),
      cpuUsage: this.calculateAverage(this.metrics.map(m => m.cpuUsage)),
      frameRate: this.calculateAverage(this.metrics.map(m => m.frameRate)),
      overlayCount: this.calculateAverage(this.metrics.map(m => m.overlayCount))
    };

    // Calculate peaks
    const peaks = {
      maxMemoryUsage: Math.max(...this.metrics.map(m => m.memoryUsage)),
      maxCpuUsage: Math.max(...this.metrics.map(m => m.cpuUsage)),
      minFrameRate: Math.min(...this.metrics.map(m => m.frameRate)),
      maxOverlayCount: Math.max(...this.metrics.map(m => m.overlayCount))
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(averages, peaks);

    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime,
      duration,
      metrics: this.metrics,
      averages,
      peaks,
      issues: [...this.issues],
      recommendations
    };
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private generateRecommendations(averages: PerformanceReport['averages'], peaks: PerformanceReport['peaks']): string[] {
    const recommendations: string[] = [];

    // Memory recommendations
    if (averages.memoryUsage > this.thresholds.memory.warning) {
      recommendations.push('Consider reducing the number of active overlays to improve memory usage');
    }
    if (peaks.maxMemoryUsage > this.thresholds.memory.critical) {
      recommendations.push('Critical memory usage detected - implement memory cleanup strategies');
    }

    // CPU recommendations
    if (averages.cpuUsage > this.thresholds.cpu.warning) {
      recommendations.push('High CPU usage detected - consider optimizing rendering pipeline');
    }

    // Frame rate recommendations
    if (averages.frameRate < this.thresholds.frameRate.warning) {
      recommendations.push('Low frame rate detected - reduce overlay complexity or enable GPU acceleration');
    }

    // Overlay recommendations
    if (averages.overlayCount > 8) {
      recommendations.push('High overlay count may impact performance - consider overlay management strategies');
    }

    return recommendations;
  }

  private async saveReport(report: PerformanceReport): Promise<void> {
    try {
      const existingReports = await this.getStoredReports();
      existingReports.push(report);
      
      // Keep only last 10 reports
      const recentReports = existingReports.slice(-10);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentReports));
    } catch (error) {
      console.error('Error saving performance report:', error);
    }
  }

  async getStoredReports(): Promise<PerformanceReport[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading performance reports:', error);
      return [];
    }
  }

  async clearStoredReports(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing performance reports:', error);
    }
  }

  // Real-time metrics getter
  getCurrentMetrics(): PerformanceMetrics | null {
    if (!this.isRunning || this.metrics.length === 0) {
      return null;
    }
    return this.metrics[this.metrics.length - 1];
  }

  // Performance score calculation
  calculatePerformanceScore(): number {
    if (this.metrics.length === 0) return 0;

    const latest = this.metrics[this.metrics.length - 1];
    let score = 100;

    // Memory score
    const memoryPercent = (latest.memoryUsage / this.thresholds.memory.critical) * 100;
    if (memoryPercent > 80) score -= 20;
    else if (memoryPercent > 60) score -= 10;

    // CPU score
    if (latest.cpuUsage > 80) score -= 20;
    else if (latest.cpuUsage > 60) score -= 10;

    // Frame rate score
    if (latest.frameRate < 20) score -= 25;
    else if (latest.frameRate < 25) score -= 15;

    // Overlay count impact
    if (latest.overlayCount > 10) score -= 10;
    else if (latest.overlayCount > 7) score -= 5;

    return Math.max(0, score);
  }

  isPerformanceAcceptable(): boolean {
    return this.calculatePerformanceScore() >= 70;
  }
}

export default new PerformanceProfiler();