import { performanceMonitor } from './PerformanceMonitor';

export interface MemoryLeakDetection {
  id: string;
  timestamp: number;
  componentName: string;
  leakType: 'listener' | 'timeout' | 'interval' | 'subscription' | 'reference' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  memoryUsage: number; // MB
  stackTrace?: string;
  resolved: boolean;
}

export interface MemoryUsageSnapshot {
  timestamp: number;
  totalMemory: number;
  usedMemory: number;
  percentage: number;
  components: ComponentMemoryUsage[];
  activeListeners: number;
  activeTimeouts: number;
  activeIntervals: number;
  activeSubscriptions: number;
}

export interface ComponentMemoryUsage {
  name: string;
  instances: number;
  memoryUsage: number;
  listeners: number;
  timeouts: number;
  intervals: number;
  subscriptions: number;
}

export interface MemoryLeakPreventionConfig {
  enabled: boolean;
  monitoringInterval: number; // milliseconds
  memoryThreshold: number; // percentage
  leakDetectionSensitivity: 'low' | 'medium' | 'high';
  autoCleanup: boolean;
  alertOnLeaks: boolean;
  maxSnapshots: number;
}

class MemoryLeakPreventionManager {
  private static instance: MemoryLeakPreventionManager;
  private isMonitoring = false;
  private config: MemoryLeakPreventionConfig = {
    enabled: true,
    monitoringInterval: 10000, // 10 seconds
    memoryThreshold: 85,
    leakDetectionSensitivity: 'medium',
    autoCleanup: true,
    alertOnLeaks: true,
    maxSnapshots: 50
  };

  private memorySnapshots: MemoryUsageSnapshot[] = [];
  private detectedLeaks: MemoryLeakDetection[] = [];
  private monitoringInterval: NodeJS.Timeout | null = null;
  private componentRegistry = new Map<string, ComponentTracker>();
  private globalListeners = new Set<Function>();
  private globalTimeouts = new Set<NodeJS.Timeout>();
  private globalIntervals = new Set<NodeJS.Timeout>();
  private listeners: Array<(leak: MemoryLeakDetection) => void> = [];

  private constructor() {
    this.patchGlobalFunctions();
  }

