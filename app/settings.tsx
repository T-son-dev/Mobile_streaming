import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  SettingCard,
  SettingsModal,
  CustomSlider,
  ToggleSetting,
  OptionSelector,
} from '@/components/ui/SettingsComponents';
import { AppSettings, defaultSettings } from '@/types/settings';
import { Colors } from '@/constants/Colors';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const updateSettings = <K extends keyof AppSettings>(
    category: K,
    updates: Partial<AppSettings[K]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...updates,
      },
    }));
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all settings to their default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings(defaultSettings);
            Alert.alert('Success', 'Settings have been reset to defaults');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        <View style={styles.quickToggles}>
          <ToggleSetting
            label="Hardware Acceleration"
            description="Enable GPU acceleration for better performance"
            value={settings.video.hardwareAcceleration}
            onValueChange={(value) =>
              updateSettings('video', { hardwareAcceleration: value })
            }
          />
          <ToggleSetting
            label="Auto-Reconnect"
            description="Automatically reconnect when connection drops"
            value={settings.advanced.autoReconnect}
            onValueChange={(value) =>
              updateSettings('advanced', { autoReconnect: value })
            }
          />
          <ToggleSetting
            label="Low Latency Mode"
            description="Reduce stream delay for real-time interaction"
            value={settings.advanced.lowLatencyMode}
            onValueChange={(value) =>
              updateSettings('advanced', { lowLatencyMode: value })
            }
          />
        </View>

        <View style={styles.settingsSection}>
          <SettingCard
            title="Video Settings"
            description="Quality, frame rate, bitrate configuration"
            iconName="video.fill"
            onPress={() => setActiveModal('video')}
          />
          <SettingCard
            title="Audio Settings"
            description="Audio quality, microphone, noise reduction"
            iconName="mic.fill"
            onPress={() => setActiveModal('audio')}
          />
          <SettingCard
            title="Advanced Settings"
            description="Network, buffer, stream configuration"
            iconName="bolt.fill"
            onPress={() => setActiveModal('advanced')}
          />
          <SettingCard
            title="Account & Privacy"
            description="Notifications, analytics, privacy settings"
            iconName="lock.fill"
            onPress={() => setActiveModal('privacy')}
          />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
          <Text style={styles.resetButtonText}>Reset to Defaults</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Video Settings Modal */}
      <SettingsModal
        visible={activeModal === 'video'}
        onClose={() => setActiveModal(null)}
        title="Video Settings"
      >
        <OptionSelector
          label="Stream Quality"
          options={[
            { value: 'auto', label: 'Auto' },
            { value: '360p', label: '360p' },
            { value: '480p', label: '480p' },
            { value: '720p', label: '720p' },
            { value: '1080p', label: '1080p' },
            { value: '4K', label: '4K' },
          ]}
          selectedValue={settings.video.quality}
          onValueChange={(value) =>
            updateSettings('video', { quality: value as any })
          }
        />
        <OptionSelector
          label="Frame Rate"
          options={[
            { value: '30', label: '30 FPS' },
            { value: '60', label: '60 FPS' },
          ]}
          selectedValue={String(settings.video.frameRate)}
          onValueChange={(value) =>
            updateSettings('video', { frameRate: Number(value) as 30 | 60 })
          }
        />
        <CustomSlider
          label="Bitrate"
          value={settings.video.bitrate}
          minimumValue={500}
          maximumValue={8000}
          step={100}
          unit=" kbps"
          onValueChange={(value) => updateSettings('video', { bitrate: value })}
        />
        <ToggleSetting
          label="Hardware Acceleration"
          description="Use GPU for video encoding (recommended)"
          value={settings.video.hardwareAcceleration}
          onValueChange={(value) =>
            updateSettings('video', { hardwareAcceleration: value })
          }
        />
      </SettingsModal>

      {/* Audio Settings Modal */}
      <SettingsModal
        visible={activeModal === 'audio'}
        onClose={() => setActiveModal(null)}
        title="Audio Settings"
      >
        <OptionSelector
          label="Audio Quality"
          options={[
            { value: 'low', label: 'Low (64 kbps)' },
            { value: 'medium', label: 'Medium (128 kbps)' },
            { value: 'high', label: 'High (192 kbps)' },
            { value: 'ultra', label: 'Ultra (320 kbps)' },
          ]}
          selectedValue={settings.audio.quality}
          onValueChange={(value) =>
            updateSettings('audio', { quality: value as any })
          }
        />
        <CustomSlider
          label="Microphone Gain"
          value={settings.audio.microphoneGain}
          minimumValue={0}
          maximumValue={100}
          step={5}
          unit="%"
          onValueChange={(value) =>
            updateSettings('audio', { microphoneGain: value })
          }
        />
        <ToggleSetting
          label="Noise Reduction"
          description="Remove background noise from audio"
          value={settings.audio.noiseReduction}
          onValueChange={(value) =>
            updateSettings('audio', { noiseReduction: value })
          }
        />
        <ToggleSetting
          label="Echo Cancellation"
          description="Prevent audio feedback and echo"
          value={settings.audio.echoCancellation}
          onValueChange={(value) =>
            updateSettings('audio', { echoCancellation: value })
          }
        />
      </SettingsModal>

      {/* Advanced Settings Modal */}
      <SettingsModal
        visible={activeModal === 'advanced'}
        onClose={() => setActiveModal(null)}
        title="Advanced Settings"
      >
        <ToggleSetting
          label="Auto-Reconnect"
          description="Automatically reconnect when connection drops"
          value={settings.advanced.autoReconnect}
          onValueChange={(value) =>
            updateSettings('advanced', { autoReconnect: value })
          }
        />
        <CustomSlider
          label="Buffer Size"
          value={settings.advanced.bufferSize}
          minimumValue={0.5}
          maximumValue={10}
          step={0.5}
          unit=" seconds"
          onValueChange={(value) =>
            updateSettings('advanced', { bufferSize: value })
          }
        />
        <ToggleSetting
          label="Low Latency Mode"
          description="Reduce stream delay for real-time interaction"
          value={settings.advanced.lowLatencyMode}
          onValueChange={(value) =>
            updateSettings('advanced', { lowLatencyMode: value })
          }
        />
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Low Latency Mode</Text>
          <Text style={styles.infoText}>
            Enabling this mode reduces stream delay but may impact stability on slower connections.
          </Text>
        </View>
      </SettingsModal>

      {/* Privacy Settings Modal */}
      <SettingsModal
        visible={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Account & Privacy"
      >
        <ToggleSetting
          label="Push Notifications"
          description="Receive alerts for stream events"
          value={settings.privacy.notifications}
          onValueChange={(value) =>
            updateSettings('privacy', { notifications: value })
          }
        />
        <ToggleSetting
          label="Analytics"
          description="Share anonymous usage data to improve the app"
          value={settings.privacy.analytics}
          onValueChange={(value) =>
            updateSettings('privacy', { analytics: value })
          }
        />
        <ToggleSetting
          label="Show Viewer List"
          description="Display list of viewers in your stream"
          value={settings.privacy.showViewerList}
          onValueChange={(value) =>
            updateSettings('privacy', { showViewerList: value })
          }
        />
        <ToggleSetting
          label="Moderator Mode"
          description="Enable moderation tools for your stream"
          value={settings.privacy.moderatorMode}
          onValueChange={(value) =>
            updateSettings('privacy', { moderatorMode: value })
          }
        />
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Privacy Policy →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkButton}>
          <Text style={styles.linkButtonText}>Terms of Service →</Text>
        </TouchableOpacity>
      </SettingsModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  quickToggles: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  settingsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  infoTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: Colors.dark.tabIconDefault,
    fontSize: 14,
    lineHeight: 20,
  },
  linkButton: {
    paddingVertical: 12,
    marginTop: 8,
  },
  linkButtonText: {
    color: Colors.dark.tint,
    fontSize: 16,
  },
});

export default SettingsScreen;