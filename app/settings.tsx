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
          <IconSymbol name="chevron.left" size={24} color={Colors.text} />
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
                <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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
                <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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
                <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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
                />
              </View>
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Localização de arquivo</Text>
              <View style={styles.settingValueContainer}>
                <Text style={styles.settingValueAccent}>{settings.storageLocation}</Text>
                <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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
                <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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
                <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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
              <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Informação do sistema</Text>
              <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Sobre nós</Text>
              <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Política de Privacidade</Text>
              <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <Text style={styles.settingLabel}>Termos de Utilização</Text>
              <IconSymbol name="chevron.right" size={16} color={Colors.accent} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 16,
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.accent,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    flex: 1,
    marginRight: 16,
  },
  settingValue: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueAccent: {
    fontSize: 14,
    color: Colors.accent,
    marginRight: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});

export default SettingsScreen;