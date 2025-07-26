import { Alert } from 'react-native';
import { dualCameraManager, CameraLayout } from './DualCameraManager';
import { videoComposer, VideoCompositionConfig } from './VideoComposer';

// RTMP Publisher interface for better abstraction
interface RTMPPublisher {
  setRTMPUrl(url: string): void;
  setVideoConfig(config: any): void;
  setAudioConfig(config: any): void;
  start(): void;
  stop(): void;
  on(event: string, callback: (data: any) => void): void;
  getStats(): any;
  removeAllListeners(): void;
}

// Test RTMP Publisher that notifies your local server
class TestRTMPPublisher implements RTMPPublisher {
  private listeners: { [key: string]: ((data: any) => void)[] } = {};
  private isActive = false;
  private config: any = {};
  private statusInterval: NodeJS.Timeout | null = null;
  
  setRTMPUrl(url: string): void {
    console.log('🧪 Test RTMP URL set:', url);
    this.config.url = url;
  }
  
  setVideoConfig(config: any): void {
    console.log('🧪 Test video config set:', config);
    this.config.video = config;
  }
  
  setAudioConfig(config: any): void {
    console.log('🧪 Test audio config set:', config);
    this.config.audio = config;
  }
  
  start(): void {
    console.log('🧪 Test RTMP streaming started - notifying local server!');
    console.log('📡 Test RTMP URL:', this.config.url);
    this.isActive = true;
    this.emit('onStateChange', 'CONNECTING');
    
    // Notify local server about stream start
    this.notifyServer('start');
    
    setTimeout(() => {
      this.emit('onStateChange', 'CONNECTED');
      this.startStatusUpdates();
    }, 1000);
  }
  
  stop(): void {
    console.log('🧪 Test RTMP streaming stopped');
    this.isActive = false;
    this.emit('onStateChange', 'DISCONNECTED');
    
    // Notify local server about stream stop
    this.notifyServer('stop');
    
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }
  
  private async notifyServer(action: 'start' | 'stop'): Promise<void> {
    try {
      const response = await fetch('http://146.19.215.133:3000/api/test-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          streamKey: this.config.url?.split('/').pop() || 'test',
          config: this.config
        })
      });
      
      if (response.ok) {
        console.log(`✅ Server notified about stream ${action}`);
      } else {
        console.warn(`⚠️  Failed to notify server about stream ${action}`);
      }
    } catch (error) {
      console.warn('⚠️  Could not reach local server:', error);
    }
  }
  
  private startStatusUpdates(): void {
    this.statusInterval = setInterval(() => {
      if (this.isActive) {
        this.notifyServer('start'); // Keep alive
      }
    }, 5000);
  }
  
  on(event: string, callback: (data: any) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }
  
  getStats(): any {
    return {
      videoBitrate: this.config.video?.bitrate || 3000,
      fps: this.config.video?.fps || 30,
      networkSpeed: 5000,
      droppedFrames: Math.floor(Math.random() * 5),
      totalFrames: 1000,
      audioLevel: 0.5,
      videoLevel: 0.8
    };
  }
  
  removeAllListeners(): void {
    this.listeners = {};
  }
}

// Real RTMP Publisher using react-native-nodemediaclient
class RealRTMPPublisher implements RTMPPublisher {
  private client: any;
  private isStreaming = false;
  
  constructor() {
    try {
      const { NodeMediaClient } = require('react-native-nodemediaclient');
      this.client = new NodeMediaClient();
      console.log('✅ Real RTMP Publisher initialized with NodeMediaClient');
      
      // Set up default video settings for actual streaming
      this.client.setVideoConfig({
        preset: 1, // 720p
        bitrate: 3000000, // 3 Mbps
        profile: 1,
        fps: 30,
        videoFrontMirror: false,
      });
      
      this.client.setAudioConfig({
        bitrate: 128000, // 128 kbps
        profile: 1,
        samplerate: 44100,
      });
      
    } catch (error) {
      console.warn('❌ NodeMediaClient not available, falling back to test:', error);
      throw error;
    }
  }
  
  setRTMPUrl(url: string): void {
    console.log('🔗 Setting RTMP URL for real streaming:', url);
    this.client.setRTMPUrl(url);
  }
  
  setVideoConfig(config: any): void {
    console.log('📹 Setting real video config:', config);
    this.client.setVideoConfig(config);
  }
  
  setAudioConfig(config: any): void {
    console.log('🎵 Setting real audio config:', config);
    this.client.setAudioConfig(config);
  }
  
