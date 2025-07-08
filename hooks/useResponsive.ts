import { useWindowDimensions } from 'react-native';
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
  
  // Device size categories
  const isTablet = dimensions.width >= 768;
  const isLandscape = dimensions.width > dimensions.height;
  const isSmallPhone = dimensions.width < 360;
  const isMediumPhone = dimensions.width >= 360 && dimensions.width < 414;
  const isLargePhone = dimensions.width >= 414 && dimensions.width < 768;

  // Responsive spacing system
  const baseSpacing = isTablet ? 12 : isSmallPhone ? 6 : 8;
  const spacing: ResponsiveSpacing = {
    xs: baseSpacing * 0.5,
    sm: baseSpacing,
    md: baseSpacing * 1.5,
    lg: baseSpacing * 2,
    xl: baseSpacing * 3,
    xxl: baseSpacing * 4,
  };

  // Responsive typography system
  const baseFontSize = isTablet ? 18 : isSmallPhone ? 14 : 16;
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
  const { isTablet, isSmallPhone, isMediumPhone } = useResponsive();
  
  if (isTablet) return tablet;
  if (isSmallPhone) return smallPhone;
  if (isMediumPhone) return mediumPhone;
  return largePhone;
};

export const useResponsiveDimensions = (
  baseWidth: number,
  baseHeight: number
) => {
  const { screenWidth, isTablet, isSmallPhone } = useResponsive();
  
  const scale = isTablet ? 1.3 : isSmallPhone ? 0.8 : 1;
  const widthScale = screenWidth / 375; // Base iPhone screen width
  
  return {
    width: Math.round(baseWidth * scale * widthScale),
    height: Math.round(baseHeight * scale * widthScale),
  };
};

// Safe area utilities
export const useResponsiveInsets = () => {
  const { screenHeight, isLandscape } = useResponsive();
  
  return {
    top: isLandscape ? 0 : screenHeight > 800 ? 44 : 20, // For notched devices
    bottom: isLandscape ? 0 : screenHeight > 800 ? 34 : 0, // For home indicator
    left: isLandscape ? 44 : 0,
    right: isLandscape ? 44 : 0,
  };
};