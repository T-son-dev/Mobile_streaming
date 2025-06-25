import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../App';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const platforms = [
    {id: 'youtube', name: 'YouTube', color: '#FF0000', icon: '📺'},
    {id: 'facebook', name: 'Facebook', color: '#1877F2', icon: '📘'},
    {id: 'instagram', name: 'Instagram', color: '#E4405F', icon: '📷'},
    {id: 'twitch', name: 'Twitch', color: '#9146FF', icon: '🎮'},
    {id: 'rtmp', name: 'RTMP', color: '#00ff88', icon: '📡'},
    {id: 'srt', name: 'SRT', color: '#FFA500', icon: '🚀'},
  ];

  const handlePlatformSelect = (platform: string) => {
    navigation.navigate('LiveStream', {
      platform: platform as any,
    });
  };

  const navigateToSettings = () => {
    navigation.navigate('Settings');
  };

  const navigateToOverlay = () => {
    navigation.navigate('Overlay');
  };

  const navigateToReplay = () => {
    navigation.navigate('Replay');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>Mobile Streaming App</Text>
          <Text style={styles.subtitle}>Choose your streaming platform</Text>
        </View>

        {/* Platform Selection */}
        <View style={styles.platformContainer}>
          <Text style={styles.sectionTitle}>Streaming Platforms</Text>
          <View style={styles.platformGrid}>
            {platforms.map((platform) => (
              <TouchableOpacity
                key={platform.id}
                style={[styles.platformButton, {borderColor: platform.color}]}
                onPress={() => handlePlatformSelect(platform.id)}>
                <Text style={styles.platformIcon}>{platform.icon}</Text>
                <Text style={styles.platformName}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={navigateToSettings}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToOverlay}>
            <Text style={styles.actionIcon}>🎨</Text>
            <Text style={styles.actionText}>Manage Overlays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToReplay}>
            <Text style={styles.actionIcon}>🔄</Text>
            <Text style={styles.actionText}>Replay Gallery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
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
    aspectRatio: 1.5,
    backgroundColor: '#1a1a2e',
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  platformIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  platformName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#00ff88',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;