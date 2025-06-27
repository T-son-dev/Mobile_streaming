import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { PlatformIcon, PlatformType } from './PlatformIcon';

// Color system
export const Colors = {
  primary: '#00ff88',
  background: '#0f0f23',
  surface: '#1a1a2e',
  text: '#ffffff',
  textSecondary: '#888888',
  danger: '#ff4444',
  success: '#00ff88',
  warning: '#FFA500',
};

// Platform Button Component
interface PlatformButtonProps {
  platform: {
    id: PlatformType;
    name: string;
    color: string;
    description: string;
    badge: string;
  };
  onPress: (id: string) => void;
  style?: ViewStyle;
}

export const PlatformButton: React.FC<PlatformButtonProps> = ({
  platform,
  onPress,
  style,
}) => (
  <TouchableOpacity
    style={[
      styles.platformButton,
      {borderColor: platform.color},
      style,
    ]}
    onPress={() => onPress(platform.id)}>
    <View style={styles.platformBadge}>
      <Text style={styles.badgeText}>{platform.badge}</Text>
    </View>
    <PlatformIcon platform={platform.id} size={32} />
    <Text style={styles.platformName}>{platform.name}</Text>
    <Text style={styles.platformDescription}>{platform.description}</Text>
  </TouchableOpacity>
);

// Action Button Component
interface ActionButtonProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  description,
  onPress,
  style,
}) => (
  <TouchableOpacity style={[styles.actionButton, style]} onPress={onPress}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <View style={styles.actionContent}>
      <Text style={styles.actionTitle}>{title}</Text>
      <Text style={styles.actionDescription}>{description}</Text>
    </View>
    <Text style={styles.actionArrow}>→</Text>
  </TouchableOpacity>
);

// Primary Button Component
interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'danger' | 'secondary';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'danger':
        return {backgroundColor: Colors.danger};
      case 'secondary':
        return {backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary};
      default:
        return {backgroundColor: Colors.primary};
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return {color: Colors.primary};
      default:
        return {color: Colors.background};
    }
  };

  return (
    <TouchableOpacity
      style={[styles.primaryButton, getButtonStyle(), style]}
      onPress={onPress}>
      <Text style={[styles.primaryButtonText, getTextStyle(), textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Stat Display Component
interface StatDisplayProps {
  icon: string;
  value: string;
  label: string;
  style?: ViewStyle;
}

export const StatDisplay: React.FC<StatDisplayProps> = ({
  icon,
  value,
  label,
  style,
}) => (
  <View style={[styles.statCard, style]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Stream Status Indicator Component
interface StreamStatusProps {
  isLive: boolean;
  viewerCount?: number;
  duration?: string;
  style?: ViewStyle;
}

export const StreamStatus: React.FC<StreamStatusProps> = ({
  isLive,
  viewerCount,
  duration,
  style,
}) => (
  <View style={[styles.streamStatus, style]}>
    {isLive && (
      <>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>LIVE</Text>
          {viewerCount !== undefined && (
            <Text style={styles.viewerCount}>👥 {viewerCount}</Text>
          )}
        </View>
        {duration && (
          <Text style={styles.streamDuration}>{duration}</Text>
        )}
      </>
    )}
  </View>
);

// Settings Toggle Component
interface SettingsToggleProps {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  style?: ViewStyle;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({
  label,
  value,
  onToggle,
  style,
}) => (
  <View style={[styles.settingToggle, style]}>
    <Text style={styles.settingToggleLabel}>{label}</Text>
    <TouchableOpacity
      style={[styles.toggleSwitch, value && styles.toggleSwitchOn]}
      onPress={() => onToggle(!value)}>
      <View style={[styles.toggleButton, value && styles.toggleButtonOn]} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  // Platform Button Styles
  platformButton: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
    minHeight: 120,
  },
  platformBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.background,
  },
  platformName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  platformDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Action Button Styles
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  actionArrow: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Primary Button Styles
  primaryButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Stat Display Styles
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderTopWidth: 3,
    borderTopColor: Colors.primary,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },

  // Stream Status Styles
  streamStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  viewerCount: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
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

  // Settings Toggle Styles
  settingToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingToggleLabel: {
    color: Colors.text,
    fontSize: 16,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: {
    backgroundColor: Colors.primary,
  },
  toggleButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.text,
    transform: [{translateX: 0}],
  },
  toggleButtonOn: {
    transform: [{translateX: 22}],
  },
});