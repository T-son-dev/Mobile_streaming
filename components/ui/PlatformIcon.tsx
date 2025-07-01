import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type PlatformType = 'youtube' | 'facebook' | 'instagram' | 'twitch' | 'rtmp' | 'srt' | 'recording';

interface PlatformIconProps {
  platform: PlatformType;
  size?: number;
  color?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ 
  platform, 
  size = 24, 
  color = '#ffffff' 
}) => {
  const iconSize = size;
  const fontSize = size * 0.6;

  const renderIcon = () => {
    switch (platform) {
      case 'youtube':
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <View style={[styles.playIcon, { 
              borderLeftWidth: fontSize * 0.4,
              borderTopWidth: fontSize * 0.25,
              borderBottomWidth: fontSize * 0.25,
            }]} />
          </View>
        );

      case 'facebook':
        return (
          <View style={[styles.iconContainer, { 
            width: iconSize, 
            height: iconSize, 
            backgroundColor: '#ffffff',
            borderRadius: 6,
          }]}>
            <Text style={[styles.facebookIcon, { 
              fontSize: fontSize,
              color: '#1877F2'
            }]}>
              f
            </Text>
          </View>
        );

      case 'instagram':
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <View style={[styles.cameraBody, { 
              width: fontSize * 0.8,
              height: fontSize * 0.6,
              borderRadius: fontSize * 0.1,
            }]}>
              <View style={[styles.cameraLens, {
                width: fontSize * 0.3,
                height: fontSize * 0.3,
                borderRadius: fontSize * 0.15,
              }]} />
            </View>
          </View>
        );

      case 'twitch':
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <View style={[styles.gamepadBody, {
              width: fontSize * 0.9,
              height: fontSize * 0.6,
              borderRadius: fontSize * 0.1,
            }]}>
              <View style={styles.gamepadButtons}>
                <View style={[styles.gamepadButton, {
                  width: fontSize * 0.15,
                  height: fontSize * 0.15,
                }]} />
                <View style={[styles.gamepadButton, {
                  width: fontSize * 0.15,
                  height: fontSize * 0.15,
                }]} />
              </View>
            </View>
          </View>
        );

      case 'rtmp':
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <View style={styles.wifiContainer}>
              <View style={[styles.wifiArc1, {
                width: fontSize * 0.8,
                height: fontSize * 0.4,
                borderRadius: fontSize * 0.4,
                borderWidth: 2,
              }]} />
              <View style={[styles.wifiArc2, {
                width: fontSize * 0.6,
                height: fontSize * 0.3,
                borderRadius: fontSize * 0.3,
                borderWidth: 2,
              }]} />
              <View style={[styles.wifiDot, {
                width: fontSize * 0.15,
                height: fontSize * 0.15,
                borderRadius: fontSize * 0.075,
              }]} />
            </View>
          </View>
        );

      case 'srt':
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <View style={[styles.lightningBolt, {
              width: fontSize * 0.5,
              height: fontSize * 0.8,
            }]}>
              <Text style={[styles.lightningText, { fontSize: fontSize * 0.8 }]}>⚡</Text>
            </View>
          </View>
        );

      case 'recording':
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <View style={[styles.recordDot, {
              width: fontSize * 0.8,
              height: fontSize * 0.8,
              borderRadius: fontSize * 0.4,
            }]} />
            <View style={[styles.recordRing, {
              width: fontSize,
              height: fontSize,
              borderRadius: fontSize * 0.5,
              borderWidth: 2,
            }]} />
          </View>
        );

      default:
        return (
          <View style={[styles.iconContainer, { width: iconSize, height: iconSize }]}>
            <Text style={[styles.defaultIcon, { fontSize: fontSize }]}>?</Text>
          </View>
        );
    }
  };

  return renderIcon();
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // YouTube Play Icon
  playIcon: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: '#ffffff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightWidth: 0,
  },
  
  // Facebook Icon
  facebookIcon: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Instagram Camera Icon
  cameraBody: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraLens: {
    backgroundColor: '#E4405F',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  
  // Twitch Gamepad Icon
  gamepadBody: {
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gamepadButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  gamepadButton: {
    backgroundColor: '#9146FF',
    borderRadius: 2,
  },
  
  // RTMP WiFi Icon
  wifiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wifiArc1: {
    borderColor: '#ffffff',
    borderBottomWidth: 0,
    position: 'absolute',
    bottom: 8,
  },
  wifiArc2: {
    borderColor: '#ffffff',
    borderBottomWidth: 0,
    position: 'absolute',
    bottom: 6,
  },
  wifiDot: {
    backgroundColor: '#ffffff',
    position: 'absolute',
    bottom: 2,
  },
  
  // SRT Lightning Icon
  lightningBolt: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lightningText: {
    color: '#ffffff',
  },
  
  // Recording Icon
  recordDot: {
    backgroundColor: '#ffffff',
    position: 'absolute',
  },
  recordRing: {
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  
  // Default Icon
  defaultIcon: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default PlatformIcon;