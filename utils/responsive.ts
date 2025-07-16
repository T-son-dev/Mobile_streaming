import React from 'react';
import { Dimensions, Platform, PixelRatio } from 'react-native';

// Get current screen dimensions
export const getScreenDimensions = () => {
  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');
  return { screen, window };
};

// Responsive breakpoints - optimized for mobile emulators
export const breakpoints = {
  xs: 320,   // Extra small devices (small phones)
  sm: 480,   // Small devices (phones in landscape)
  md: 768,   // Medium devices (tablets, large phones)
  lg: 1024,  // Large devices (tablets landscape, small desktops)
  xl: 1200,  // Extra large devices (desktops)
  xxl: 1440  // Extra extra large devices
};

// Device type detection
export const getDeviceType = () => {
  const { width, height } = Dimensions.get('window');
  const screenSize = Math.min(width, height);
  
  // Force mobile layout for Android and iOS platforms regardless of screen size
  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // For mobile platforms, determine phone vs tablet based on screen size
    if (screenSize < breakpoints.md) {
      return width > height ? 'phone-landscape' : 'phone-portrait';
    } else {
      return width > height ? 'tablet-landscape' : 'tablet-portrait';
    }
  }
  
  // For web/desktop, use screen size detection
  if (screenSize < breakpoints.xs) return 'phone-portrait';
  if (width < breakpoints.sm) return width > height ? 'phone-landscape' : 'phone-portrait';
  if (width < breakpoints.md) return width > height ? 'phone-landscape' : 'phone-portrait';
  if (width < breakpoints.lg) return width > height ? 'tablet-landscape' : 'tablet-portrait';
  if (width < breakpoints.xl) return width > height ? 'tablet-landscape' : 'tablet-portrait';
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
  const isMobile = deviceType.includes('phone') || Platform.OS === 'android' || Platform.OS === 'ios';
  const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';
  
  const dimensions = {
    screenWidth: width,
    screenHeight: height,
    deviceType,
    orientation,
    isMobile,
    isNativeMobile,
    
    // Header dimensions - more compact for mobile landscape
    headerHeight: isNativeMobile && orientation === 'landscape' ? getSpacing(36) : 
                  isMobile ? getSpacing(48) : 
                  orientation === 'landscape' ? getSpacing(40) : getSpacing(60),
    
    // Control panel dimensions - optimized for mobile landscape (20% reduction)
    controlPanelHeight: isMobile ? getSpacing(120) : orientation === 'landscape' ? getSpacing(80) : getSpacing(100),
    controlPanelWidth: isNativeMobile && orientation === 'landscape' ? getSpacing(120) : // Reduced by 20% from 150 to 120
                       (deviceType.includes('tablet') || deviceType === 'desktop') && !isNativeMobile
                       ? getSpacing(300) : getSpacing(144), // Reduced by 20% from 180 to 144
    
    // Button sizes - more compact for mobile landscape
    buttonSize: {
      small: isNativeMobile && orientation === 'landscape' ? getSpacing(28) : 
             isMobile ? getSpacing(36) : getSpacing(32),
      medium: isNativeMobile && orientation === 'landscape' ? getSpacing(36) : 
              isMobile ? getSpacing(48) : getSpacing(44),
      large: isNativeMobile && orientation === 'landscape' ? getSpacing(44) : 
             isMobile ? getSpacing(60) : getSpacing(56),
      xlarge: isNativeMobile && orientation === 'landscape' ? getSpacing(56) : 
              isMobile ? getSpacing(80) : getSpacing(72)
    },
    
    // Icon sizes
    iconSize: {
      small: getFontSize(16),
      medium: getFontSize(20),
      large: getFontSize(24),
      xlarge: getFontSize(32)
    },
    
    // Safe areas - more compact for mobile landscape
    safeAreaHorizontal: isNativeMobile && orientation === 'landscape' ? getSpacing(8) : 
                        isMobile ? getSpacing(12) : getSpacing(16),
    safeAreaVertical: isNativeMobile && orientation === 'landscape' ? getSpacing(4) : 
                      isMobile ? getSpacing(8) : getSpacing(12),
    
    // Grid layout - force mobile layout for native platforms
    columnCount: isNativeMobile ? 2 : 
                 deviceType === 'desktop' ? 6 : 
                 deviceType.includes('tablet') ? 4 : 2,
    gridGap: isNativeMobile && orientation === 'landscape' ? getSpacing(4) : 
             isMobile ? getSpacing(6) : getSpacing(8)
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
  const isMobile = deviceType.includes('phone') || Platform.OS === 'android' || Platform.OS === 'ios';
  const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';
  
  return {
    // Supports split screen layouts - never on native mobile
    supportsSplitScreen: !isNativeMobile && (deviceType.includes('tablet') || deviceType === 'desktop'),
    
    // Supports multi-column layouts - limited on native mobile
    supportsMultiColumn: !isNativeMobile && width >= breakpoints.md,
    
    // Supports hover states - never on native mobile
    supportsHover: !isNativeMobile && (Platform.OS === 'web' || deviceType === 'desktop'),
    
    // Optimal for touch interactions - always true on native mobile
    touchOptimized: isNativeMobile || Platform.OS !== 'web',
    
    // High density screen
    isHighDensity: PixelRatio.get() >= 2,
    
    // Minimum touch target size - larger for mobile
    minTouchTarget: isMobile ? 48 : Platform.OS === 'ios' ? 44 : 48,
    
    // Native mobile platform detection
    isNativeMobile,
    isMobile,
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