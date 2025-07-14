import AsyncStorage from '@react-native-async-storage/async-storage';
import { performanceMonitor } from './PerformanceMonitor';
import { streamingService } from './streamingService';

export interface BenchmarkTest {
  id: string;
  name: string;
  description: string;
  category: 'cpu' | 'memory' | 'gpu' | 'storage' | 'network' | 'camera' | 'streaming' | 'battery';
  duration: number; // seconds
  complexity: 'light' | 'medium' | 'heavy' | 'extreme';
  enabled: boolean;
  weight: number; // for scoring calculation
}

export interface BenchmarkResult {
  testId: string;
  timestamp: number;
  testName: string;
  category: string;
  score: number; // 0-100
  metrics: {
    executionTime?: number; // ms
    throughput?: number; // operations per second
    efficiency?: number; // score 0-100
    stability?: number; // score 0-100
    accuracy?: number; // score 0-100
    resourceUsage?: {
      cpu: number; // percentage
      memory: number; // MB
      gpu?: number; // percentage
      battery?: number; // drain rate
    };
  };
  details: string;
  rawData?: any;
  passed: boolean;
  errorMessage?: string;
}

export interface BenchmarkSuite {
  id: string;
  name: string;
  description: string;
  tests: BenchmarkTest[];
  totalDuration: number;
  createdAt: number;
}

export interface DeviceBenchmarkProfile {
  deviceId: string;
  deviceInfo: {
    model: string;
    platform: string;
    osVersion: string;
    specs: {
      cpu: string;
      ram: number;
      storage: number;
    };
  };
  overallScore: number;
  categoryScores: Record<string, number>;
  performanceClass: 'low' | 'medium' | 'high' | 'flagship';
  benchmarkHistory: BenchmarkResult[];
  lastBenchmarked: number;
  createdAt: number;
}

export interface BenchmarkSettings {
  enabled: boolean;
  autoRunOnStartup: boolean;
  backgroundBenchmarking: boolean;
  benchmarkInterval: number; // days
  testTimeout: number; // seconds
  thermalThrottleDetection: boolean;
  batteryThreshold: number; // percentage - don't run below this
  includeStressTests: boolean;
  detailedLogging: boolean;
}

class PerformanceBenchmarkManager {
  private static instance: PerformanceBenchmarkManager;
  private isRunning = false;
  private settings: BenchmarkSettings | null = null;
  private currentProfile: DeviceBenchmarkProfile | null = null;
  private benchmarkSuites: BenchmarkSuite[] = [];
  private benchmarkResults: BenchmarkResult[] = [];
  private listeners: Array<(result: BenchmarkResult) => void> = [];

