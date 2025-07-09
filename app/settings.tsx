import { IconSymbol } from '@/components/ui/IconSymbol';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { SettingIcon } from '@/components/icons';

// Colors matching the Portuguese design
const Colors = {
  background: '#1a1a2e',
  surface: '#2a2a3e',
  primary: '#00ff88',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  accent: '#3498db',
  border: '#404040',
  success: '#26de81',
};

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const responsive = useResponsive();

  // Settings state
  const [settings, setSettings] = useState({
    resolution: '720p (HD)',
    fps: '30 FPS',
    quality: 'Ultra alto',
    variableBitrate: true,
    saveVideo: true,
    storageLocation: 'Armazenamento interno',
    autoRotation: true,
    autoFocus: 'Manual',
    preview: false,
    micSource: 'Microfone',
  });

  const styles = createResponsiveStyles(responsive);

  const resolutionOptions = ['480p', '720p (HD)', '1080p (Full HD)', '4K'];
  const fpsOptions = ['24 FPS', '30 FPS', '60 FPS'];
  const qualityOptions = ['Baixo', 'Médio', 'Alto', 'Ultra alto'];
  const focusOptions = ['Automático', 'Manual'];
  const micOptions = ['Microfone', 'Microfone Externo', 'Bluetooth'];

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const showOptionPicker = (title: string, options: string[], currentValue: string, onSelect: (value: string) => void) => {
    Alert.alert(
      title,
      'Selecione uma opção:',
      options.map(option => ({
        text: option,
        onPress: () => onSelect(option),
        style: option === currentValue ? 'default' : 'cancel'
      }))
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="chevron.left" size={responsive.layout.iconSize.medium} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Server Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVIDOR</Text>
          <View style={styles.sectionContent}>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Endereço da transmissão</Text>
              <Text style={styles.settingValue}>
                rtmp://a.rtmp.youtube.com/live2/cc55-0b7f/ue7-mk61-7726
              </Text>
            </View>
          </View>
        </View>

        {/* Stream Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STREAM</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => showOptionPicker(
                'Resolução',
                resolutionOptions,
                settings.resolution,
                (value) => updateSetting('resolution', value)
              )}
            >
              <Text style={styles.settingLabel}>Resolução</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.resolution}</Text>
                <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => showOptionPicker(
                'Taxa de Quadros',
                fpsOptions,
                settings.fps,
                (value) => updateSetting('fps', value)
              )}
            >
              <Text style={styles.settingLabel}>Velocidade de quadros por segundo (fps)</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.fps}</Text>
                <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => showOptionPicker(
                'Qualidade',
                qualityOptions,
                settings.quality,
                (value) => updateSetting('quality', value)
              )}
            >
              <Text style={styles.settingLabel}>Qualidade</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.quality}</Text>
                <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
              </View>
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Bitrate variável</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>
                  {settings.variableBitrate ? 'Ligado' : 'Desligado'}
                </Text>
                <Switch
                  value={settings.variableBitrate}
                  onValueChange={(value) => updateSetting('variableBitrate', value)}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={settings.variableBitrate ? Colors.text : '#f4f3f4'}
                  style={styles.switch}
                />
              </View>
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Salvar vídeo ao vivo</Text>
              <View style={styles.settingValueContainer}>
                <Switch
                  value={settings.saveVideo}
                  onValueChange={(value) => updateSetting('saveVideo', value)}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={settings.saveVideo ? Colors.text : '#f4f3f4'}
                  style={styles.switch}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Localização de arquivo</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.storageLocation}</Text>
                <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
              </View>
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Rotação da tela</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>
                  {settings.autoRotation ? 'Auto rotação' : 'Fixo'}
                </Text>
                <Switch
                  value={settings.autoRotation}
                  onValueChange={(value) => updateSetting('autoRotation', value)}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={settings.autoRotation ? Colors.text : '#f4f3f4'}
                  style={styles.switch}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Camera Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CÂMERA</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => showOptionPicker(
                'Foco',
                focusOptions,
                settings.autoFocus,
                (value) => updateSetting('autoFocus', value)
              )}
            >
              <Text style={styles.settingLabel}>Foco automático</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.autoFocus}</Text>
                <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
              </View>
            </TouchableOpacity>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Antevisão</Text>
              <View style={styles.settingValueContainer}>
                <Switch
                  value={settings.preview}
                  onValueChange={(value) => updateSetting('preview', value)}
                  trackColor={{ false: '#767577', true: Colors.primary }}
                  thumbColor={settings.preview ? Colors.text : '#f4f3f4'}
                  style={styles.switch}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ÁUDIO</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.settingRow}
              onPress={() => showOptionPicker(
                'Fonte de Microfone',
                micOptions,
                settings.micSource,
                (value) => updateSetting('micSource', value)
              )}
            >
              <Text style={styles.settingLabel}>Fonte de MIC</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.micSource}</Text>
                <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GERAL</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Centro de ajuda</Text>
              <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Informação do sistema</Text>
              <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sobre nós</Text>
              <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Política de Privacidade</Text>
              <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Termos de Utilização</Text>
              <IconSymbol name="chevron.right" size={responsive.layout.iconSize.small} color={Colors.accent} />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
          <Text style={styles.versionSubtext}>Mobile Streaming App</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const createResponsiveStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive.layout.containerPadding,
    paddingVertical: responsive.spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: responsive.layout.headerHeight,
  },
  backButton: {
    width: responsive.layout.iconSize.extraLarge,
    height: responsive.layout.iconSize.extraLarge,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsive.layout.iconSize.extraLarge / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: responsive.typography.heading,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: responsive.spacing.md,
    flex: 1,
  },
  headerSpacer: {
    width: responsive.layout.iconSize.extraLarge,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginTop: responsive.spacing.xl,
  },
  sectionTitle: {
    fontSize: responsive.typography.body,
    fontWeight: 'bold',
    color: Colors.accent,
    paddingHorizontal: responsive.layout.containerPadding,
    marginBottom: responsive.spacing.sm,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    marginHorizontal: responsive.layout.containerPadding,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    padding: responsive.layout.cardPadding,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsive.layout.cardPadding,
    paddingVertical: responsive.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: responsive.layout.buttonHeight + 10,
  },
  settingLabel: {
    fontSize: responsive.typography.body,
    color: Colors.text,
    flex: 1,
    marginRight: responsive.spacing.md,
  },
  settingValue: {
    fontSize: responsive.typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueAccent: