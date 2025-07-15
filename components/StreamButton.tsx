import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useResponsive } from '../utils/responsive';

interface StreamButtonProps {
  isStreaming: boolean;
  onToggle: () => void;
}

const Colors = {
  primary: '#22c55e', // green-500
  primaryHover: '#16a34a', // green-600
  danger: '#ef4444', // red-600
  dangerHover: '#dc2626', // red-700
  text: '#ffffff',
  textDark: '#0f172a', // slate-900
};

const StreamButton: React.FC<StreamButtonProps> = ({ isStreaming, onToggle }) => {
  const responsive = useResponsive();
  const isMobile = responsive.deviceType.includes('phone');
  const minTouchTarget = responsive.capabilities.minTouchTarget;
  
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.button,
        isStreaming ? styles.buttonDanger : styles.buttonPrimary,
        isMobile && styles.buttonMobile,
        { minHeight: minTouchTarget }
      ]}
      activeOpacity={0.8}
    >
      <Text style={[
        styles.buttonText,
        isStreaming ? styles.buttonTextLight : styles.buttonTextDark,
        isMobile && styles.buttonTextMobile
      ]}>
        {isStreaming ? 'STOP STREAMING' : 'START STREAMING'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonMobile: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: 120,
    maxWidth: '70%',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonDanger: {
    backgroundColor: Colors.danger,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextMobile: {
    fontSize: 12,
    fontWeight: '700',
  },
  buttonTextLight: {
    color: Colors.text,
  },
  buttonTextDark: {
    color: Colors.textDark,
  },
});

export default StreamButton;