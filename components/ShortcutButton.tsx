import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '../utils/responsive';

interface ShortcutButtonProps {
  iconName: any;
  label: string;
  isActive: boolean;
  onPress?: () => void;
}

const Colors = {
  primary: '#22c55e', // green-500
  primaryHover: '#16a34a', // green-600
  surface: '#1e293b', // slate-800
  text: '#ffffff',
  textDark: '#0f172a', // slate-900
};

const ShortcutButton: React.FC<ShortcutButtonProps> = ({ iconName, label, isActive, onPress }) => {
  const responsive = useResponsive();
  const isMobile = responsive.deviceType.includes('phone');
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, isMobile && styles.containerMobile]}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isActive && styles.iconContainerActive,
        isMobile && styles.iconContainerMobile
      ]}>
        <IconSymbol 
          name={iconName} 
          size={isMobile ? 14 : 24} 
          color={isActive ? Colors.textDark : Colors.text} 
        />
      </View>
      <Text style={[styles.label, isMobile && styles.labelMobile]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  containerMobile: {
    gap: 1,
    padding: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainerMobile: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  iconContainerActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  labelMobile: {
    fontSize: 8,
  },
});

export default ShortcutButton;