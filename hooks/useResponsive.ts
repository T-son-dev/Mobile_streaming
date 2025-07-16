import { useWindowDimensions, Platform } from 'react-native';
import { PixelRatio } from 'react-native';

export interface ResponsiveLayout {
  isTablet: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  scale: number;
  isSmallPhone: boolean;
  isMediumPhone: boolean;
  isLargePhone: boolean;
  isMobile: boolean;
  isNativeMobile: boolean;
  deviceType: string;
  spacing: ResponsiveSpacing;
  typography: ResponsiveTypography;
}

export interface ResponsiveSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ResponsiveTypography {
  tiny: number;
  caption: number;
  body: number;
  subheading: number;
  heading: number;
  title: number;
  display: number;
}

export const useResponsive = (): ResponsiveLayout => {
  const dimensions = useWindowDimensions();
  const scale = PixelRatio.get();
  
  // Platform detection
  const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';
  const isLandscape = dimensions.width > dimensions.height;
  
  // Device size categories - prioritize platform detection
  const isTablet = isNativeMobile ? dimensions.width >= 768 : dimensions.width >= 768;
  const isSmallPhone = isNativeMobile ? dimensions.width < 360 : dimensions.width < 360;
  const isMediumPhone = isNativeMobile ? (dimensions.width >= 360 && dimensions.width < 414) : (dimensions.width >= 360 && dimensions.width < 414);
  const isLargePhone = isNativeMobile ? (dimensions.width >= 414 && dimensions.width < 768) : (dimensions.width >= 414 && dimensions.width < 768);
  
  // Force mobile detection for native platforms
  const isMobile = isNativeMobile || (!isTablet && dimensions.width < 768);
  
  // Device type determination
  const getDeviceType = () => {
    if (isNativeMobile) {
      if (isTablet) {
        return isLandscape ? 'tablet-landscape' : 'tablet-portrait';
      } else {
        return isLandscape ? 'phone-landscape' : 'phone-portrait';
      }
    }
    
    // Web/desktop detection
    if (dimensions.width >= 1200) return 'desktop';
    if (dimensions.width >= 768) return isLandscape ? 'tablet-landscape' : 'tablet-portrait';
    return isLandscape ? 'phone-landscape' : 'phone-portrait';
  };
  
  const deviceType = getDeviceType();

  // Responsive spacing system - adjust for mobile platforms
  const baseSpacing = isNativeMobile ? 
    (isTablet ? 12 : isSmallPhone ? 6 : 8) : 
    (isTablet ? 12 : isSmallPhone ? 6 : 8);
  const spacing: ResponsiveSpacing = {
    xs: baseSpacing * 0.5,
    sm: baseSpacing,
    md: baseSpacing * 1.5,
    lg: baseSpacing * 2,
    xl: baseSpacing * 3,
    xxl: baseSpacing * 4,
  };

  // Responsive typography system - adjust for mobile platforms
  const baseFontSize = isNativeMobile ? 
    (isTablet ? 18 : isSmallPhone ? 14 : 16) : 
    (isTablet ? 18 : isSmallPhone ? 14 : 16);
  const fontScale = PixelRatio.getFontScale();
  
  const typography: ResponsiveTypography = {
    tiny: (baseFontSize * 0.75) / fontScale,
    caption: (baseFontSize * 0.875) / fontScale,
    body: baseFontSize / fontScale,
    subheading: (baseFontSize * 1.125) / fontScale,
    heading: (baseFontSize * 1.25) / fontScale,
    title: (baseFontSize * 1.5) / fontScale,
    display: (baseFontSize * 2) / fontScale,
  };

  return {
    isTablet,
    isLandscape,
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    scale,
    isSmallPhone,
    isMediumPhone,
    isLargePhone,
    isMobile,
    isNativeMobile,
    deviceType,
    spacing,
    typography,
  };
};

// Utility functions for responsive values
export const useResponsiveValue = <T>(
  smallPhone: T,
  mediumPhone: T,
  largePhone: T,
  tablet: T
): T => {
  const { isTablet, isSmallPhone, isMediumPhone, isNativeMobile } = useResponsive();
  
  // Force mobile values for native platforms
  if (isNativeMobile) {
    if (isTablet) return tablet;
    if (isSmallPhone) return smallPhone;
    if (isMediumPhone) return mediumPhone;
    return largePhone;
  }
  
  if (isTablet) return tablet;
  if (isSmallPhone) return smallPhone;
  if (isMediumPhone) return mediumPhone;
  return largePhone;
};

export const useResponsiveDimensions = (
  baseWidth: number,
  baseHeight: number
) => {
  const { screenWidth, isTablet, isSmallPhone, isNativeMobile } = useResponsive();
  
  // Adjust scaling for native mobile platforms
  const scale = isNativeMobile ? 
    (isTablet ? 1.2 : isSmallPhone ? 0.9 : 1) : 
    (isTablet ? 1.3 : isSmallPhone ? 0.8 : 1);
  const widthScale = screenWidth / 375; // Base iPhone screen width
  
  return {
    width: Math.round(baseWidth * scale * widthScale),
    height: Math.round(baseHeight * scale * widthScale),
  };
};

// Safe area utilities
export const useResponsiveInsets = () => {
  const { screenHeight, isLandscape, isNativeMobile } = useResponsive();
  
  // Enhanced safe area handling for native mobile
  if (isNativeMobile) {
    return {
      top: isLandscape ? 0 : screenHeight > 800 ? 44 : 20, // For notched devices
      bottom: isLandscape ? 0 : screenHeight > 800 ? 34 : 0, // For home indicator
      left: isLandscape ? 44 : 0,
      right: isLandscape ? 44 : 0,
    };
  }
  
  // Web/desktop safe areas
  return {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
};