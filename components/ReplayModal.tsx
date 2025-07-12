import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaySettingsChange: (enabled: boolean, seconds: number) => void;
  onLastMovePress: () => void;
  onBestMomentsPress: () => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.3)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#22c55e', // green-500
  accent: '#84cc16', // lime-500
  border: '#e5e7eb',
};

const ReplayModal: React.FC<ReplayModalProps> = ({ 
  isOpen, 
  onClose, 
  onReplaySettingsChange,
  onLastMovePress,
  onBestMomentsPress 
}) => {
  const [isReplayEnabled, setIsReplayEnabled] = useState(false);
  const [selectedSeconds, setSelectedSeconds] = useState(8);

  if (!isOpen) return null;

  const handleReplayToggle = (value: boolean) => {
    setIsReplayEnabled(value);
    onReplaySettingsChange(value, selectedSeconds);
  };

  const handleSecondsChange = (seconds: number) => {
    setSelectedSeconds(seconds);
    if (isReplayEnabled) {
      onReplaySettingsChange(isReplayEnabled, seconds);
    }
  };

  const incrementSeconds = () => {
    if (selectedSeconds < 10) {
      handleSecondsChange(selectedSeconds + 1);
    }
  };

  const decrementSeconds = () => {
    if (selectedSeconds > 1) {
      handleSecondsChange(selectedSeconds - 1);
    }
  };

  return (
    <>
      {/* Overlay to close when clicking outside */}
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <View style={styles.container}>
        {/* Triangle pointer */}
        <View style={styles.triangle} />
        
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        
        <View style={styles.content}>
          {/* Main Row - Replay Toggle and Seconds Controller side by side */}
          <View style={styles.mainRow}>
            {/* Left Side - Replay Toggle */}
            <View style={styles.replaySection}>
              <Text style={styles.replayLabel}>Replay</Text>
              <Switch
                value={isReplayEnabled}
                onValueChange={handleReplayToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={isReplayEnabled ? '#ffffff' : '#f3f4f6'}
                style={styles.switch}
              />
            </View>
            
            {/* Right Side - Seconds Controller */}
            <View style={styles.secondsSection}>
              <Text style={styles.secondsLabel}>Segundos</Text>
              <View style={styles.secondsController}>
                <TouchableOpacity 
                  style={[styles.secondsButton, selectedSeconds <= 1 && styles.secondsButtonDisabled]}
                  onPress={decrementSeconds}
                  disabled={selectedSeconds <= 1}
                >
                  <Text style={[styles.secondsButtonText, selectedSeconds <= 1 && styles.secondsButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                
                <View style={styles.secondsDisplay}>
                  <Text style={styles.secondsValue}>{selectedSeconds}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[styles.secondsButton, selectedSeconds >= 10 && styles.secondsButtonDisabled]}
                  onPress={incrementSeconds}
                  disabled={selectedSeconds >= 10}
                >
                  <Text style={[styles.secondsButtonText, selectedSeconds >= 10 && styles.secondsButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    top: 90,
    left: 16, // Position directly under the gobackward button (first button)
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    left: 24, // Center triangle above the gobackward button
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    paddingTop: 8,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  replaySection: {
    flex: 1,
    alignItems: 'center',
  },
  replayLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
  },
  secondsSection: {
    flex: 1,
    alignItems: 'center',
  },
  secondsLabel: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
  },
  secondsController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 3,
    paddingVertical: 3,
  },
  secondsButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondsButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondsButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  secondsDisplay: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  secondsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ReplayModal;