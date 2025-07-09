import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { CameraLayout } from './DualCameraManager';

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

interface EnhancedCameraControlsProps {
  visible: boolean;
  onClose: () => void;
  settings: CameraSettings;
  onSettingsChange: (settings: CameraSettings) => void;
  isStreaming: boolean;
}

const Colors = {
  background: '#1a1a2e',
  surface: '#2a2a3e',
  primary: '#00ff88',
  text: '#ffffff',
  textSecondary: '#888888',
  border: '#404040',
  danger: '#ff4444',
};

const EnhancedCameraControls: React.FC<EnhancedCameraControlsProps> = ({
  visible,
  onClose,
  settings,
  onSettingsChange,
  isStreaming,
}) => {
  const [localSettings, setLocalSettings] = useState<CameraSettings>(settings);

  const updateSetting = <K extends keyof CameraSettings>(
    key: K,
    value: CameraSettings[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleZoomChange = (direction: 'in' | 'out') => {
    const step = 0.1;
    const newZoom = direction === 'in' 
      ? Math.min(localSettings.zoom + step, 5.0)
      : Math.max(localSettings.zoom - step, 0.5);
    updateSetting('zoom', Number(newZoom.toFixed(1)));
  };

  const resolutionOptions: CameraSettings['resolution'][] = ['480p', '720p', '1080p', '4K'];
  const fpsOptions: CameraSettings['fps'][] = [24, 30, 60];
  const layoutOptions: { value: CameraLayout; label: string }[] = [
    { value: 'single', label: 'Single' },
    { value: 'pip', label: 'Picture-in-Picture' },
    { value: 'split', label: 'Split Screen' },
    { value: 'overlay', label: 'Overlay' },
  ];

  const showStreamingWarning = (action: string) => {
    if (isStreaming) {
      Alert.alert(
        'Stream Active',
        `Changing ${action} during streaming may cause interruption. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', style: 'destructive' },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Camera Controls</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Camera Layout Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Camera Layout</Text>
            <View style={styles.layoutGrid}>
              {layoutOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.layoutButton,
                    localSettings.layout === option.value && styles.layoutButtonActive
                  ]}
                  onPress={() => {
                    showStreamingWarning('camera layout');
                    updateSetting('layout', option.value);
                  }}
                >
                  <Text style={[
                    styles.layoutButtonText,
                    localSettings.layout === option.value && styles.layoutButtonTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Camera Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Camera Selection</Text>
            <View style={styles.cameraRow}>
              <View style={styles.cameraSelector}>
                <Text style={styles.cameraLabel}>Primary</Text>
                <View style={styles.cameraToggle}>
                  <TouchableOpacity
                    style={[
                      styles.cameraOption,
                      localSettings.primaryCamera === 'back' && styles.cameraOptionActive
                    ]}
                    onPress={() => updateSetting('primaryCamera', 'back')}
                  >
                    <IconSymbol name="camera.fill" size={20} color={Colors.text} />
                    <Text style={styles.cameraOptionText}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.cameraOption,
                      localSettings.primaryCamera === 'front' && styles.cameraOptionActive
                    ]}
                    onPress={() => updateSetting('primaryCamera', 'front')}
                  >
                    <IconSymbol name="camera.fill" size={20} color={Colors.text} />
                    <Text style={styles.cameraOptionText}>Front</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {localSettings.layout !== 'single' && (
                <View style={styles.cameraSelector}>
                  <Text style={styles.cameraLabel}>Secondary</Text>
                  <View style={styles.cameraToggle}>
                    <TouchableOpacity
                      style={[
                        styles.cameraOption,
                        localSettings.secondaryCamera === 'back' && styles.cameraOptionActive
                      ]}
                      onPress={() => updateSetting('secondaryCamera', 'back')}
                    >
                      <IconSymbol name="camera.fill" size={20} color={Colors.text} />
                      <Text style={styles.cameraOptionText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.cameraOption,
                        localSettings.secondaryCamera === 'front' && styles.cameraOptionActive
                      ]}
                      onPress={() => updateSetting('secondaryCamera', 'front')}
                    >
                      <IconSymbol name="camera.fill" size={20} color={Colors.text} />
                      <Text style={styles.cameraOptionText}>Front</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Resolution & FPS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quality Settings</Text>
            <View style={styles.qualityRow}>
              <View style={styles.qualitySelector}>
                <Text style={styles.settingLabel}>Resolution</Text>
                <View style={styles.optionButtons}>
                  {resolutionOptions.map((resolution) => (
                    <TouchableOpacity
                      key={resolution}
                      style={[
                        styles.optionButton,
                        localSettings.resolution === resolution && styles.optionButtonActive
                      ]}
                      onPress={() => {
                        showStreamingWarning('resolution');
                        updateSetting('resolution', resolution);
                      }}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        localSettings.resolution === resolution && styles.optionButtonTextActive
                      ]}>
                        {resolution}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.qualitySelector}>
                <Text style={styles.settingLabel}>Frame Rate</Text>
                <View style={styles.optionButtons}>
                  {fpsOptions.map((fps) => (
                    <TouchableOpacity
                      key={fps}
                      style={[
                        styles.optionButton,
                        localSettings.fps === fps && styles.optionButtonActive
                      ]}
                      onPress={() => {
                        showStreamingWarning('frame rate');
                        updateSetting('fps', fps);
                      }}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        localSettings.fps === fps && styles.optionButtonTextActive
                      ]}>
                        {fps}fps
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Zoom Control */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zoom Control</Text>
            <View style={styles.zoomContainer}>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => handleZoomChange('out')}
              >
                <Text style={styles.zoomButtonText}>-</Text>
              </TouchableOpacity>
              <View style={styles.zoomDisplay}>
                <Text style={styles.zoomText}>{localSettings.zoom.toFixed(1)}x</Text>
              </View>
              <TouchableOpacity
                style={styles.zoomButton}
                onPress={() => handleZoomChange('in')}
              >
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Focus & Flash */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Camera Features</Text>
            <View style={styles.featuresRow}>
              <View style={styles.featureControl}>
                <Text style={styles.settingLabel}>Auto Focus</Text>
                <Switch
                  value={localSettings.focus === 'auto'}
                  onValueChange={(value) =>
                    updateSetting('focus', value ? 'auto' : 'manual')
                  }
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor={localSettings.focus === 'auto' ? Colors.text : '#f4f3f4'}
                />
              </View>

              <View style={styles.featureControl}>
                <Text style={styles.settingLabel}>Flash Mode</Text>
                <TouchableOpacity
                  style={styles.flashButton}
                  onPress={() => {
                    const modes: CameraSettings['flashMode'][] = ['off', 'on', 'auto', 'torch'];
                    const currentIndex = modes.indexOf(localSettings.flashMode);
                    const nextIndex = (currentIndex + 1) % modes.length;
                    updateSetting('flashMode', modes[nextIndex]);
                  }}
                >
                  <IconSymbol 
                    name={localSettings.flashMode === 'off' ? 'bolt.slash' : 'bolt.fill'} 
                    size={20} 
                    color={Colors.text} 
                  />
                  <Text style={styles.flashButtonText}>
                    {localSettings.flashMode.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Performance Info */}
          {isStreaming && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance</Text>
              <View style={styles.performanceInfo}>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Resolution</Text>
                  <Text style={styles.performanceValue}>{localSettings.resolution}</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Frame Rate</Text>
                  <Text style={styles.performanceValue}>{localSettings.fps}fps</Text>
                </View>
                <View style={styles.performanceItem}>
                  <Text style={styles.performanceLabel}>Zoom Level</Text>
                  <Text style={styles.performanceValue}>{localSettings.zoom}x</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
  },
  layoutGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  layoutButton: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  layoutButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}20`,
  },
  layoutButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  layoutButtonTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  cameraRow: {
    flexDirection: 'row',
    gap: 20,
  },
  cameraSelector: {
    flex: 1,
  },
  cameraLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  cameraToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 4,
  },
  cameraOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    gap: 8,
  },
  cameraOptionActive: {
    backgroundColor: Colors.primary,
  },
  cameraOptionText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  qualityRow: {
    gap: 20,
  },
  qualitySelector: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  optionButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  optionButtonTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 25,
    padding: 8,
  },
  zoomButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    color: Colors.background,
    fontSize: 20,
    fontWeight: 'bold',
  },
  zoomDisplay: {
    paddingHorizontal: 30,
  },
  zoomText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  featureControl: {
    flex: 1,
    alignItems: 'center',
  },
  flashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    gap: 8,
  },
  flashButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  performanceInfo: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 16,
  },
  performanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  performanceLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  performanceValue: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EnhancedCameraControls;