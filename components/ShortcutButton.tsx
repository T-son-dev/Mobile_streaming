import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

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
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        isActive && styles.iconContainerActive
      ]}>
        <IconSymbol 
          name={iconName} 
          size={24} 
          color={isActive ? Colors.textDark : Colors.text} 
        />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
    padding: 8,
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
  iconContainerActive: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default ShortcutButton;