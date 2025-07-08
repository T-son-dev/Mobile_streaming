import { useState, useEffect, useCallback } from 'react';
import streamingService, { StreamConfig, StreamStats } from '../services/streamingService';

export interface UseStreamingReturn {
  isStreaming: boolean;
  streamStats: StreamStats;
  isInitializing: boolean;
  error: string | null;
  initializeStream: (config: StreamConfig) => Promise<boolean>;
  startStream: () => Promise<boolean>;
  stopStream: () => Promise<void>;
  reconnectStream: () => Promise<boolean>;
  clearError: () => void;
}

export const useStreaming = (): UseStreamingReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamStats, setStreamStats] = useState<StreamStats>({
    bitrate: '0kbps',
    fps: '0fps',
    duration: 0,
    isConnected: false,
    viewerCount: 0
  });

  // Update streaming state and stats
  useEffect(() => {
    const updateStats = () => {
      const stats = streamingService.getStreamStats();
      setStreamStats(stats);
      setIsStreaming(streamingService.isStreamingActive());
    };

    // Update stats every second
    const interval = setInterval(updateStats, 1000);
    
    // Initial update
    updateStats();

    return () => clearInterval(interval);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isStreaming,
    streamStats,
    isInitializing,
    error,
    initializeStream,
    startStream,
    stopStream,
    reconnectStream,
    clearError
  };
};