import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
  return (
    <View style={styles.container}>
      {/* Microphone Icon and Audio Bar */}
      <View style={styles.audioContainer}>
        <View style={styles.audioRow}>
          <IconSymbol name="mic.fill" size={16} color={Colors.primary} />
          <View style={styles.audioBar}>
            <View style={[
              styles.audioLevel,
              { width: `${audioLevel}%` }
            ]} />
          </View>
        </View>
        
        {/* Stats */}
        <View style={styles.statsRow}>
          <Text style={styles.statText}>{bitrate}</Text>
          <Text style={styles.statText}>{fps}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
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
  statText: {
    fontSize: 10,
    color: Colors.text,
    fontWeight: '500',
  },
});

export default MonitoringIndicator;