export interface VideoSettings {
  quality: 'auto' | '360p' | '480p' | '720p' | '1080p' | '4K';
  frameRate: 30 | 60;
  bitrate: number; // in kbps
  hardwareAcceleration: boolean;
}

export interface AudioSettings {
  quality: 'low' | 'medium' | 'high' | 'ultra';
  microphoneGain: number; // 0-100
  noiseReduction: boolean;
  echoCancellation: boolean;
}

export interface AdvancedSettings {
  autoReconnect: boolean;
  bufferSize: number; // in seconds
  lowLatencyMode: boolean;
  streamKey: string;
  serverUrl: string;
}

export interface PrivacySettings {
  notifications: boolean;
  analytics: boolean;
  showViewerList: boolean;
  moderatorMode: boolean;
}

export interface AppSettings {
  video: VideoSettings;
  audio: AudioSettings;
  advanced: AdvancedSettings;
  privacy: PrivacySettings;
}

export const defaultSettings: AppSettings = {
  video: {
    quality: '720p',
    frameRate: 30,
    bitrate: 2500,
    hardwareAcceleration: true,
  },
  audio: {
    quality: 'high',
    microphoneGain: 50,
    noiseReduction: true,
    echoCancellation: true,
  },
  advanced: {
    autoReconnect: true,
    bufferSize: 2,
    lowLatencyMode: false,
    streamKey: '',
    serverUrl: '',
  },
  privacy: {
    notifications: true,
    analytics: false,
    showViewerList: true,
    moderatorMode: false,
  },
};