import { useState, useEffect, useCallback } from 'react';
import streamingService, { StreamConfig, StreamStats, RTMPConnectionStatus } from '../services/streamingService';
import { performanceMonitor, PerformanceMetrics, PerformanceAlert } from '../services/PerformanceMonitor';
import { dualCameraManager, CameraLayout, DualCameraState } from '../services/DualCameraManager';
import { resolutionManager, ResolutionSettings } from '../services/ResolutionManager';

export interface UseStreamingReturn {
  // Streaming State
  isStreaming: boolean;
  streamStats: StreamStats;
  isInitializing: boolean;
  error: string | null;
  connectionStatus: RTMPConnectionStatus;
  
  // Performance Monitoring
  performanceMetrics: PerformanceMetrics | null;
  performanceAlerts: PerformanceAlert[];
  isPerformanceMonitoring: boolean;
  
  // Camera State
  cameraState: DualCameraState;
  currentLayout: CameraLayout;
  
  // Resolution Management
  resolutionSettings: ResolutionSettings | null;
  
  // Core Streaming Functions
  initializeStream: (config: StreamConfig) => Promise<boolean>;
  startStream: () => Promise<boolean>;
  stopStream: () => Promise<void>;
  reconnectStream: () => Promise<boolean>;
  
  // Camera Management
  switchCameraLayout: (layout: CameraLayout) => Promise<boolean>;
  switchCamera: () => void;
  
  // Quality Management
  updateStreamQuality: (quality: '720p' | '1080p' | '480p' | '4K') => Promise<boolean>;
  setAutoQuality: (enabled: boolean) => Promise<void>;
  setBatteryOptimization: (enabled: boolean) => Promise<void>;
  
  // Performance Management
  startPerformanceMonitoring: () => void;
  stopPerformanceMonitoring: () => void;
  resolveAlert: (alertId: string) => void;
  
  // Utility Functions
  clearError: () => void;
  updateNetworkSpeed: (speed: number) => Promise<void>;
  updateBatteryLevel: (level: number) => Promise<void>;
}

