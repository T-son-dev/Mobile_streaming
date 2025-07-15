import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '../utils/responsive';

interface MonitoringIndicatorProps {
  audioLevel: number;
  bitrate: string;
  fps: string;
}

const Colors = {
  primary: '#22c55e', // green-400
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  text: '#ffffff',
  surface: '#475569', // slate-600
};

const MonitoringIndicator: React.FC<MonitoringIndicatorProps> = ({ audioLevel, bitrate, fps }) => {
  const responsive = useResponsive();
  const isMobile = responsive.deviceType.includes('phone');
  
  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      {/* Microphone Icon and Audio Bar */}
      <View style={styles.audioContainer}>
        <View style={styles.audioRow}>
          <IconSymbol name="mic.fill" size={isMobile ? 10 : 16} color={Colors.primary} />
          <View style={[styles.audioBar, isMobile && styles.audioBarMobile]}>
            <View style={[
              styles.audioLevel,
              { width: `${audioLevel}%` }
            ]} />
          </View>
        </View>
        
        {/* Stats */}
        <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
          <Text style={[styles.statText, isMobile && styles.statTextMobile]}>{bitrate}</Text>
          <Text style={[styles.statText, isMobile && styles.statTextMobile]}>{fps}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  containerMobile: {
    alignItems: 'center',
  },
  audioContainer: {
    gap: 8,
  },
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioBar: {
    width: 120,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  audioBarMobile: {
    width: 40,
    height: 3,
  },
  audioLevel: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
    // Gradient effect from red to yellow to green
    // This is a simplified version - in React Native you'd need react-native-linear-gradient
    // for a proper gradient
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    marginLeft: 24, // Align with audio bar
  },
  statsRowMobile: {
    width: 40,
    marginLeft: 8,
  },
  statText: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '500',
  },
  statTextMobile: {
    fontSize: 6,
  },
});

export default MonitoringIndicator;