  private readonly defaultBenchmarks: BenchmarkTest[] = [
    // CPU Benchmarks
    {
      id: 'cpu_integer_math',
      name: 'CPU Integer Math',
      description: 'Tests integer arithmetic performance',
      category: 'cpu',
      duration: 10,
      complexity: 'light',
      enabled: true,
      weight: 1.0
    },
    {
      id: 'cpu_floating_point',
      name: 'CPU Floating Point',
      description: 'Tests floating point arithmetic performance',
      category: 'cpu',
      duration: 15,
      complexity: 'medium',
      enabled: true,
      weight: 1.2
    },
    {
      id: 'cpu_multi_thread',
      name: 'CPU Multi-threading',
      description: 'Tests multi-threaded performance',
      category: 'cpu',
      duration: 20,
      complexity: 'heavy',
      enabled: true,
      weight: 1.5
    },

    // Memory Benchmarks
    {
      id: 'memory_allocation',
      name: 'Memory Allocation',
      description: 'Tests memory allocation and deallocation speed',
      category: 'memory',
      duration: 10,
      complexity: 'light',
      enabled: true,
      weight: 1.0
    },
    {
      id: 'memory_bandwidth',
      name: 'Memory Bandwidth',
      description: 'Tests memory read/write bandwidth',
      category: 'memory',
      duration: 15,
      complexity: 'medium',
      enabled: true,
      weight: 1.3
    },
    {
      id: 'memory_latency',
      name: 'Memory Latency',
      description: 'Tests memory access latency',
      category: 'memory',
      duration: 12,
      complexity: 'medium',
      enabled: true,
      weight: 1.1
    },

    // GPU Benchmarks
    {
      id: 'gpu_rendering',
      name: 'GPU Rendering',
      description: 'Tests 2D/3D rendering performance',
      category: 'gpu',
      duration: 20,
      complexity: 'heavy',
      enabled: true,
      weight: 1.4
    },
    {
      id: 'gpu_shader_compute',
      name: 'GPU Shader Compute',
      description: 'Tests compute shader performance',
      category: 'gpu',
      duration: 15,
      complexity: 'medium',
      enabled: true,
      weight: 1.2
    },

    // Storage Benchmarks
    {
      id: 'storage_sequential_read',
      name: 'Storage Sequential Read',
      description: 'Tests sequential read performance',
      category: 'storage',
      duration: 15,
      complexity: 'medium',
      enabled: true,
      weight: 1.0
    },
    {
      id: 'storage_sequential_write',
      name: 'Storage Sequential Write',
      description: 'Tests sequential write performance',
      category: 'storage',
      duration: 15,
      complexity: 'medium',
      enabled: true,
      weight: 1.1
    },
    {
      id: 'storage_random_access',
      name: 'Storage Random Access',
      description: 'Tests random read/write performance',
      category: 'storage',
      duration: 20,
      complexity: 'heavy',
      enabled: true,
      weight: 1.3
    },

    // Camera Benchmarks
    {
      id: 'camera_capture_speed',
      name: 'Camera Capture Speed',
      description: 'Tests camera capture performance',
      category: 'camera',
      duration: 10,
      complexity: 'light',
      enabled: true,
      weight: 1.0
    },
    {
      id: 'camera_processing',
      name: 'Camera Processing',
      description: 'Tests image processing performance',
      category: 'camera',
      duration: 15,
      complexity: 'medium',
      enabled: true,
      weight: 1.2
    },

    // Streaming Benchmarks
    {
      id: 'video_encoding',
      name: 'Video Encoding',
      description: 'Tests video encoding performance',
      category: 'streaming',
      duration: 30,
      complexity: 'heavy',
      enabled: true,
      weight: 1.5
    },
    {
      id: 'streaming_throughput',
      name: 'Streaming Throughput',
      description: 'Tests streaming data throughput',
      category: 'streaming',
      duration: 20,
      complexity: 'medium',
      enabled: true,
      weight: 1.3
    }
  ];

  private constructor() {}

