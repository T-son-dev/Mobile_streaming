import { CameraLayout } from '../services/DualCameraManager';

export interface StreamingConfig {
  rtmpUrl: string;
  streamKey: string;
  platform: 'youtube' | 'twitch' | 'facebook' | 'custom';
  quality: '720p' | '1080p' | '480p' | '4K';
  bitrate: number;
  fps: number;
  enableAudio: boolean;
  cameraLayout: CameraLayout;
}

// Pre-configured streaming setups
export const StreamingConfigs = {
  // Local test server
  local: {
    rtmpUrl: 'rtmp://146.19.215.133:1935/live/',
    streamKey: 'test',
    platform: 'custom' as const,
    quality: '720p' as const,
    bitrate: 3000,
    fps: 30,
    enableAudio: true,
    cameraLayout: CameraLayout.SINGLE_BACK
  },

  // YouTube Live streaming
  youtube: {
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2/',
    streamKey: 'YOUR_YOUTUBE_STREAM_KEY', // Replace with your actual YouTube stream key
    platform: 'youtube' as const,
    quality: '720p' as const,
    bitrate: 3000,
    fps: 30,
    enableAudio: true,
    cameraLayout: CameraLayout.SINGLE_BACK
  },

  // Twitch Live streaming
  twitch: {
    rtmpUrl: 'rtmp://live.twitch.tv/app/',
    streamKey: 'YOUR_TWITCH_STREAM_KEY', // Replace with your actual Twitch stream key
    platform: 'twitch' as const,
    quality: '720p' as const,
    bitrate: 3000,
    fps: 30,
    enableAudio: true,
    cameraLayout: CameraLayout.SINGLE_BACK
  },

  // Facebook Live streaming
  facebook: {
    rtmpUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    streamKey: 'YOUR_FACEBOOK_STREAM_KEY', // Replace with your actual Facebook stream key
    platform: 'facebook' as const,
    quality: '720p' as const,
    bitrate: 3000,
    fps: 30,
    enableAudio: true,
    cameraLayout: CameraLayout.SINGLE_BACK
  }
};

// Currently active configuration - change this to test different platforms
export const CURRENT_STREAMING_CONFIG = StreamingConfigs.local;

// Instructions for getting stream keys:
export const SETUP_INSTRUCTIONS = {
  youtube: [
    '1. Go to YouTube Studio (studio.youtube.com)',
    '2. Click "Go Live" in the top right',
    '3. Select "Stream" tab',
    '4. Copy the "Stream key" from the stream settings',
    '5. Replace YOUR_YOUTUBE_STREAM_KEY in this file'
  ],
  
  twitch: [
    '1. Go to Twitch Creator Dashboard (dashboard.twitch.tv)',
    '2. Click "Settings" → "Stream"',
    '3. Copy the "Primary Stream key"',
    '4. Replace YOUR_TWITCH_STREAM_KEY in this file'
  ],
  
  facebook: [
    '1. Go to Facebook Creator Studio (business.facebook.com/creatorstudio)',
    '2. Click "Go Live" → "Live Producer"',
    '3. Copy the "Stream Key" from the setup page',
    '4. Replace YOUR_FACEBOOK_STREAM_KEY in this file'
  ]
};