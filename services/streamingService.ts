import { Alert } from 'react-native';

export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  platform: 'youtube' | 'facebook' | 'twitch' | 'custom';
  quality: '720p' | '1080p' | '480p';
  bitrate: number;
  fps: number;
}

export interface StreamStats {
  bitrate: string;
  fps: string;
  duration: number;
  isConnected: boolean;
  viewerCount?: number;
}

class StreamingService {
  private isStreaming = false;
  private streamConfig: StreamConfig | null = null;
  private startTime = 0;
  private statsInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  async initializeStream(config: StreamConfig): Promise<boolean> {
    try {
      // Validate configuration
      if (!config.rtmpUrl || !config.streamKey) {
        throw new Error('RTMP URL and Stream Key are required');
      }

      this.streamConfig = config;
      
      // In a real implementation, this would:
      // 1. Request camera/microphone permissions
      // 2. Initialize media capture
      // 3. Setup video encoding
      // 4. Connect to RTMP server
      
      console.log('Initializing stream with config:', config);
      
      // Simulate initialization delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Failed to initialize stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Stream Error', `Failed to initialize: ${errorMessage}`);
      return false;
    }
  }

  async startStream(): Promise<boolean> {
    if (!this.streamConfig) {
      Alert.alert('Error', 'Stream not initialized. Please configure stream settings first.');
      return false;
    }

    if (this.isStreaming) {
      console.warn('Stream already running');
      return true;
    }

    try {
      console.log('Starting stream...');
      
      // In a real implementation, this would:
      // 1. Start media capture
      // 2. Begin encoding
      // 3. Connect to RTMP endpoint
      // 4. Start pushing stream data
      
      this.isStreaming = true;
      this.startTime = Date.now();
      this.reconnectAttempts = 0;
      
      // Start stats monitoring
      this.startStatsMonitoring();
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Stream started successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to start stream:', error);
      this.isStreaming = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Stream Error', `Failed to start stream: ${errorMessage}`);
      return false;
    }
  }

  async stopStream(): Promise<void> {
    if (!this.isStreaming) {
      console.warn('No active stream to stop');
      return;
    }

    try {
      console.log('Stopping stream...');
      
      // Stop stats monitoring
      this.stopStatsMonitoring();
      
      // In a real implementation, this would:
      // 1. Stop media capture
      // 2. Close RTMP connection
      // 3. Clean up resources
      
      this.isStreaming = false;
      this.startTime = 0;
      
      console.log('Stream stopped successfully');
      
    } catch (error) {
      console.error('Error stopping stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Error', `Failed to stop stream: ${errorMessage}`);
    }
  }

  async reconnectStream(): Promise<boolean> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      Alert.alert('Connection Failed', 'Maximum reconnection attempts reached. Please check your internet connection and stream settings.');
      return false;
    }

    console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
    
    this.reconnectAttempts++;
    
    // Stop current stream
    await this.stopStream();
    
    // Wait before reconnecting
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Attempt to restart
    return await this.startStream();
  }

  private startStatsMonitoring(): void {
    this.statsInterval = setInterval(() => {
      // In a real implementation, this would collect actual metrics
      // For now, we'll simulate realistic streaming stats
    }, 1000);
  }

  private stopStatsMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  getStreamStats(): StreamStats {
    const duration = this.isStreaming ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    
    // Simulate realistic streaming stats
    const baseBitrate = this.streamConfig?.bitrate || 3000;
    const bitrate = this.isStreaming ? 
      `${Math.floor(baseBitrate + (Math.random() - 0.5) * 200)}kbps` : '0kbps';
    
    const baseFps = this.streamConfig?.fps || 30;
    const fps = this.isStreaming ? 
      `${Math.floor(baseFps + (Math.random() - 0.5) * 2)}fps` : '0fps';

    return {
      bitrate,
      fps,
      duration,
      isConnected: this.isStreaming,
      viewerCount: this.isStreaming ? Math.floor(Math.random() * 100) : 0
    };
  }

  isStreamingActive(): boolean {
    return this.isStreaming;
  }

  getCurrentConfig(): StreamConfig | null {
    return this.streamConfig;
  }

  // Platform-specific RTMP URL generators
  static getYouTubeRTMPUrl(): string {
    return 'rtmp://a.rtmp.youtube.com/live2/';
  }

  static getFacebookRTMPUrl(): string {
    return 'rtmps://live-api-s.facebook.com:443/rtmp/';
  }

  static getTwitchRTMPUrl(): string {
    return 'rtmp://live.twitch.tv/app/';
  }

  // Quality presets
  static getQualityPresets(): Record<string, { bitrate: number; fps: number }> {
    return {
      '480p': { bitrate: 1500, fps: 30 },
      '720p': { bitrate: 3000, fps: 30 },
      '1080p': { bitrate: 6000, fps: 60 }
    };
  }
}

export const streamingService = new StreamingService();
export default streamingService;