  public static getInstance(): PerformanceBenchmarkManager {
    if (!PerformanceBenchmarkManager.instance) {
      PerformanceBenchmarkManager.instance = new PerformanceBenchmarkManager();
    }
    return PerformanceBenchmarkManager.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing performance benchmark manager...');

      // Load settings
      await this.loadSettings();
      if (!this.settings) {
        this.settings = this.createDefaultSettings();
        await this.saveSettings();
      }

      // Load benchmark suites
      await this.loadBenchmarkSuites();
      if (this.benchmarkSuites.length === 0) {
        this.createDefaultSuites();
        await this.saveBenchmarkSuites();
      }

      // Load or create device profile
      await this.loadDeviceProfile();

      // Run auto-benchmark if enabled
      if (this.settings.autoRunOnStartup && this.shouldRunBenchmark()) {
        setTimeout(() => this.runQuickBenchmark(), 5000); // Delay to not interfere with app startup
      }

      console.log('Performance benchmark manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize performance benchmark manager:', error);
      return false;
    }
  }

  private createDefaultSettings(): BenchmarkSettings {
    return {
      enabled: true,
      autoRunOnStartup: false,
      backgroundBenchmarking: false,
      benchmarkInterval: 7, // 7 days
      testTimeout: 60, // 60 seconds per test
      thermalThrottleDetection: true,
      batteryThreshold: 30, // Don't run if battery < 30%
      includeStressTests: false,
      detailedLogging: false
    };
  }

  private createDefaultSuites(): void {
    this.benchmarkSuites = [
      {
        id: 'quick_benchmark',
        name: 'Quick Benchmark',
        description: 'Fast performance test covering basic functionality',
        tests: this.defaultBenchmarks.filter(t => t.complexity === 'light'),
        totalDuration: 60,
        createdAt: Date.now()
      },
      {
        id: 'standard_benchmark',
        name: 'Standard Benchmark',
        description: 'Comprehensive performance test',
        tests: this.defaultBenchmarks.filter(t => t.complexity === 'light' || t.complexity === 'medium'),
        totalDuration: 180,
        createdAt: Date.now()
      },
      {
        id: 'stress_benchmark',
        name: 'Stress Test',
        description: 'Intensive performance test to determine maximum capabilities',
        tests: this.defaultBenchmarks,
        totalDuration: 300,
        createdAt: Date.now()
      },
      {
        id: 'streaming_benchmark',
        name: 'Streaming Performance',
        description: 'Specialized test for streaming capabilities',
        tests: this.defaultBenchmarks.filter(t => 
          t.category === 'streaming' || t.category === 'camera' || t.category === 'gpu'
        ),
        totalDuration: 120,
        createdAt: Date.now()
      }
    ];
  }

  async runBenchmark(suiteId: string): Promise<BenchmarkResult[]> {
    if (this.isRunning) {
      throw new Error('Benchmark already running');
    }

    const suite = this.benchmarkSuites.find(s => s.id === suiteId);
    if (!suite) {
      throw new Error(`Benchmark suite not found: ${suiteId}`);
    }

    try {
      console.log(`Starting benchmark suite: ${suite.name}`);
      this.isRunning = true;

      const results: BenchmarkResult[] = [];
      const startTime = Date.now();

      // Pre-benchmark checks
      if (!this.canRunBenchmark()) {
        throw new Error('Cannot run benchmark - check battery level and thermal state');
      }

      // Run each test in the suite
      for (const test of suite.tests) {
        if (!test.enabled) continue;

        console.log(`Running test: ${test.name}`);
        
        try {
          const result = await this.executeTest(test);
          results.push(result);
          this.notifyListeners(result);

          // Add delay between tests to prevent overheating
          await this.delay(2000);

          // Check thermal throttling
          if (this.settings?.thermalThrottleDetection && await this.detectThermalThrottling()) {
            console.warn('Thermal throttling detected, pausing benchmark');
            await this.delay(10000); // Wait 10 seconds
          }

        } catch (error) {
          console.error(`Test failed: ${test.name}`, error);
          
          const failedResult: BenchmarkResult = {
            testId: test.id,
            timestamp: Date.now(),
            testName: test.name,
            category: test.category,
            score: 0,
            metrics: {},
            details: `Test failed: ${error}`,
            passed: false,
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          };
          
          results.push(failedResult);
        }
      }

      // Store results
      this.benchmarkResults = [...this.benchmarkResults, ...results];
      
      // Limit history size
      if (this.benchmarkResults.length > 500) {
        this.benchmarkResults = this.benchmarkResults.slice(-500);
      }

      // Update device profile
      await this.updateDeviceProfile(results);

      const totalTime = Date.now() - startTime;
      console.log(`Benchmark completed in ${totalTime}ms: ${results.length} tests run`);

      return results;

    } finally {
      this.isRunning = false;
    }
  }

  async runQuickBenchmark(): Promise<BenchmarkResult[]> {
    return this.runBenchmark('quick_benchmark');
  }

  private async executeTest(test: BenchmarkTest): Promise<BenchmarkResult> {
    const startTime = Date.now();
    const beforeMetrics = performanceMonitor.getCurrentMetrics();

    try {
      let result: BenchmarkResult;

      switch (test.id) {
        case 'cpu_integer_math':
          result = await this.benchmarkCPUInteger(test);
          break;
        case 'cpu_floating_point':
          result = await this.benchmarkCPUFloat(test);
          break;
        case 'cpu_multi_thread':
          result = await this.benchmarkCPUMultiThread(test);
          break;
        case 'memory_allocation':
          result = await this.benchmarkMemoryAllocation(test);
          break;
        case 'memory_bandwidth':
          result = await this.benchmarkMemoryBandwidth(test);
          break;
        case 'memory_latency':
          result = await this.benchmarkMemoryLatency(test);
          break;
        case 'gpu_rendering':
          result = await this.benchmarkGPURendering(test);
          break;
        case 'gpu_shader_compute':
          result = await this.benchmarkGPUCompute(test);
          break;
        case 'storage_sequential_read':
          result = await this.benchmarkStorageSeqRead(test);
          break;
        case 'storage_sequential_write':
          result = await this.benchmarkStorageSeqWrite(test);
          break;
        case 'storage_random_access':
          result = await this.benchmarkStorageRandom(test);
          break;
        case 'camera_capture_speed':
          result = await this.benchmarkCameraCapture(test);
          break;
        case 'camera_processing':
          result = await this.benchmarkCameraProcessing(test);
          break;
        case 'video_encoding':
          result = await this.benchmarkVideoEncoding(test);
          break;
        case 'streaming_throughput':
          result = await this.benchmarkStreamingThroughput(test);
          break;
        default:
          throw new Error(`Unknown test: ${test.id}`);
      }

      const afterMetrics = performanceMonitor.getCurrentMetrics();
      
      // Add resource usage metrics
      if (beforeMetrics && afterMetrics) {
        result.metrics.resourceUsage = {
          cpu: afterMetrics.cpuUsage.percentage,
          memory: afterMetrics.memoryUsage.used,
          battery: afterMetrics.batteryLevel < beforeMetrics.batteryLevel ? 
                   beforeMetrics.batteryLevel - afterMetrics.batteryLevel : 0
        };
      }

      result.metrics.executionTime = Date.now() - startTime;
      return result;

    } catch (error) {
      throw new Error(`Test execution failed: ${error}`);
    }
  }

  private async benchmarkCPUInteger(test: BenchmarkTest): Promise<BenchmarkResult> {
    const iterations = 1000000;
    const startTime = Date.now();

    // Integer math operations
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += i * 2;
      result -= i / 2;
      result *= 3;
      result = Math.floor(result / 4);
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = iterations / (executionTime / 1000);
    
    // Score based on operations per second
    const score = Math.min(100, (operationsPerSecond / 500000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(operationsPerSecond).toLocaleString()} ops/sec in ${executionTime}ms`,
      passed: score > 20,
      rawData: { iterations, result }
    };
  }

  private async benchmarkCPUFloat(test: BenchmarkTest): Promise<BenchmarkResult> {
    const iterations = 500000;
    const startTime = Date.now();

    // Floating point math operations
    let result = 0.0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sin(i) * Math.cos(i);
      result *= Math.sqrt(i + 1);
      result /= Math.log(i + 2);
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = iterations / (executionTime / 1000);
    
    const score = Math.min(100, (operationsPerSecond / 100000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(operationsPerSecond).toLocaleString()} floating ops/sec`,
      passed: score > 20,
      rawData: { iterations, result }
    };
  }

  private async benchmarkCPUMultiThread(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate multi-threaded work with Promise.all
    const numThreads = 4;
    const workPerThread = 100000;
    const startTime = Date.now();

    const promises = Array.from({ length: numThreads }, async (_, threadId) => {
      let result = 0;
      for (let i = 0; i < workPerThread; i++) {
        result += Math.random() * threadId;
      }
      return result;
    });

    await Promise.all(promises);
    const executionTime = Date.now() - startTime;
    
    const totalOperations = numThreads * workPerThread;
    const operationsPerSecond = totalOperations / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 200000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${numThreads} threads, ${Math.round(operationsPerSecond).toLocaleString()} ops/sec`,
      passed: score > 20
    };
  }

  private async benchmarkMemoryAllocation(test: BenchmarkTest): Promise<BenchmarkResult> {
    const allocations = 10000;
    const startTime = Date.now();

    // Allocate and deallocate arrays
    const arrays: number[][] = [];
    for (let i = 0; i < allocations; i++) {
      arrays.push(new Array(1000).fill(i));
    }

    // Force cleanup
    arrays.length = 0;

    const executionTime = Date.now() - startTime;
    const allocationsPerSecond = allocations / (executionTime / 1000);
    const score = Math.min(100, (allocationsPerSecond / 5000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(allocationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(allocationsPerSecond).toLocaleString()} allocations/sec`,
      passed: score > 20
    };
  }

  private async benchmarkMemoryBandwidth(test: BenchmarkTest): Promise<BenchmarkResult> {
    const arraySize = 1000000;
    const iterations = 100;
    const startTime = Date.now();

    // Create large array and perform read/write operations
    const data = new Array(arraySize).fill(0);
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < arraySize; i++) {
        data[i] = i * iter;
      }
    }

    const executionTime = Date.now() - startTime;
    const bytesProcessed = arraySize * iterations * 8; // 8 bytes per number
    const bandwidthMBps = (bytesProcessed / (1024 * 1024)) / (executionTime / 1000);
    const score = Math.min(100, (bandwidthMBps / 1000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(bandwidthMBps),
        efficiency: Math.round(score)
      },
      details: `${Math.round(bandwidthMBps)} MB/s bandwidth`,
      passed: score > 20
    };
  }

  private async benchmarkMemoryLatency(test: BenchmarkTest): Promise<BenchmarkResult> {
    const accesses = 100000;
    const arraySize = 10000;
    const startTime = Date.now();

    const data = new Array(arraySize).fill(0).map((_, i) => i);
    let sum = 0;

    // Random memory access pattern
    for (let i = 0; i < accesses; i++) {
      const index = Math.floor(Math.random() * arraySize);
      sum += data[index];
    }

    const executionTime = Date.now() - startTime;
    const accessesPerSecond = accesses / (executionTime / 1000);
    const averageLatency = executionTime / accesses;
    const score = Math.min(100, (accessesPerSecond / 500000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(accessesPerSecond),
        efficiency: Math.round(score)
      },
      details: `${averageLatency.toFixed(3)}ms avg latency, ${Math.round(accessesPerSecond).toLocaleString()} accesses/sec`,
      passed: score > 20,
      rawData: { sum }
    };
  }

  private async benchmarkGPURendering(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simplified GPU benchmark - in real implementation would use WebGL/Canvas
    const operations = 50000;
    const startTime = Date.now();

    // Simulate graphics operations
    let result = 0;
    for (let i = 0; i < operations; i++) {
      // Simulate matrix operations common in graphics
      const matrix = [
        [Math.cos(i), -Math.sin(i)],
        [Math.sin(i), Math.cos(i)]
      ];
      result += matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = operations / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 25000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(operationsPerSecond).toLocaleString()} render ops/sec`,
      passed: score > 20,
      rawData: { result }
    };
  }

  private async benchmarkGPUCompute(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate compute shader operations
    const computeOps = 25000;
    const startTime = Date.now();

    // Parallel-style computation simulation
    const data = new Array(computeOps).fill(0).map((_, i) => i);
    const result = data.map(value => {
      return Math.pow(Math.sin(value), 2) + Math.pow(Math.cos(value), 2);
    });

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = computeOps / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 15000) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(operationsPerSecond).toLocaleString()} compute ops/sec`,
      passed: score > 20,
      rawData: { resultSum: result.reduce((sum, val) => sum + val, 0) }
    };
  }

  private async benchmarkStorageSeqRead(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate sequential storage read
    const readOperations = 1000;
    const startTime = Date.now();

    // Simulate reading data
    const results = [];
    for (let i = 0; i < readOperations; i++) {
      const data = new Array(1000).fill(i);
      results.push(data.reduce((sum, val) => sum + val, 0));
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = readOperations / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 500) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(operationsPerSecond)} read ops/sec`,
      passed: score > 20
    };
  }

  private async benchmarkStorageSeqWrite(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate sequential storage write
    const writeOperations = 800;
    const startTime = Date.now();

    const storage = [];
    for (let i = 0; i < writeOperations; i++) {
      const data = new Array(1000).fill(i * Math.random());
      storage.push(data);
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = writeOperations / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 400) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score)
      },
      details: `${Math.round(operationsPerSecond)} write ops/sec`,
      passed: score > 20
    };
  }

  private async benchmarkStorageRandom(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate random storage access
    const randomOperations = 5000;
    const dataSize = 10000;
    const startTime = Date.now();

    const storage = new Array(dataSize).fill(0).map((_, i) => ({ id: i, data: Math.random() }));
    
    let accessCount = 0;
    for (let i = 0; i < randomOperations; i++) {
      const randomIndex = Math.floor(Math.random() * dataSize);
      const item = storage[randomIndex];
      if (item) {
        accessCount++;
        item.data = Math.random();
      }
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = accessCount / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 2500) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond),
        efficiency: Math.round(score),
        accuracy: Math.round((accessCount / randomOperations) * 100)
      },
      details: `${Math.round(operationsPerSecond)} random access ops/sec`,
      passed: score > 20
    };
  }

  private async benchmarkCameraCapture(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate camera capture performance
    const captures = 100;
    const startTime = Date.now();

    // Simulate image capture operations
    const images = [];
    for (let i = 0; i < captures; i++) {
      // Simulate image processing delay
      await this.delay(10);
      images.push({ id: i, timestamp: Date.now(), size: 1920 * 1080 });
    }

    const executionTime = Date.now() - startTime;
    const capturesPerSecond = captures / (executionTime / 1000);
    const score = Math.min(100, (capturesPerSecond / 5) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(capturesPerSecond * 100) / 100,
        efficiency: Math.round(score)
      },
      details: `${capturesPerSecond.toFixed(2)} captures/sec`,
      passed: score > 20
    };
  }

  private async benchmarkCameraProcessing(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate image processing performance
    const processOperations = 50;
    const startTime = Date.now();

    for (let i = 0; i < processOperations; i++) {
      // Simulate image processing algorithms
      const imageData = new Array(1920 * 1080).fill(0).map(() => Math.random() * 255);
      
      // Apply filters
      const filtered = imageData.map(pixel => {
        return Math.min(255, pixel * 1.2); // Brightness filter
      });
      
      await this.delay(20); // Simulate processing time
    }

    const executionTime = Date.now() - startTime;
    const operationsPerSecond = processOperations / (executionTime / 1000);
    const score = Math.min(100, (operationsPerSecond / 2) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(operationsPerSecond * 100) / 100,
        efficiency: Math.round(score)
      },
      details: `${operationsPerSecond.toFixed(2)} processing ops/sec`,
      passed: score > 20
    };
  }

  private async benchmarkVideoEncoding(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate video encoding performance
    const frames = 300; // 10 seconds at 30fps
    const startTime = Date.now();

    for (let frame = 0; frame < frames; frame++) {
      // Simulate encoding operations
      const frameData = new Array(1920 * 1080 * 3).fill(0).map(() => Math.random() * 255);
      
      // Simulate compression algorithm
      const compressed = frameData.filter((_, index) => index % 4 === 0);
      
      if (frame % 30 === 0) {
        await this.delay(1); // Keyframe processing
      }
    }

    const executionTime = Date.now() - startTime;
    const fps = frames / (executionTime / 1000);
    const score = Math.min(100, (fps / 60) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(fps * 100) / 100,
        efficiency: Math.round(score)
      },
      details: `${fps.toFixed(2)} fps encoding performance`,
      passed: score > 20
    };
  }

  private async benchmarkStreamingThroughput(test: BenchmarkTest): Promise<BenchmarkResult> {
    // Simulate streaming throughput test
    const dataPackets = 1000;
    const packetSize = 1024; // 1KB packets
    const startTime = Date.now();

    let totalBytes = 0;
    for (let i = 0; i < dataPackets; i++) {
      // Simulate packet creation and transmission
      const packet = new Array(packetSize).fill(Math.random() * 255);
      totalBytes += packet.length;
      
      // Simulate network delay
      if (i % 100 === 0) {
        await this.delay(1);
      }
    }

    const executionTime = Date.now() - startTime;
    const throughputMBps = (totalBytes / (1024 * 1024)) / (executionTime / 1000);
    const score = Math.min(100, (throughputMBps / 10) * 100);

    return {
      testId: test.id,
      timestamp: Date.now(),
      testName: test.name,
      category: test.category,
      score: Math.round(score),
      metrics: {
        throughput: Math.round(throughputMBps * 100) / 100,
        efficiency: Math.round(score)
      },
      details: `${throughputMBps.toFixed(2)} MB/s streaming throughput`,
      passed: score > 20
    };
  }

  private canRunBenchmark(): boolean {
    if (!this.settings) return false;

    // Check battery level
    const metrics = performanceMonitor.getCurrentMetrics();
    if (metrics?.batteryLevel && metrics.batteryLevel < this.settings.batteryThreshold) {
      return false;
    }

    return true;
  }

  private shouldRunBenchmark(): boolean {
    if (!this.currentProfile) return true;

    const daysSinceLastBenchmark = (Date.now() - this.currentProfile.lastBenchmarked) / (1000 * 60 * 60 * 24);
    return daysSinceLastBenchmark >= (this.settings?.benchmarkInterval || 7);
  }

  private async detectThermalThrottling(): Promise<boolean> {
    // In real implementation, would check device temperature
    // For now, simulate based on performance metrics
    const metrics = performanceMonitor.getCurrentMetrics();
    return metrics?.thermalState === 'critical' || metrics?.thermalState === 'serious';
  }

  private async updateDeviceProfile(results: BenchmarkResult[]): Promise<void> {
    if (!this.currentProfile) {
      this.currentProfile = await this.createNewDeviceProfile();
    }

    // Update benchmark history
    this.currentProfile.benchmarkHistory = [...this.currentProfile.benchmarkHistory, ...results];
    
    // Limit history size
    if (this.currentProfile.benchmarkHistory.length > 200) {
      this.currentProfile.benchmarkHistory = this.currentProfile.benchmarkHistory.slice(-200);
    }

    // Calculate category scores
    const categories = ['cpu', 'memory', 'gpu', 'storage', 'camera', 'streaming'];
    const categoryScores: Record<string, number> = {};

    for (const category of categories) {
      const categoryResults = results.filter(r => r.category === category);
      if (categoryResults.length > 0) {
        const avgScore = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
        categoryScores[category] = Math.round(avgScore);
      }
    }

    this.currentProfile.categoryScores = { ...this.currentProfile.categoryScores, ...categoryScores };

    // Calculate overall score
    const allScores = Object.values(this.currentProfile.categoryScores);
    this.currentProfile.overallScore = allScores.length > 0 
      ? Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length)
      : 0;

    // Determine performance class
    if (this.currentProfile.overallScore >= 80) {
      this.currentProfile.performanceClass = 'flagship';
    } else if (this.currentProfile.overallScore >= 60) {
      this.currentProfile.performanceClass = 'high';
    } else if (this.currentProfile.overallScore >= 40) {
      this.currentProfile.performanceClass = 'medium';
    } else {
      this.currentProfile.performanceClass = 'low';
    }

    this.currentProfile.lastBenchmarked = Date.now();
    await this.saveDeviceProfile();
  }

  private async createNewDeviceProfile(): Promise<DeviceBenchmarkProfile> {
    return {
      deviceId: this.generateDeviceId(),
      deviceInfo: {
        model: 'Mobile Device',
        platform: 'mobile',
        osVersion: '1.0',
        specs: {
          cpu: 'Mobile CPU',
          ram: 4096,
          storage: 64000
        }
      },
      overallScore: 0,
      categoryScores: {},
      performanceClass: 'medium',
      benchmarkHistory: [],
      lastBenchmarked: 0,
      createdAt: Date.now()
    };
  }

  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Storage methods
  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('benchmark_settings');
      if (saved) {
        this.settings = JSON.parse(saved);
        console.log('Benchmark settings loaded');
      }
    } catch (error) {
      console.error('Failed to load benchmark settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (this.settings) {
        await AsyncStorage.setItem('benchmark_settings', JSON.stringify(this.settings));
        console.log('Benchmark settings saved');
      }
    } catch (error) {
      console.error('Failed to save benchmark settings:', error);
    }
  }

  private async loadBenchmarkSuites(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('benchmark_suites');
      if (saved) {
        this.benchmarkSuites = JSON.parse(saved);
        console.log(`Loaded ${this.benchmarkSuites.length} benchmark suites`);
      }
    } catch (error) {
      console.error('Failed to load benchmark suites:', error);
    }
  }

  private async saveBenchmarkSuites(): Promise<void> {
    try {
      await AsyncStorage.setItem('benchmark_suites', JSON.stringify(this.benchmarkSuites));
      console.log('Benchmark suites saved');
    } catch (error) {
      console.error('Failed to save benchmark suites:', error);
    }
  }

  private async loadDeviceProfile(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('device_benchmark_profile');
      if (saved) {
        this.currentProfile = JSON.parse(saved);
        console.log('Device benchmark profile loaded');
      }
    } catch (error) {
      console.error('Failed to load device benchmark profile:', error);
    }
  }

  private async saveDeviceProfile(): Promise<void> {
    try {
      if (this.currentProfile) {
        await AsyncStorage.setItem('device_benchmark_profile', JSON.stringify(this.currentProfile));
        console.log('Device benchmark profile saved');
      }
    } catch (error) {
      console.error('Failed to save device benchmark profile:', error);
    }
  }

  // Public API
  async updateSettings(updates: Partial<BenchmarkSettings>): Promise<void> {
    if (this.settings) {
      this.settings = { ...this.settings, ...updates };
      await this.saveSettings();
    }
  }

  getSettings(): BenchmarkSettings | null {
    return this.settings ? { ...this.settings } : null;
  }

  getBenchmarkSuites(): BenchmarkSuite[] {
    return [...this.benchmarkSuites];
  }

  getBenchmarkResults(): BenchmarkResult[] {
    return [...this.benchmarkResults];
  }

  getDeviceProfile(): DeviceBenchmarkProfile | null {
    return this.currentProfile ? { ...this.currentProfile } : null;
  }

  isRunning(): boolean {
    return this.isRunning;
  }

  subscribe(listener: (result: BenchmarkResult) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(result: BenchmarkResult): void {
    this.listeners.forEach(listener => listener(result));
  }

  dispose(): void {
    console.log('Disposing performance benchmark manager...');
    this.listeners = [];
  }
}

export const performanceBenchmarkManager = PerformanceBenchmarkManager.getInstance();
export default performanceBenchmarkManager;