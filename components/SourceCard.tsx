import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface SourceCardProps {
  name: string;
  isOnAir: boolean;
  isSelected: boolean;
  onPress: () => void;
}

const Colors = {
  surface: '#1e293b', // slate-800
  surfaceHover: '#334155', // slate-700
  border: '#475569', // slate-600
  borderActive: '#22c55e', // green-400
  text: '#ffffff',
  danger: '#ef4444', // red-600
};

const SourceCard: React.FC<SourceCardProps> = ({ name, isOnAir, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      {!isOnAir && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>NO AR</Text>
        </View>
      )}
      
      {/* Camera Icon */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <IconSymbol name="video.fill" size={24} color={Colors.text} />
        </View>
        
        {/* Source Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.nameText}>{name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 16,
    minHeight: 80,
  },
  containerSelected: {
    borderColor: Colors.borderActive,
    backgroundColor: Colors.surfaceHover,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  statusText: {
    color: Colors.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#475569', // slate-600
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    alignItems: 'center',
  },
  nameText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SourceCard;