export const useStreaming = (): UseStreamingReturn => {
  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    bitrate: '0kbps',
    fps: '0fps',
    duration: 0,
    isConnected: false,
    networkSpeed: 0,
    droppedFrames: 0,
    totalFrames: 0,
    quality: '720p',
    viewerCount: 0
  });
  const [connectionStatus, setConnectionStatus] = useState<RTMPConnectionStatus>({
    isConnected: false,
    connectionTime: 0,
    lastError: null,
    reconnectAttempts: 0
  });

  // Performance State
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [isPerformanceMonitoring, setIsPerformanceMonitoring] = useState(false);

  // Camera State
  const [cameraState, setCameraState] = useState<DualCameraState>(dualCameraManager.getState());
  const [currentLayout, setCurrentLayout] = useState<CameraLayout>(CameraLayout.SINGLE_BACK);

  // Resolution State
  const [resolutionSettings, setResolutionSettings] = useState<ResolutionSettings | null>(null);

  // Initialize and subscribe to all services
  useEffect(() => {
    let updateInterval: NodeJS.Timeout;

    const initializeServices = async () => {
      // Initialize performance monitor
      await performanceMonitor.initialize();
      
      // Initialize resolution manager
      await resolutionManager.initialize();
      const settings = resolutionManager.getCurrentSettings();
      setResolutionSettings(settings);
    };

    // Subscribe to streaming stats updates
    const updateStats = () => {
      const stats = streamingService.getStreamStats();
      const status = streamingService.getConnectionStatus();
      
      setStreamStats(stats);
      setConnectionStatus(status);
      setIsStreaming(streamingService.isStreamingActive());
    };

    // Subscribe to camera state changes
    const unsubscribeCamera = dualCameraManager.subscribe((state) => {
      setCameraState(state);
      setCurrentLayout(state.layout);
    });

    // Subscribe to performance metrics
    const unsubscribeMetrics = performanceMonitor.subscribeToMetrics((metrics) => {
      setPerformanceMetrics(metrics);
      
      // Auto-update network speed for adaptive quality
      resolutionManager.updateNetworkSpeed(metrics.networkSpeed.upload);
    });

    // Subscribe to performance alerts
    const unsubscribeAlerts = performanceMonitor.subscribeToAlerts((alert) => {
      setPerformanceAlerts(prev => [...prev, alert]);
    });

    // Subscribe to resolution settings changes
    const unsubscribeResolution = resolutionManager.subscribe((settings) => {
      setResolutionSettings(settings);
    });

    // Update monitoring state
    setIsPerformanceMonitoring(performanceMonitor.isMonitoringActive());

    // Initialize services
    initializeServices();

    // Update stats every second
    updateInterval = setInterval(updateStats, 1000);
    
    // Initial update
    updateStats();

    return () => {
      clearInterval(updateInterval);
      unsubscribeCamera();
      unsubscribeMetrics();
      unsubscribeAlerts();
      unsubscribeResolution();
    };
  }, []);

  const initializeStream = useCallback(async (config: StreamConfig): Promise<boolean> => {
    setIsInitializing(true);
    setError(null);

    try {
      const success = await streamingService.initializeStream(config);
      if (!success) {
        setError('Failed to initialize stream');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const startStream = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      const success = await streamingService.startStream();
      if (!success) {
        setError('Failed to start stream');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    }
  }, []);

  const stopStream = useCallback(async (): Promise<void> => {
    setError(null);

    try {
      await streamingService.stopStream();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, []);

  const reconnectStream = useCallback(async (): Promise<boolean> => {
    setError(null);

    try {
      const success = await streamingService.reconnectStream();
      if (!success) {
        setError('Failed to reconnect stream');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Camera Management Functions
  const switchCameraLayout = useCallback(async (layout: CameraLayout): Promise<boolean> => {
    try {
      setError(null);
      const success = await streamingService.switchCameraLayout(layout);
      if (!success) {
        setError('Failed to switch camera layout');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    }
  }, []);

  const switchCamera = useCallback(() => {
    dualCameraManager.switchCamera();
  }, []);

  // Quality Management Functions
  const updateStreamQuality = useCallback(async (quality: '720p' | '1080p' | '480p' | '4K'): Promise<boolean> => {
    try {
      setError(null);
      const success = await streamingService.updateStreamQuality(quality);
      if (!success) {
        setError('Failed to update stream quality');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    }
  }, []);

  const setAutoQuality = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      await resolutionManager.setAutoQuality(enabled);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, []);

  const setBatteryOptimization = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      await resolutionManager.setBatteryOptimization(enabled);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    }
  }, []);

  // Performance Management Functions
  const startPerformanceMonitoring = useCallback(() => {
    performanceMonitor.startMonitoring();
    setIsPerformanceMonitoring(true);
  }, []);

  const stopPerformanceMonitoring = useCallback(() => {
    performanceMonitor.stopMonitoring();
    setIsPerformanceMonitoring(false);
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    performanceMonitor.resolveAlert(alertId);
    setPerformanceAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  // Utility Functions
  const updateNetworkSpeed = useCallback(async (speed: number): Promise<void> => {
    try {
      await resolutionManager.updateNetworkSpeed(speed);
    } catch (err) {
      console.error('Failed to update network speed:', err);
    }
  }, []);

  const updateBatteryLevel = useCallback(async (level: number): Promise<void> => {
    try {
      await resolutionManager.updateBatteryLevel(level);
    } catch (err) {
      console.error('Failed to update battery level:', err);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Streaming State
    isStreaming,
    streamStats,
    isInitializing,
    error,
    connectionStatus,
    
    // Performance Monitoring
    performanceMetrics,
    performanceAlerts,
    isPerformanceMonitoring,
    
    // Camera State
    cameraState,
    currentLayout,
    
    // Resolution Management
    resolutionSettings,
    
    // Core Streaming Functions
    initializeStream,
    startStream,
    stopStream,
    reconnectStream,
    
    // Camera Management
    switchCameraLayout,
    switchCamera,
    
    // Quality Management
    updateStreamQuality,
    setAutoQuality,
    setBatteryOptimization,
    
    // Performance Management
    startPerformanceMonitoring,
    stopPerformanceMonitoring,
    resolveAlert,
    
    // Utility Functions
    clearError,
    updateNetworkSpeed,
    updateBatteryLevel
  };
};