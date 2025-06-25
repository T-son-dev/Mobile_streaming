import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const {width} = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [rtmpModalVisible, setRtmpModalVisible] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState('');
  const [streamKey, setStreamKey] = useState('');

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      color: '#FF0000',
      icon: '📺',
      description: 'Stream to YouTube Live',
      badge: 'POPULAR',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: '#1877F2',
      icon: '📘',
      description: 'Facebook Live streaming',
      badge: 'SOCIAL',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      color: '#E4405F',
      icon: '📷',
      description: 'Instagram Live stories',
      badge: 'STORIES',
    },
    {
      id: 'twitch',
      name: 'Twitch',
      color: '#9146FF',
      icon: '🎮',
      description: 'Gaming & entertainment',
      badge: 'GAMING',
    },
    {
      id: 'rtmp',
      name: 'RTMP',
      color: '#00ff88',
      icon: '📡',
      description: 'Custom RTMP server',
      badge: 'CUSTOM',
    },
    {
      id: 'srt',
      name: 'SRT',
      color: '#FFA500',
      icon: '🚀',
      description: 'Low-latency streaming',
      badge: 'PRO',
    },
  ];

  const quickStats = [
    {label: 'Total Streams', value: '24', icon: '📊'},
    {label: 'Hours Streamed', value: '156', icon: '⏱️'},
    {label: 'Total Viewers', value: '2.4K', icon: '👥'},
  ];

  const quickActions = [
    {
      id: 'settings',
      title: 'Stream Settings',
      description: 'Configure video quality and preferences',
      icon: '⚙️',
      action: () => navigation.navigate('Settings'),
    },
    {
      id: 'overlay',
      title: 'Overlay Manager',
      description: 'Add graphics and widgets to your stream',
      icon: '🎨',
      action: () => navigation.navigate('Overlay'),
    },
    {
      id: 'replay',
      title: 'Replay Gallery',
      description: 'View and manage recorded streams',
      icon: '🔄',
      action: () => navigation.navigate('Replay'),
    },
  ];

  const recentActivities = [
    {id: 1, platform: 'YouTube', duration: '2h 15m', viewers: '847', date: '2 hours ago'},
    {id: 2, platform: 'Twitch', duration: '3h 42m', viewers: '1.2K', date: '1 day ago'},
    {id: 3, platform: 'Facebook', duration: '1h 33m', viewers: '394', date: '2 days ago'},
  ];

  const handlePlatformSelect = (platform: string) => {
    if (platform === 'rtmp') {
      setRtmpModalVisible(true);
      return;
    }
    navigation.navigate('LiveStream', {
      platform: platform as any,
    });
  };

  const handleRtmpConfirm = () => {
    if (rtmpUrl && streamKey) {
      setRtmpModalVisible(false);
      navigation.navigate('LiveStream', {
        platform: 'rtmp',
        rtmpUrl,
        streamKey,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section with StreamCast Branding */}
        <View style={styles.header}>
          <Text style={styles.logo}>StreamCast</Text>
          <Text style={styles.tagline}>Professional Mobile Streaming</Text>
        </View>

        {/* Quick Stats Dashboard */}
        <View style={styles.statsContainer}>
          {quickStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Platform Selection with Enhanced Design */}
        <View style={styles.platformContainer}>
          <Text style={styles.sectionTitle}>Choose Your Platform</Text>
          <View style={styles.platformGrid}>
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[styles.platformButton, {borderColor: platform.color}]}
                onPress={() => handlePlatformSelect(platform.id)}>
                <View style={styles.platformBadge}>
                  <Text style={styles.badgeText}>{platform.badge}</Text>
                </View>
                <Text style={styles.platformIcon}>{platform.icon}</Text>
                <Text style={styles.platformName}>{platform.name}</Text>
                <Text style={styles.platformDescription}>{platform.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Enhanced Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionButton}
              onPress={action.action}>
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDescription}>{action.description}</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityPlatform}>{activity.platform}</Text>
                  <Text style={styles.activityDetails}>
                    {activity.duration} • {activity.viewers} viewers
                  </Text>
                </View>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📺</Text>
              <Text style={styles.emptyTitle}>No recent streams</Text>
              <Text style={styles.emptyDescription}>
                Start your first stream to see activity here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* RTMP Configuration Modal */}
      <Modal
        visible={rtmpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setRtmpModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>RTMP Configuration</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setRtmpModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.inputLabel}>RTMP Server URL</Text>
              <TextInput
                style={styles.input}
                value={rtmpUrl}
                onChangeText={setRtmpUrl}
                placeholder="rtmp://your-server.com/live"
                placeholderTextColor="#666"
              />
              
              <Text style={styles.inputLabel}>Stream Key</Text>
              <TextInput
                style={styles.input}
                value={streamKey}
                onChangeText={setStreamKey}
                placeholder="Enter your stream key"
                placeholderTextColor="#666"
                secureTextEntry={true}
              />
            </View>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setRtmpModalVisible(false)}>
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleRtmpConfirm}>
                <Text style={styles.modalButtonPrimaryText}>Start Stream</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
    borderTopWidth: 3,
    borderTopColor: '#00ff88',
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  platformContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ff88',
    marginBottom: 15,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  platformButton: {
    width: '48%',
    backgroundColor: '#1a1a2e',
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
    backgroundColor: '#00ff88',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f0f23',
  },
  platformIcon: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  platformName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  platformDescription: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
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
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    color: '#888',
    fontSize: 13,
    lineHeight: 18,
  },
  actionArrow: {
    color: '#00ff88',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityPlatform: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityDetails: {
    color: '#888',
    fontSize: 13,
  },
  activityDate: {
    color: '#666',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 15,
    opacity: 0.5,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    width: width * 0.9,
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalClose: {
    padding: 5,
  },
  modalCloseText: {
    color: '#888',
    fontSize: 18,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f0f23',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    gap: 10,
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonSecondaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonPrimary: {
    flex: 1,
    backgroundColor: '#00ff88',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimaryText: {
    color: '#0f0f23',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;