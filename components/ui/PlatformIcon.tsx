import React from 'react';
import { View, StyleSheet } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Colors } from '@/constants/Colors';

export type PlatformType = 'youtube' | 'facebook' | 'instagram' | 'twitch' | 'rtmp' | 'srt';

interface PlatformIconProps {
  platform: PlatformType;
  size?: number;
  color?: string;
  style?: any;
}

const getPlatformColor = (platform: PlatformType): string => {
  switch (platform) {
    case 'youtube': return '#FF0000';
    case 'facebook': return '#1877F2';
    case 'instagram': return '#E4405F';
    case 'twitch': return '#9146FF';
    case 'rtmp': return '#00ff88';
    case 'srt': return '#FFA500';
    default: return Colors.dark.tint;
  }
};

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  size = 24,
  color,
  style,
}) => {
  const iconColor = color || getPlatformColor(platform);

  const renderIcon = () => {
    switch (platform) {
      case 'youtube':
        return (
          <FontAwesome5 
            name="youtube" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
      case 'facebook':
        return (
          <FontAwesome5 
            name="facebook" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
      case 'instagram':
        return (
          <FontAwesome5 
            name="instagram" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
      case 'twitch':
        return (
          <FontAwesome5 
            name="twitch" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
      case 'rtmp':
        return (
          <MaterialIcons 
            name="wifi" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
      case 'srt':
        return (
          <MaterialIcons 
            name="speed" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
      default:
        return (
          <MaterialIcons 
            name="live-tv" 
            size={size} 
            color={iconColor} 
            style={style}
          />
        );
    }
  };

  return renderIcon();
};

// Platform data with proper typing
export const platforms = [
  {
    id: 'youtube',
    name: 'YouTube Live',
    color: '#FF0000',
    description: 'Stream to YouTube Live',
    badge: 'POPULAR',
  },
  {
    id: 'facebook',
    name: 'Facebook Live',
    color: '#1877F2',
    description: 'Broadcast on Facebook',
    badge: 'SOCIAL',
  },
  {
    id: 'instagram',
    name: 'Instagram Live',
    color: '#E4405F',
    description: 'Go live on Instagram',
    badge: 'SOCIAL',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    color: '#9146FF',
    description: 'Stream to Twitch',
    badge: 'GAMING',
  },
  {
    id: 'rtmp',
    name: 'Custom RTMP',
    color: '#00ff88',
    description: 'Use custom RTMP server',
    badge: 'CUSTOM',
  },
  {
    id: 'srt',
    name: 'SRT Protocol',
    color: '#FFA500',
    description: 'Low-latency SRT streaming',
    badge: 'PRO',
  },
] as const;