  public static getInstance(): MemoryLeakPreventionManager {
    if (!MemoryLeakPreventionManager.instance) {
      MemoryLeakPreventionManager.instance = new MemoryLeakPreventionManager();
    }
    return MemoryLeakPreventionManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing memory leak prevention manager...');

      if (this.config.enabled) {
        this.startMonitoring();
      }

      console.log('Memory leak prevention manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize memory leak prevention manager:', error);
      return false;
    }
  }

  private patchGlobalFunctions(): void {
    // Patch setTimeout to track timeouts
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = ((callback: Function, delay?: number, ...args: any[]) => {
      const timeout = originalSetTimeout(() => {
        this.globalTimeouts.delete(timeout);
        callback(...args);
      }, delay);
      this.globalTimeouts.add(timeout);
      return timeout;
    }) as any;

    // Patch setInterval to track intervals
    const originalSetInterval = global.setInterval;
    global.setInterval = ((callback: Function, delay?: number, ...args: any[]) => {
      const interval = originalSetInterval(callback, delay, ...args);
      this.globalIntervals.add(interval);
      return interval;
    }) as any;

    // Patch clearTimeout
    const originalClearTimeout = global.clearTimeout;
    global.clearTimeout = (timeout: NodeJS.Timeout) => {
      this.globalTimeouts.delete(timeout);
      originalClearTimeout(timeout);
    };

    // Patch clearInterval
    const originalClearInterval = global.clearInterval;
    global.clearInterval = (interval: NodeJS.Timeout) => {
      this.globalIntervals.delete(interval);
      originalClearInterval(interval);
    };
  }

  startMonitoring(): void {
    if (this.isMonitoring) {
      console.warn('Memory leak monitoring already running');
      return;
    }

    console.log('Starting memory leak monitoring');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.performMemoryCheck();
    }, this.config.monitoringInterval);
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) {
      console.warn('Memory leak monitoring not running');
      return;
    }

    console.log('Stopping memory leak monitoring');
    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async performMemoryCheck(): Promise<void> {
    try {
      const snapshot = await this.createMemorySnapshot();
      this.memorySnapshots.push(snapshot);

      // Limit snapshots
      if (this.memorySnapshots.length > this.config.maxSnapshots) {
        this.memorySnapshots.shift();
      }

      // Detect potential leaks
      await this.detectMemoryLeaks(snapshot);

      // Auto-cleanup if enabled
      if (this.config.autoCleanup) {
        await this.performAutoCleanup();
      }

    } catch (error) {
      console.error('Error during memory check:', error);
    }
  }

  private async createMemorySnapshot(): Promise<MemoryUsageSnapshot> {
    const metrics = performanceMonitor.getCurrentMetrics();
    const memoryUsage = metrics?.memoryUsage || { used: 0, total: 8192, percentage: 0 };

    return {
      timestamp: Date.now(),
      totalMemory: memoryUsage.total,
      usedMemory: memoryUsage.used,
      percentage: memoryUsage.percentage,
      components: this.getComponentMemoryUsage(),
      activeListeners: this.globalListeners.size,
      activeTimeouts: this.globalTimeouts.size,
      activeIntervals: this.globalIntervals.size,
      activeSubscriptions: this.getTotalActiveSubscriptions()
    };
  }

  private getComponentMemoryUsage(): ComponentMemoryUsage[] {
    const components: ComponentMemoryUsage[] = [];

    this.componentRegistry.forEach((tracker, name) => {
      components.push({
        name,
        instances: tracker.instances,
        memoryUsage: tracker.estimatedMemoryUsage,
        listeners: tracker.listeners.size,
        timeouts: tracker.timeouts.size,
        intervals: tracker.intervals.size,
        subscriptions: tracker.subscriptions.size
      });
    });

    return components;
  }

  private getTotalActiveSubscriptions(): number {
    let total = 0;
    this.componentRegistry.forEach(tracker => {
      total += tracker.subscriptions.size;
    });
    return total;
  }

  private async detectMemoryLeaks(snapshot: MemoryUsageSnapshot): Promise<void> {
    // Memory threshold check
    if (snapshot.percentage > this.config.memoryThreshold) {
      this.reportLeak({
        componentName: 'System',
        leakType: 'other',
        severity: 'high',
        description: `Memory usage exceeded threshold: ${snapshot.percentage.toFixed(1)}%`,
        memoryUsage: snapshot.usedMemory
      });
    }

    // Growing timeout/interval check
    if (this.memorySnapshots.length >= 5) {
      const recentSnapshots = this.memorySnapshots.slice(-5);
      const timeoutGrowth = this.calculateGrowthRate(recentSnapshots.map(s => s.activeTimeouts));
      const intervalGrowth = this.calculateGrowthRate(recentSnapshots.map(s => s.activeIntervals));

      if (timeoutGrowth > this.getGrowthThreshold()) {
        this.reportLeak({
          componentName: 'System',
          leakType: 'timeout',
          severity: 'medium',
          description: `Timeout count growing rapidly: ${timeoutGrowth.toFixed(2)}% per check`,
          memoryUsage: snapshot.usedMemory
        });
      }

      if (intervalGrowth > this.getGrowthThreshold()) {
        this.reportLeak({
          componentName: 'System',
          leakType: 'interval',
          severity: 'medium',
          description: `Interval count growing rapidly: ${intervalGrowth.toFixed(2)}% per check`,
          memoryUsage: snapshot.usedMemory
        });
      }
    }

    // Component-specific leak detection
    snapshot.components.forEach(component => {
      this.detectComponentLeaks(component, snapshot);
    });
  }

  private detectComponentLeaks(component: ComponentMemoryUsage, snapshot: MemoryUsageSnapshot): void {
    // High listener count relative to instances
    const listenersPerInstance = component.listeners / Math.max(1, component.instances);
    if (listenersPerInstance > 10) {
      this.reportLeak({
        componentName: component.name,
        leakType: 'listener',
        severity: 'medium',
        description: `High listener count per instance: ${listenersPerInstance.toFixed(1)}`,
        memoryUsage: component.memoryUsage
      });
    }

    // High timeout/interval count
    const timersPerInstance = (component.timeouts + component.intervals) / Math.max(1, component.instances);
    if (timersPerInstance > 5) {
      this.reportLeak({
        componentName: component.name,
        leakType: component.timeouts > component.intervals ? 'timeout' : 'interval',
        severity: 'medium',
        description: `High timer count per instance: ${timersPerInstance.toFixed(1)}`,
        memoryUsage: component.memoryUsage
      });
    }

    // Memory usage per instance
    const memoryPerInstance = component.memoryUsage / Math.max(1, component.instances);
    if (memoryPerInstance > 50) { // 50MB per instance
      this.reportLeak({
        componentName: component.name,
        leakType: 'reference',
        severity: 'high',
        description: `High memory usage per instance: ${memoryPerInstance.toFixed(1)}MB`,
        memoryUsage: component.memoryUsage
      });
    }
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];
    
    if (first === 0) return last > 0 ? 100 : 0;
    
    return ((last - first) / first) * 100;
  }

  private getGrowthThreshold(): number {
    switch (this.config.leakDetectionSensitivity) {
      case 'low': return 50; // 50% growth
      case 'medium': return 25; // 25% growth
      case 'high': return 10; // 10% growth
      default: return 25;
    }
  }

  private reportLeak(leak: Omit<MemoryLeakDetection, 'id' | 'timestamp' | 'resolved'>): void {
    const fullLeak: MemoryLeakDetection = {
      ...leak,
      id: `leak_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      resolved: false
    };

    // Check for duplicates
    const isDuplicate = this.detectedLeaks.some(existing => 
      existing.componentName === leak.componentName &&
      existing.leakType === leak.leakType &&
      existing.description === leak.description &&
      !existing.resolved
    );

    if (!isDuplicate) {
      this.detectedLeaks.push(fullLeak);
      
      if (this.config.alertOnLeaks) {
        console.warn(`Memory leak detected: ${leak.description} in ${leak.componentName}`);
      }

      this.notifyListeners(fullLeak);
    }
  }

  private async performAutoCleanup(): Promise<void> {
    try {
      // Clean up orphaned timeouts (older than 5 minutes)
      const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clean up component registry
      this.componentRegistry.forEach((tracker, name) => {
        if (tracker.lastActivity < fiveMinutesAgo && tracker.instances === 0) {
          this.componentRegistry.delete(name);
        }
      });

      console.log('Auto-cleanup performed');
    } catch (error) {
      console.error('Error during auto-cleanup:', error);
    }
  }

  // Component registration and tracking
  registerComponent(name: string): ComponentTracker {
    if (!this.componentRegistry.has(name)) {
      this.componentRegistry.set(name, new ComponentTracker(name));
    }
    
    const tracker = this.componentRegistry.get(name)!;
    tracker.instances++;
    tracker.lastActivity = Date.now();
    
    return tracker;
  }

  unregisterComponent(name: string): void {
    const tracker = this.componentRegistry.get(name);
    if (tracker) {
      tracker.instances = Math.max(0, tracker.instances - 1);
      tracker.lastActivity = Date.now();
    }
  }

  // Public API
  updateConfig(config: Partial<MemoryLeakPreventionConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.isMonitoring) {
      this.stopMonitoring();
      if (this.config.enabled) {
        this.startMonitoring();
      }
    }
  }

  getConfig(): MemoryLeakPreventionConfig {
    return { ...this.config };
  }

  getMemorySnapshots(): MemoryUsageSnapshot[] {
    return [...this.memorySnapshots];
  }

  getDetectedLeaks(): MemoryLeakDetection[] {
    return [...this.detectedLeaks];
  }

  getActiveLeaks(): MemoryLeakDetection[] {
    return this.detectedLeaks.filter(leak => !leak.resolved);
  }

  resolveLeak(leakId: string): boolean {
    const leak = this.detectedLeaks.find(l => l.id === leakId);
    if (leak) {
      leak.resolved = true;
      console.log(`Memory leak resolved: ${leakId}`);
      return true;
    }
    return false;
  }

  forceGarbageCollection(): void {
    if (global.gc) {
      global.gc();
      console.log('Forced garbage collection');
    } else {
      console.warn('Garbage collection not available');
    }
  }

  getCurrentMemoryUsage(): MemoryUsageSnapshot | null {
    return this.memorySnapshots[this.memorySnapshots.length - 1] || null;
  }

  subscribe(listener: (leak: MemoryLeakDetection) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(leak: MemoryLeakDetection): void {
    this.listeners.forEach(listener => listener(leak));
  }

  dispose(): void {
    console.log('Disposing memory leak prevention manager...');
    this.stopMonitoring();
    this.listeners = [];
    this.componentRegistry.clear();
    this.globalListeners.clear();
    this.globalTimeouts.clear();
    this.globalIntervals.clear();
  }
}

class ComponentTracker {
  public instances = 0;
  public estimatedMemoryUsage = 0;
  public lastActivity = Date.now();
  public listeners = new Set<Function>();
  public timeouts = new Set<NodeJS.Timeout>();
  public intervals = new Set<NodeJS.Timeout>();
  public subscriptions = new Set<Function>();

  constructor(public name: string) {}

  addListener(listener: Function): void {
    this.listeners.add(listener);
    this.lastActivity = Date.now();
  }

  removeListener(listener: Function): void {
    this.listeners.delete(listener);
    this.lastActivity = Date.now();
  }

  addTimeout(timeout: NodeJS.Timeout): void {
    this.timeouts.add(timeout);
    this.lastActivity = Date.now();
  }

  removeTimeout(timeout: NodeJS.Timeout): void {
    this.timeouts.delete(timeout);
    this.lastActivity = Date.now();
  }

  addInterval(interval: NodeJS.Timeout): void {
    this.intervals.add(interval);
    this.lastActivity = Date.now();
  }

  removeInterval(interval: NodeJS.Timeout): void {
    this.intervals.delete(interval);
    this.lastActivity = Date.now();
  }

  addSubscription(subscription: Function): void {
    this.subscriptions.add(subscription);
    this.lastActivity = Date.now();
  }

  removeSubscription(subscription: Function): void {
    this.subscriptions.delete(subscription);
    this.lastActivity = Date.now();
  }

  cleanup(): void {
    // Clean up all tracked resources
    this.listeners.clear();
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
    this.subscriptions.forEach(unsub => {
      try {
        unsub();
      } catch (error) {
        console.warn('Error during subscription cleanup:', error);
      }
    });
    this.subscriptions.clear();
  }
}

export const memoryLeakPrevention = MemoryLeakPreventionManager.getInstance();
export { ComponentTracker };
export default memoryLeakPrevention;