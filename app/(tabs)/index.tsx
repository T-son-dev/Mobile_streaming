import { IconSymbol } from '@/components/ui/IconSymbol';
import { PlatformIcon, PlatformType } from '@/components/ui/PlatformIcon';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
  danger: '#ff4757',
  border: '#404040',
};

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [showRTMPModal, setShowRTMPModal] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');

  const platforms = [
    {
      id: 'youtube' as PlatformType, 
      name: 'YouTube', 
      color: '#FF0000',
      description: 'Transmita para YouTube Live'
    },
    {
      id: 'facebook' as PlatformType, 
      name: 'Facebook', 
      color: '#1877F2',
      description: 'Transmita para Facebook Live'
    },
    {
      id: 'instagram' as PlatformType, 
      name: 'Instagram', 
      color: '#E4405F',
      description: 'Transmita para Instagram Live'
    },
    {
      id: 'twitch' as PlatformType, 
      name: 'Twitch', 
      color: '#9146FF',
      description: 'Transmita para Twitch'
    },
    {
      id: 'rtmp' as PlatformType, 
      name: 'RTMP', 
      color: '#00ff88',
      description: 'Configuração personalizada'
    },
    {
      id: 'srt' as PlatformType, 
      name: 'SRT', 
      color: '#FFA500',
      description: 'Protocolo SRT'
    },
  ];

  const handlePlatformSelect = (platform: any) => {
    if (platform.id === 'rtmp') {
      setShowRTMPModal(true);
    } else {
      router.push({
        pathname: '/live-stream',
        params: { platform: platform.id },
      });
    }
  };

  const handleRTMPConnect = () => {
    if (!rtmpUrl.trim() || !streamKey.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setShowRTMPModal(false);
    router.push({
      pathname: '/live-stream',
      params: { 
        platform: 'rtmp',
        rtmpUrl: rtmpUrl,
        streamKey: streamKey
      },
    });
  };

  const navigateToSettings = () => {
    router.push('/settings');
  };

  const navigateToOverlay = () => {
    router.push('/overlay');
  };

  const navigateToReplay = () => {
    router.push('/relay');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>APLICATIVO</Text>
          <Text style={styles.titleAccent}>TRANSMISSÃO</Text>
        </View>

        {/* Question */}
        <Text style={styles.questionText}>Onde você vai transmitir?</Text>

        {/* Platform Grid */}
        <View style={styles.platformGrid}>
          {platforms.map((platform) => (
            <TouchableOpacity
              key={platform.id}
              style={[styles.platformButton, { borderColor: platform.color }]}
              onPress={() => handlePlatformSelect(platform)}
            >
              <View style={[styles.platformIconContainer, { backgroundColor: platform.color }]}>
                <PlatformIcon platform={platform.id} size={32} />
              </View>
              <Text style={styles.platformName}>{platform.name}</Text>
              <Text style={styles.platformDescription}>{platform.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToSettings}>
            <IconSymbol name="bolt.fill" size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Configurações</Text>
              <Text style={styles.actionDescription}>Ajustar qualidade e configurações</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToOverlay}>
            <IconSymbol name="photo.fill" size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Gerenciar Overlays</Text>
              <Text style={styles.actionDescription}>Adicionar elementos visuais</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToReplay}>
            <IconSymbol name="globe" size={24} color={Colors.primary} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Galeria de Replays</Text>
              <Text style={styles.actionDescription}>Ver transmissões anteriores</Text>
            </View>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <Text style={styles.infoText}>CADASTRO DE CLIENTES</Text>
          <Text style={styles.infoText}>COBRANÇA RECORRENTE</Text>
          <Text style={styles.infoText}>PAGAMENTO VIA APPLE / GOOGLE PLAY</Text>
        </View>
      </ScrollView>

      {/* RTMP Setup Modal */}
      <Modal
        visible={showRTMPModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRTMPModal(false)}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>APLICATIVO</Text>
            <Text style={styles.modalTitleAccent}>TRANSMISSÃO</Text>
          </View>

          {/* Modal Content */}
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>URL RTMP</Text>
              <TextInput
                style={styles.textInput}
                placeholder="rtmp://artmpyoutube.com/live2"
                placeholderTextColor={Colors.textSecondary}
                value={rtmpUrl}
                onChangeText={setRtmpUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Stream Key</Text>
              <TextInput
                style={styles.textInput}
                placeholder="abcd-abcd-abcd-abcd-abcd"
                placeholderTextColor={Colors.textSecondary}
                value={streamKey}
                onChangeText={setStreamKey}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={styles.connectButton}
              onPress={handleRTMPConnect}
            >
              <Text style={styles.connectButtonText}>INICIAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowRTMPModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  platformButton: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 140,
  },
  platformIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  platformDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  actionContent: {
    flex: 1,
    marginLeft: 15,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  actionArrow: {
    fontSize: 20,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  bottomInfo: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalTitleAccent: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: Colors.text,
  },
  connectButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  connectButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.background,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default HomeScreen;