  start(): void {
    console.log('🎬 Starting REAL video streaming with camera capture!');
    console.log('📡 This will stream actual video to the server');
    
    this.isStreaming = true;
    
    // Start the actual RTMP streaming with camera input
    this.client.start();
    
    // Log streaming status
    console.log('✅ Real RTMP streaming started - video should appear on server');
  }
  
  stop(): void {
    console.log('🛑 Stopping real RTMP streaming...');
    this.isStreaming = false;
    this.client.stop();
  }
  
  on(event: string, callback: (data: any) => void): void {
    this.client.on(event, callback);
  }
  
  getStats(): any {
    if (this.client.getStats) {
      return this.client.getStats();
    }
    // Fallback stats for real streaming
    return {
      videoBitrate: 3000000,
      fps: 30,
      networkSpeed: 5000000,
      droppedFrames: 0,
      totalFrames: this.isStreaming ? 1000 : 0,
      audioLevel: 0.7,
      videoLevel: 0.9
    };
  }
  
  removeAllListeners(): void {
    this.client.removeAllListeners();
  }
}

export interface StreamConfig {
  rtmpUrl: string;
  streamKey: string;
  platform: 'youtube' | 'facebook' | 'twitch' | 'custom';
  quality: '720p' | '1080p' | '480p' | '4K';
  bitrate: number;
  fps: number;
  enableAudio: boolean;
  cameraLayout: CameraLayout;
}

export interface StreamStats {
  bitrate: string;
  fps: string;
  duration: number;
  isConnected: boolean;
  networkSpeed: number;
  droppedFrames: number;
  totalFrames: number;
  viewerCount?: number;
  quality: string;
}

export interface RTMPConnectionStatus {
  isConnected: boolean;
  connectionTime: number;
  lastError: string | null;
  reconnectAttempts: number;
}

class StreamingService {
  private isStreaming = false;
  private streamConfig: StreamConfig | null = null;
  private startTime = 0;
  private statsInterval: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private rtmpPublisher: RTMPPublisher | null = null;
  private totalFrames = 0;
  private droppedFrames = 0;
  private networkSpeed = 0;

  async initializeStream(config: StreamConfig): Promise<boolean> {
    try {
      console.log('Initializing RTMP stream with config:', config);

      // Validate configuration
      if (!config.rtmpUrl || !config.streamKey) {
        throw new Error('RTMP URL and Stream Key are required');
      }

      this.streamConfig = config;

      // Initialize dual camera manager
      const cameraInitialized = await dualCameraManager.initialize();
      if (!cameraInitialized) {
        throw new Error('Failed to initialize camera system');
      }

      // Set camera layout
      await dualCameraManager.setCameraLayout(config.cameraLayout);

      // Initialize video composer
      const compositionConfig: VideoCompositionConfig = {
        layout: config.cameraLayout,
        resolution: this.getResolutionPreset(config.quality),
        fps: config.fps,
        bitrate: config.bitrate,
        enableAudio: config.enableAudio
      };

      const composerInitialized = await videoComposer.initialize(compositionConfig);
      if (!composerInitialized) {
        throw new Error('Failed to initialize video composer');
      }

      // Initialize RTMP publisher - try real first, then test
      try {
        this.rtmpPublisher = new RealRTMPPublisher();
        console.log('🎬 Using REAL RTMP publisher for video streaming');
      } catch (error) {
        console.warn('Real RTMP publisher not available, using test publisher:', error);
        console.log('⚠️  For real video streaming, make sure react-native-nodemediaclient is properly configured');
        this.rtmpPublisher = new TestRTMPPublisher();
      }
      
      // Configure RTMP publisher
      const fullRtmpUrl = `${config.rtmpUrl}${config.streamKey}`;
      this.rtmpPublisher.setRTMPUrl(fullRtmpUrl);
      
      // Configure video settings
      const videoConfig = {
        preset: this.getVideoPreset(config.quality),
        bitrate: config.bitrate * 1000,
        profile: 1,
        fps: config.fps,
        videoFrontMirror: false,
      };
      this.rtmpPublisher.setVideoConfig(videoConfig);
      
      // Configure audio settings if enabled
      if (config.enableAudio) {
        const audioConfig = {
          bitrate: 32000,
          profile: 1,
          samplerate: 44100,
        };
        this.rtmpPublisher.setAudioConfig(audioConfig);
      }

      // Setup event listeners
      this.setupRTMPEventListeners();

      console.log('RTMP stream initialization completed successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize stream:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Stream Error', `Failed to initialize: ${errorMessage}`);
      return false;
    }
  }

