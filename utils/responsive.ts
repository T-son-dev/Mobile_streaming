import React from 'react';
import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get current screen dimensions
export const getScreenDimensions = () => {
  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');
  return { screen, window };
};

// Responsive breakpoints
export const breakpoints = {
  xs: 480,   // Extra small devices (phones in portrait)
  sm: 768,   // Small devices (phones in landscape, small tablets)
  md: 1024,  // Medium devices (tablets)
  lg: 1200,  // Large devices (desktops)
  xl: 1440   // Extra large devices
};

// Device type detection
export const getDeviceType = () => {
  const { width } = Dimensions.get('window');
  if (width < breakpoints.xs) return 'phone-portrait';
  if (width < breakpoints.sm) return 'phone-landscape';
  if (width < breakpoints.md) return 'tablet-portrait';
  if (width < breakpoints.lg) return 'tablet-landscape';
  return 'desktop';
};

// Orientation detection
export const getOrientation = () => {
  const { width, height } = Dimensions.get('window');
  return width > height ? 'landscape' : 'portrait';
};

// Scale functions for responsive design
export const scale = (size: number): number => {
  const { width } = Dimensions.get('window');
  const baseWidth = 375; // iPhone X width as base
  return (width / baseWidth) * size;
};

export const verticalScale = (size: number): number => {
  const { height } = Dimensions.get('window');
  const baseHeight = 812; // iPhone X height as base
  return (height / baseHeight) * size;
};

export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

// Responsive font sizes
export const getFontSize = (baseSize: number): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'phone-portrait':
      return moderateScale(baseSize, 0.3);
    case 'phone-landscape':
      return moderateScale(baseSize, 0.4);
    case 'tablet-portrait':
      return moderateScale(baseSize, 0.6);
    case 'tablet-landscape':
      return moderateScale(baseSize, 0.7);
    case 'desktop':
      return moderateScale(baseSize, 0.8);
    default:
      return baseSize;
  }
};

// Responsive spacing
export const getSpacing = (baseSpacing: number): number => {
  const deviceType = getDeviceType();
  
  switch (deviceType) {
    case 'phone-portrait':
      return moderateScale(baseSpacing, 0.2);
    case 'phone-landscape':
      return moderateScale(baseSpacing, 0.3);
    case 'tablet-portrait':
      return moderateScale(baseSpacing, 0.5);
    case 'tablet-landscape':
      return moderateScale(baseSpacing, 0.6);
    case 'desktop':
      return moderateScale(baseSpacing, 0.7);
    default:
      return baseSpacing;
  }
};

// Layout dimensions based on device type
export const getLayoutDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const deviceType = getDeviceType();
  const orientation = getOrientation();
  
  const dimensions = {
    screenWidth: width,
    screenHeight: height,
    deviceType,
    orientation,
    
    // Header dimensions
    headerHeight: orientation === 'landscape' ? getSpacing(40) : getSpacing(60),
    
    // Control panel dimensions
    controlPanelHeight: orientation === 'landscape' ? getSpacing(80) : getSpacing(100),
    controlPanelWidth: deviceType.includes('tablet') || deviceType === 'desktop' 
      ? getSpacing(300) : getSpacing(250),
    
    // Button sizes
    buttonSize: {
      small: getSpacing(32),
      medium: getSpacing(44),
      large: getSpacing(56),
      xlarge: getSpacing(72)
    },
    
    // Icon sizes
    iconSize: {
      small: getFontSize(16),
      medium: getFontSize(20),
      large: getFontSize(24),
      xlarge: getFontSize(32)
    },
    
    // Safe areas
    safeAreaHorizontal: getSpacing(16),
    safeAreaVertical: getSpacing(12),
    
    // Grid layout
    columnCount: deviceType === 'desktop' ? 6 : 
                 deviceType.includes('tablet') ? 4 : 2,
    gridGap: getSpacing(8)
  };
  
  return dimensions;
};

// Responsive layout utilities
export const getFlexDirection = (stackOnSmall: boolean = true) => {
  const deviceType = getDeviceType();
  const orientation = getOrientation();
  
  if (stackOnSmall && (deviceType === 'phone-portrait' || orientation === 'portrait')) {
    return 'column';
  }
  return 'row';
};

// Component-specific responsive styles
export const getResponsiveStyles = () => {
  const dimensions = getLayoutDimensions();
  const { deviceType, orientation } = dimensions;
  
  return {
    // Camera view styles
    cameraView: {
      aspectRatio: orientation === 'landscape' ? 16/9 : 9/16,
      borderRadius: getSpacing(12),
    },
    
    // Overlay controls
    overlay: {
      padding: dimensions.safeAreaHorizontal,
      gap: dimensions.gridGap,
    },
    
    // Button container
    buttonContainer: {
      flexDirection: getFlexDirection(false) as 'row' | 'column',
      gap: dimensions.gridGap,
      padding: dimensions.safeAreaHorizontal,
    },
    
    // Modal sizes
    modal: {
      width: deviceType === 'desktop' ? '40%' : 
             deviceType.includes('tablet') ? '60%' : '90%',
      maxWidth: 500,
      maxHeight: '80%',
    },
    
    // Text sizes
    text: {
      title: getFontSize(24),
      subtitle: getFontSize(18),
      body: getFontSize(16),
      caption: getFontSize(14),
      small: getFontSize(12),
    }
  };
};

// Check if device supports certain features
export const getDeviceCapabilities = () => {
  const { width } = Dimensions.get('window');
  const deviceType = getDeviceType();
  
  return {
    // Supports split screen layouts
    supportsSplitScreen: deviceType.includes('tablet') || deviceType === 'desktop',
    
    // Supports multi-column layouts
    supportsMultiColumn: width >= breakpoints.md,
    
    // Supports hover states
    supportsHover: Platform.OS === 'web' || deviceType === 'desktop',
    
    // Optimal for touch interactions
    touchOptimized: Platform.OS !== 'web',
    
    // High density screen
    isHighDensity: PixelRatio.get() >= 2,
    
    // Minimum touch target size
    minTouchTarget: Platform.OS === 'ios' ? 44 : 48,
  };
};

// Animation timing based on device performance
export const getAnimationTiming = () => {
  const capabilities = getDeviceCapabilities();
  
  return {
    fast: capabilities.isHighDensity ? 150 : 200,
    normal: capabilities.isHighDensity ? 250 : 300,
    slow: capabilities.isHighDensity ? 350 : 400,
  };
};

// Export a hook for real-time responsive updates
export const useResponsive = () => {
  const [dimensions, setDimensions] = React.useState(getLayoutDimensions());
  
  React.useEffect(() => {
    const subscription = Dimensions.addEventListener('change', () => {
      setDimensions(getLayoutDimensions());
    });
    
    return () => subscription?.remove();
  }, []);
  
  return {
    ...dimensions,
    styles: getResponsiveStyles(),
    capabilities: getDeviceCapabilities(),
    timing: getAnimationTiming(),
  };
};

// Re-export commonly used functions
export {
  Dimensions,
  Platform,
  PixelRatio
};