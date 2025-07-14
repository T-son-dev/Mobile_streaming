export interface RTMPConfig {
  url: string;
  streamKey: string;
  video: {
    preset: number;
    bitrate: number;
    profile: number;
    fps: number;
    videoFrontMirror: boolean;
  };
  audio: {
    bitrate: number;
    profile: number;
    samplerate: number;
  };
}

export class MockRTMPPublisher {
  private config: RTMPConfig | null = null;
  private isPublishing = false;
  private listeners: Map<string, Function[]> = new Map();

  setConfig(config: RTMPConfig): void {
    this.config = config;
    console.log('Mock RTMP Publisher configured:', config);
  }

  async start(): Promise<void> {
    if (!this.config) {
      throw new Error('RTMP Publisher not configured');
    }

    console.log('Mock RTMP Publisher starting...');
    this.isPublishing = true;
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.emit('onStateChange', 'CONNECTING');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.emit('onStateChange', 'CONNECTED');
    console.log('Mock RTMP Publisher connected successfully');
  }

  async stop(): Promise<void> {
    console.log('Mock RTMP Publisher stopping...');
    this.isPublishing = false;
    
    this.emit('onStateChange', 'DISCONNECTED');
    console.log('Mock RTMP Publisher stopped');
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  removeAllListeners(): void {
    this.listeners.clear();
  }

  private emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => callback(...args));
  }

  isActive(): boolean {
    return this.isPublishing;
  }

  // Simulate network statistics
  getStats(): { bitrate: number; fps: number; droppedFrames: number } {
    if (!this.isPublishing) {
      return { bitrate: 0, fps: 0, droppedFrames: 0 };
    }
    
    return {
      bitrate: Math.floor(Math.random() * 1000) + 2000,
      fps: Math.floor(Math.random() * 5) + 25,
      droppedFrames: Math.floor(Math.random() * 10)
    };
  }
}