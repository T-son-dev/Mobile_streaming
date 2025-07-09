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
  isExtraLargePhone: boolean;
  spacing: ResponsiveSpacing;
  typography: ResponsiveTypography;
  layout: ResponsiveLayoutSizes;
}