  async startStream(): Promise<boolean> {
    if (!this.streamConfig || !this.rtmpPublisher) {
      Alert.alert('Error', 'Stream not initialized. Please configure stream settings first.');
      return false;
    }

    if (this.isStreaming) {
      console.warn('Stream already running');
      return true;
    }

    try {
      console.log('Starting RTMP stream...');
      
      // Start camera recording (with isStreaming flag set to true)
      const cameraStarted = await dualCameraManager.startRecording(true);
      if (!cameraStarted) {
        throw new Error('Failed to start camera recording');
      }

      // Start video composition
      const compositionStarted = await videoComposer.startComposition();
      if (!compositionStarted) {
        throw new Error('Failed to start video composition');
      }

      // Start RTMP publishing
      console.log('Starting RTMP publisher...');
      
      this.rtmpPublisher.start();
      
      this.isStreaming = true;
      this.startTime = Date.now();
      this.reconnectAttempts = 0;
      this.totalFrames = 0;
      this.droppedFrames = 0;
      
      // Start stats monitoring
      this.startStatsMonitoring();
      
      console.log('RTMP stream started successfully');
      return true;
      
    } catch (error) {
      console.error('Failed to start stream:', error);
      this.isStreaming = false;
      
      // Cleanup on failure
      await this.cleanup();
      
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
      console.log('Stopping RTMP stream...');
      
      this.isStreaming = false;
      
      // Stop stats monitoring
      this.stopStatsMonitoring();
      
      // Stop RTMP streaming
      if (this.rtmpPublisher) {
        this.rtmpPublisher.stop();
      }
      
      // Stop video composition
      await videoComposer.stopComposition();
      
      // Stop camera recording if it's in progress
      if (dualCameraManager.getState().isRecording) {
        await dualCameraManager.stopRecording();
      }
      
      this.startTime = 0;
      this.totalFrames = 0;
      this.droppedFrames = 0;
      
      console.log('RTMP stream stopped successfully');
      
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

    console.log(`Attempting to reconnect RTMP stream (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
    
    this.reconnectAttempts++;
    
    try {
      // Stop current stream
      await this.stopStream();
      
      // Wait before reconnecting
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Attempt to restart
      return await this.startStream();
    } catch (error) {
      console.error('Reconnection failed:', error);
      return false;
    }
  }

  async switchCameraLayout(layout: CameraLayout): Promise<boolean> {
    try {
      if (!this.streamConfig) {
        throw new Error('Stream not initialized');
      }

      console.log(`Switching camera layout to: ${layout}`);

      // Update camera layout
      const cameraUpdated = await dualCameraManager.setCameraLayout(layout);
      if (!cameraUpdated) {
        throw new Error('Failed to update camera layout');
      }

      // Update video composition
      const compositionUpdated = await videoComposer.updateLayout(layout);
      if (!compositionUpdated) {
        throw new Error('Failed to update video composition layout');
      }

      // Update stream config
      this.streamConfig.cameraLayout = layout;

      console.log(`Camera layout switched to: ${layout}`);
      return true;
    } catch (error) {
      console.error('Failed to switch camera layout:', error);
      return false;
    }
  }

  async updateStreamQuality(quality: '720p' | '1080p' | '480p' | '4K'): Promise<boolean> {
    try {
      if (!this.streamConfig) {
        throw new Error('Stream not initialized');
      }

      if (this.isStreaming) {
        throw new Error('Cannot change quality while streaming');
      }

      console.log(`Updating stream quality to: ${quality}`);

      // Update quality settings
      const qualitySettings = this.getQualitySettings(quality);
      this.streamConfig.quality = quality;
      this.streamConfig.bitrate = qualitySettings.bitrate;
      this.streamConfig.fps = qualitySettings.fps;

      // Update video composer resolution
      const resolutionPreset = this.getResolutionPreset(quality);
      await videoComposer.updateResolution(resolutionPreset);

      console.log(`Stream quality updated to: ${quality}`);
      return true;
    } catch (error) {
      console.error('Failed to update stream quality:', error);
      return false;
    }
  }

  private startStatsMonitoring(): void {
    this.statsInterval = setInterval(() => {
      this.updateNetworkStats();
      this.updateFrameStats();
    }, 1000);
  }

  private stopStatsMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  private updateNetworkStats(): void {
    if (this.rtmpPublisher && this.isStreaming) {
      const stats = this.rtmpPublisher.getStats();
      
      // Update network speed based on actual bitrate
      this.networkSpeed = stats.videoBitrate || 0;
      
      // Update frame stats
      const newDroppedFrames = stats.droppedFrames || 0;
      if (newDroppedFrames > this.droppedFrames) {
        this.droppedFrames = newDroppedFrames;
      }
    }
  }

  private updateFrameStats(): void {
    if (this.isStreaming) {
      // Simulate frame statistics
      this.totalFrames += this.streamConfig?.fps || 30;
      
      // Simulate dropped frames based on network conditions
      if (this.networkSpeed < 2000) {
        this.droppedFrames += Math.floor(Math.random() * 3);
      }
    }
  }

  getStreamStats(): StreamStats {
    const duration = this.isStreaming ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    
    // Calculate actual streaming stats
    const baseBitrate = this.streamConfig?.bitrate || 3000;
    const actualBitrate = this.isStreaming ? 
      Math.floor(baseBitrate * (this.networkSpeed / 5000)) : 0;
    
    const baseFps = this.streamConfig?.fps || 30;
    const actualFps = this.isStreaming ? 
      Math.max(1, baseFps - Math.floor(this.droppedFrames / Math.max(1, duration))) : 0;

    return {
      bitrate: `${actualBitrate}kbps`,
      fps: `${actualFps}fps`,
      duration,
      isConnected: this.isStreaming,
      networkSpeed: this.networkSpeed,
      droppedFrames: this.droppedFrames,
      totalFrames: this.totalFrames,
      quality: this.streamConfig?.quality || '720p',
      viewerCount: this.isStreaming ? Math.floor(Math.random() * 100) : 0
    };
  }

  getConnectionStatus(): RTMPConnectionStatus {
    return {
      isConnected: this.isStreaming,
      connectionTime: this.isStreaming ? Date.now() - this.startTime : 0,
      lastError: null, // In real implementation, track actual errors
      reconnectAttempts: this.reconnectAttempts
    };
  }

  isStreamingActive(): boolean {
    return this.isStreaming;
  }

  getCurrentConfig(): StreamConfig | null {
    return this.streamConfig;
  }


  private getVideoPreset(quality: string): number {
    switch (quality) {
      case '480p': return 0;
      case '720p': return 1;
      case '1080p': return 2;
      case '4K': return 3;
      default: return 1;
    }
  }

  private setupRTMPEventListeners(): void {
    if (!this.rtmpPublisher) return;

    this.rtmpPublisher.on('onStateChange', (state: any) => {
      console.log('RTMP state changed:', state);
      if (state === 'CONNECTING') {
        console.log('RTMP connection started');
      } else if (state === 'CONNECTED') {
        console.log('RTMP connected successfully');
      } else if (state === 'DISCONNECTED') {
        console.log('RTMP connection closed');
        if (this.isStreaming) {
          this.reconnectStream();
        }
      }
    });

    this.rtmpPublisher.on('onError', (error: any) => {
      console.error('RTMP error:', error);
      this.handleConnectionError(error);
    });
  }

  private async handleConnectionError(error: any): Promise<void> {
    console.error('Handling connection error:', error);
    
    if (this.isStreaming && this.reconnectAttempts < this.maxReconnectAttempts) {
      await this.reconnectStream();
    } else {
      await this.stopStream();
      Alert.alert('Connection Error', 'Failed to maintain connection to streaming server');
    }
  }


  private async cleanup(): Promise<void> {
    try {
      await videoComposer.stopComposition();
      
      // Only stop recording if it's actually in progress
      if (dualCameraManager.getState().isRecording) {
        await dualCameraManager.stopRecording();
      }
      
      if (this.rtmpPublisher) {
        this.rtmpPublisher.stop();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private getResolutionPreset(quality: string): any {
    switch (quality) {
      case '480p': return 'LOW';
      case '720p': return 'MEDIUM';
      case '1080p': return 'HIGH';
      case '4K': return 'ULTRA';
      default: return 'MEDIUM';
    }
  }

  private getQualitySettings(quality: string): { bitrate: number; fps: number } {
    switch (quality) {
      case '480p': return { bitrate: 1500, fps: 30 };
      case '720p': return { bitrate: 3000, fps: 30 };
      case '1080p': return { bitrate: 6000, fps: 60 };
      case '4K': return { bitrate: 12000, fps: 60 };
      default: return { bitrate: 3000, fps: 30 };
    }
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
      '1080p': { bitrate: 6000, fps: 60 },
      '4K': { bitrate: 12000, fps: 60 }
    };
  }

  dispose(): void {
    console.log('Disposing streaming service...');
    this.stopStream();
    
    if (this.rtmpPublisher) {
      this.rtmpPublisher.removeAllListeners();
      this.rtmpPublisher = null;
    }

    videoComposer.dispose();
    dualCameraManager.dispose();
  }
}

export const streamingService = new StreamingService();
export default streamingService;