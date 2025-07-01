import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import {useRouter} from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  BrandColors,
  BackgroundColors,
  TextColors,
  PlatformColors,
  AnimationConfig,
  Spacing,
  Typography,
  Shadows,
} from '@/constants/Colors';

const {width} = Dimensions.get('window');

const platforms = [
  {
    id: 'youtube',
    name: 'Youtube',
    color: PlatformColors.youtube,
    bgColor: PlatformColors.youtube,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: PlatformColors.facebook,
    bgColor: PlatformColors.facebook,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: PlatformColors.instagram,
    bgColor: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
  },
  {
    id: 'twitch',
    name: 'Twitch',
    color: PlatformColors.twitch,
    bgColor: PlatformColors.twitch,
  },
  {
    id: 'rtmp',
    name: 'RTMP',
    color: PlatformColors.rtmp,
    bgColor: PlatformColors.rtmp,
  },
  {
    id: 'srt',
    name: 'SRT',
    color: PlatformColors.srt,
    bgColor: PlatformColors.srt,
  },
  {
    id: 'gravacao',
    name: 'Gravação',
    color: PlatformColors.youtube,
    bgColor: PlatformColors.youtube,
  },
];

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [showRTMPModal, setShowRTMPModal] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('rtmp://a.rtmp.youtube.com/live2');
  const [streamKey, setStreamKey] = useState('');
  const [selectedTab, setSelectedTab] = useState<'login' | 'cadastro'>('login');
  const [validationErrors, setValidationErrors] = useState<{rtmpUrl?: string; streamKey?: string}>({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const platformAnimations = useRef(platforms.map(() => new Animated.Value(0))).current;

  // Initialize entrance animations
  useEffect(() => {
    const entranceAnimation = Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: AnimationConfig.fade.duration,
          useNativeDriver: AnimationConfig.fade.useNativeDriver,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: AnimationConfig.timing.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: AnimationConfig.timing.useNativeDriver,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          ...AnimationConfig.spring,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(50, 
        platformAnimations.map(anim => 
          Animated.spring(anim, {
            toValue: 1,
            ...AnimationConfig.spring,
            useNativeDriver: true,
          })
        )
      ),
    ]);

    entranceAnimation.start();
  }, [fadeAnim, slideAnim, scaleAnim, platformAnimations]);

  // Validation functions
  const validateRTMPUrl = (url: string) => {
    if (!url.trim()) return 'URL RTMP é obrigatória';
    if (!url.startsWith('rtmp://') && !url.startsWith('rtmps://')) {
      return 'URL deve começar com rtmp:// ou rtmps://';
    }
    return null;
  };

  const validateStreamKey = (key: string) => {
    if (!key.trim()) return 'Chave de transmissão é obrigatória';
    if (key.length < 4) return 'Chave muito curta';
    return null;
  };

  const handlePlatformSelect = async (platform: any) => {
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (platform.id === 'rtmp') {
      setShowRTMPModal(true);
    } else {
      router.push({
        pathname: '/live-stream',
        params: {
          platform: platform.id,
        }
      });
    }
  };

  const handleRTMPConnect = async () => {
    const urlError = validateRTMPUrl(rtmpUrl);
    const keyError = validateStreamKey(streamKey);
    
    const errors = {
      rtmpUrl: urlError || undefined,
      streamKey: keyError || undefined,
    };
    
    setValidationErrors(errors);
    
    if (urlError || keyError) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowRTMPModal(false);
    router.push({
      pathname: '/live-stream',
      params: {
        platform: 'rtmp',
        streamUrl: rtmpUrl,
        streamKey: streamKey,
      }
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
      <StatusBar barStyle="light-content" backgroundColor={BackgroundColors.secondary} />
      
      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Main Card */}
          <View style={[styles.mainCard, Shadows.medium]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>APLICATIVO{'\n'}TRANSMISSÃO</Text>
          </View>

          {/* Platform Question */}
          <Text style={styles.questionText}>Onde você vai transmitir?</Text>

          {/* Platform Grid */}
          <View style={styles.platformGrid}>
            {platforms.map((platform, index) => (
              <Animated.View
                key={platform.id}
                style={{
                  opacity: platformAnimations[index],
                  transform: [{
                    scale: platformAnimations[index]
                  }]
                }}
              >
                <TouchableOpacity
                  style={[styles.platformButton, {backgroundColor: platform.bgColor}, Shadows.small]}
                  onPress={() => handlePlatformSelect(platform)}
                  activeOpacity={0.8}>
                  <Text style={styles.platformText}>{platform.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Login/Cadastro Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'login' && styles.activeTab]}
              onPress={() => setSelectedTab('login')}>
              <Text style={[styles.tabText, selectedTab === 'login' && styles.activeTabText]}>
                login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'cadastro' && styles.activeTab]}
              onPress={() => setSelectedTab('cadastro')}>
              <Text style={[styles.tabText, selectedTab === 'cadastro' && styles.activeTabText]}>
                cadastro
              </Text>
            </TouchableOpacity>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/live-stream')}>
            <Text style={styles.startButtonText}>INICIAR</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>CADASTRO DE CLIENTES{'\n'}COBRANÇA RECORRENTE</Text>
          <Text style={styles.featuresSubtitle}>PAGAMENTO VIA APPLE / GOOGLE PLAY</Text>
        </View>

        {/* Quick Access Buttons */}
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity style={styles.quickAccessButton} onPress={navigateToSettings}>
            <Text style={styles.quickAccessIcon}>⚙️</Text>
            <Text style={styles.quickAccessText}>Configurações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={navigateToOverlay}>
            <Text style={styles.quickAccessIcon}>🎨</Text>
            <Text style={styles.quickAccessText}>Overlays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={navigateToReplay}>
            <Text style={styles.quickAccessIcon}>🔄</Text>
            <Text style={styles.quickAccessText}>Replay</Text>
          </TouchableOpacity>
        </View>

        {/* App Version Footer */}
        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>v1.0.0 - Week 1 Complete ✅</Text>
          <Text style={styles.versionSubtext}>Pronto para revisão do protótipo</Text>
        </View>
      </ScrollView>
      </Animated.View>

      {/* RTMP Setup Modal */}
      <Modal
        visible={showRTMPModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRTMPModal(false)}>
        <View style={styles.modalContainer}>
          {/* Modal Card */}
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>APLICATIVO{'\n'}TRANSMISSÃO</Text>
            </View>
            
            {/* RTMP Form */}
            <View style={styles.rtmpForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL RTMP *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    validationErrors.rtmpUrl ? styles.textInputError : null
                  ]}
                  value={rtmpUrl}
                  onChangeText={(text) => {
                    setRtmpUrl(text);
                    if (validationErrors.rtmpUrl) {
                      setValidationErrors(prev => ({...prev, rtmpUrl: undefined}));
                    }
                  }}
                  placeholder="rtmp://a.rtmp.youtube.com/live2"
                  placeholderTextColor={TextColors.disabled}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {validationErrors.rtmpUrl && (
                  <Text style={styles.errorText}>{validationErrors.rtmpUrl}</Text>
                )}
                <Text style={styles.helpText}>
                  Digite a URL de streaming fornecida pela plataforma
                </Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Chave de Transmissão *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    validationErrors.streamKey ? styles.textInputError : null
                  ]}
                  value={streamKey}
                  onChangeText={(text) => {
                    setStreamKey(text);
                    if (validationErrors.streamKey) {
                      setValidationErrors(prev => ({...prev, streamKey: undefined}));
                    }
                  }}
                  placeholder="xxxx-xxxx-xxxx-xxxx-xxxx"
                  placeholderTextColor={TextColors.disabled}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={true}
                />
                {validationErrors.streamKey && (
                  <Text style={styles.errorText}>{validationErrors.streamKey}</Text>
                )}
                <Text style={styles.helpText}>
                  Chave secreta da sua conta de streaming
                </Text>
              </View>
            </View>
            
            {/* Modal Start Button */}
            <TouchableOpacity style={styles.modalStartButton} onPress={handleRTMPConnect}>
              <Text style={styles.modalStartButtonText}>INICIAR</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowRTMPModal(false)}>
            <Text style={styles.modalCloseText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BackgroundColors.primary,
  },
  animatedContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  mainCard: {
    backgroundColor: BackgroundColors.tertiary,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BrandColors.primary,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title,
    color: TextColors.primary,
    textAlign: 'center',
  },
  questionText: {
    ...Typography.body,
    color: TextColors.primary,
    marginBottom: Spacing.lg,
    textAlign: 'left',
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  platformButton: {
    width: (width - 80) / 3.5,
    height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  platformText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginRight: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#7ED321',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
  },
  activeTabText: {
    color: '#7ED321',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#7ED321',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  featuresSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  quickAccessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAccessButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    minWidth: 80,
  },
  quickAccessIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAccessText: {
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0f0f23',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#2a2a3e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#7ED321',
    padding: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 22,
  },
  rtmpForm: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 6,
    padding: 12,
    color: '#ffffff',
    fontSize: 14,
  },
  modalStartButton: {
    backgroundColor: '#7ED321',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalStartButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  modalCloseText: {
    color: BrandColors.primary,
    fontSize: 16,
  },
  // New styles for enhanced features
  textInputError: {
    borderColor: TextColors.error,
    borderWidth: 2,
  },
  errorText: {
    color: TextColors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  helpText: {
    color: TextColors.secondary,
    fontSize: 11,
    marginTop: 4,
    marginLeft: 4,
    fontStyle: 'italic',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: BackgroundColors.tertiary,
  },
  versionText: {
    ...Typography.caption,
    color: TextColors.accent,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  versionSubtext: {
    ...Typography.small,
    color: TextColors.secondary,
    textAlign: 'center',
  },
});

export default HomeScreen;