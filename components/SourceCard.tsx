import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '../utils/responsive';

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
  const responsive = useResponsive();
  const isMobile = responsive.isMobile;
  const isNativeMobile = responsive.isNativeMobile;
  const isPortrait = responsive.orientation === 'portrait';
  const isLandscape = responsive.orientation === 'landscape';
  const minTouchTarget = responsive.capabilities.minTouchTarget;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isSelected && styles.containerSelected,
        isNativeMobile && isPortrait && styles.containerMobile,
        isNativeMobile && isLandscape && styles.containerMobileLandscape,
        { minHeight: isNativeMobile && isLandscape ? Math.max(minTouchTarget, 52) : Math.max(minTouchTarget, 70) }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Status Badge */}
      {isOnAir && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>ON AIR</Text>
        </View>
      )}
      
      {/* Camera Icon */}
      <View style={[
        styles.content,
        isNativeMobile && isPortrait && styles.contentMobile,
        isNativeMobile && isLandscape && styles.contentMobileLandscape
      ]}>
        <View style={[
          styles.iconContainer,
          isNativeMobile && isPortrait && styles.iconContainerMobile,
          isNativeMobile && isLandscape && styles.iconContainerMobileLandscape
        ]}>
          <IconSymbol 
            name="video.fill" 
            size={isNativeMobile && isLandscape ? 14 : isNativeMobile && isPortrait ? 12 : 24} 
            color={Colors.text} 
          />
        </View>
        
        {/* Source Name */}
        <View style={styles.nameContainer}>
          <Text style={[
            styles.nameText,
            isNativeMobile && isPortrait && styles.nameTextMobile,
            isNativeMobile && isLandscape && styles.nameTextMobileLandscape
          ]} numberOfLines={isNativeMobile && isLandscape ? 3 : 2}>{name}</Text>
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
  containerMobile: {
    padding: 2,
    minHeight: 32,
    borderRadius: 3,
    flex: 1,
    maxWidth: '47%',
    marginHorizontal: 1,
  },
  containerMobileLandscape: {
    padding: 4,
    minHeight: 52, // Increased to match minHeight calculation
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 1,
    marginVertical: 2,
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 1,
    left: 1,
    backgroundColor: Colors.danger,
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRadius: 1,
    zIndex: 1,
  },
  statusText: {
    color: Colors.text,
    fontSize: 5,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  contentMobile: {
    paddingTop: 4,
  },
  contentMobileLandscape: {
    paddingTop: 2,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#475569', // slate-600
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconContainerMobile: {
    width: 16,
    height: 16,
    marginBottom: 1,
    borderRadius: 3,
  },
  iconContainerMobileLandscape: {
    width: 20,
    height: 20,
    marginBottom: 0,
    marginRight: 6,
    borderRadius: 4,
  },
  nameContainer: {
    alignItems: 'center',
    flex: 1,
  },
  nameText: {
    fontSize: 10,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 14,
  },
  nameTextMobile: {
    fontSize: 6,
    lineHeight: 8,
    fontWeight: '600',
  },
  nameTextMobileLandscape: {
    fontSize: 7, // Reduced from 8 to fit better
    lineHeight: 9,
    fontWeight: '600',
    textAlign: 'left',
    flexWrap: 'wrap',
    numberOfLines: 2,
  },
});

export default SourceCard;