streamButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dual Camera Styles
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  streamStatusOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.text,
    borderRadius: 4,
  },
  liveText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  streamDuration: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  errorText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  errorDismiss: {
    backgroundColor: Colors.text,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorDismissText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  initializingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 150,
  },
  initializingText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  additionalStats: {
    marginTop: 8,
    gap: 4,
  },
const Colors = {
  background: '#0f172a',
  surface: '#1e293b',
  border: '#334155',
  primary: '#22c55e',
  primaryHover: '#16a34a',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  danger: '#ef4444',
  warning: '#f59e0b',
};

interface StreamingInterfaceProps {
  // Props can be added here if needed
}

interface CameraSettings {
  resolution: '480p' | '720p' | '1080p' | '4K';
  fps: 24 | 30 | 60;
  zoom: number;
  focus: 'auto' | 'manual';
  flashMode: 'off' | 'on' | 'auto' | 'torch';
  layout: CameraLayout;
  primaryCamera: 'front' | 'back';
  secondaryCamera: 'front' | 'back';
}

const createResponsiveStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: responsive.layout.containerPadding,
    paddingTop: responsive.spacing.md,
    paddingBottom: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: responsive.layout.headerHeight,
  },
  headerContent: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  headerRight: {
    flex: responsive.isTablet ? 2 : 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: responsive.isSmallPhone ? 4 : 8,
  },
  shortcutButton: {
    alignItems: 'center',
    padding: responsive.spacing.xs,
    minWidth: responsive.isTablet ? 80 : responsive.isSmallPhone ? 50 : 60,
  },
  shortcutIconContainer: {
    width: responsive.layout.iconSize.large,
    height: responsive.layout.iconSize.large,
    borderRadius: responsive.layout.iconSize.large / 2,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: responsive.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  shortcutLabel: {
    fontSize: responsive.typography.tiny,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuButton: {
    padding: responsive.spacing.xs,
  },
  menuButtonCircle: {
    width: responsive.layout.iconSize.large,
    height: responsive.layout.iconSize.large,
    borderRadius: responsive.layout.iconSize.large / 2,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuButtonActive: {
    backgroundColor: Colors.primaryHover,
  },
  mainContent: {
    flex: 1,
    flexDirection: responsive.isLandscape && !responsive.isTablet ? 'row' : 'column',
  },
  sourceSidebar: {
    width: responsive.isLandscape && !responsive.isTablet ? 
      responsive.screenWidth * 0.25 : 
      responsive.isTablet ? 220 : '100%',
    padding: responsive.layout.containerPadding,
    borderRightWidth: responsive.isLandscape && !responsive.isTablet ? 1 : 0,
    borderBottomWidth: responsive.isLandscape && !responsive.isTablet ? 0 : 1,
    borderColor: Colors.border,
    maxHeight: responsive.isLandscape && !responsive.isTablet ? '100%' : 200,
  },
  sourceList: {
    gap: responsive.spacing.sm,
    flexDirection: responsive.isLandscape && !responsive.isTablet ? 'column' : 'row',
    flexWrap: 'wrap',
  },
  videoPreviewContainer: {
    flex: 1,
    padding: responsive.layout.containerPadding,
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: responsive.layout.containerPadding,
    paddingVertical: responsive.spacing.md,
    flexDirection: responsive.isTablet ? 'row' : 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minHeight: responsive.layout.bottomSectionHeight,
  },
  monitoringContainer: {
    position: responsive.isTablet ? 'absolute' : 'relative',
    left: responsive.isTablet ? 20 : 0,
    bottom: responsive.isTablet ? 20 : 0,
    marginBottom: responsive.isTablet ? 0 : responsive.spacing.md,
  },
  streamButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  additionalStats: {
    marginTop: responsive.spacing.xs,
    gap: responsive.spacing.xs / 2,
  },
  statText: {
    fontSize: responsive.typography.tiny,
    color: Colors.text,
    fontWeight: '500',
  },
  initializingText: {
    color: Colors.primary,
    fontSize: responsive.typography.body,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: responsive.spacing.xs,
  },
  // Camera specific styles
  cameraContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: responsive.isTablet ? 400 : 250,
  },
  streamStatusOverlay: {
    position: 'absolute',
    top: responsive.spacing.md,
    left: responsive.spacing.md,
    right: responsive.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    paddingHorizontal: responsive.spacing.sm,
    paddingVertical: responsive.spacing.xs,
    borderRadius: 20,
    gap: responsive.spacing.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.text,
    borderRadius: 4,
  },
  liveText: {
    color: Colors.text,
    fontSize: responsive.typography.caption,
    fontWeight: 'bold',
  },
  streamDuration: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: Colors.text,
    paddingHorizontal: responsive.spacing.sm,
    paddingVertical: responsive.spacing.xs,
    borderRadius: 15,
    fontSize: responsive.typography.caption,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
  },
  errorText: {
    color: Colors.text,
    fontSize: responsive.typography.body,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: responsive.spacing.md,
    paddingHorizontal: responsive.spacing.lg,
  },
  errorDismiss: {
    backgroundColor: Colors.text,
    paddingHorizontal: responsive.spacing.lg,
    paddingVertical: responsive.spacing.sm,
    borderRadius: 8,
  },
  errorDismissText: {
    color: Colors.danger,
    fontSize: responsive.typography.caption,
    fontWeight: '600',
  },
  initializingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 150,
  },
});

export default StreamingInterface;import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import {
  UserIcon,
  ReplayIcon,
  FxIcon,
  AudioIcon,
  VideoIcon,
} from '@/components/icons';
import SourceCard from './SourceCard';
import VideoPreview from './VideoPreview';
import StreamButton from './StreamButton';
import QuickAccessMenu from './QuickAccessMenu';
import ProModeMenu from './ProModeMenu';
import ShortcutButton from './ShortcutButton';
import MonitoringIndicator from './MonitoringIndicator';
import DualCameraManager, { DualCameraConfig, CameraLayout } from './DualCameraManager';
import EnhancedCameraControls from './EnhancedCameraControls';
import rtmpStreamingService, { RTMPConfig } from '../services/RTMPStreamingService';