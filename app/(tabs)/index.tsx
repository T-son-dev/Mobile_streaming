import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PlatformIcon, PlatformType } from '@/components/ui/PlatformIcon';
import { IconSymbol } from '@/components/ui/IconSymbol';

const HomeScreen: React.FC = () => {
  const router = useRouter();

  const platforms = [
    {id: 'youtube' as PlatformType, name: 'YouTube', color: '#FF0000'},
    {id: 'facebook' as PlatformType, name: 'Facebook', color: '#1877F2'},
    {id: 'instagram' as PlatformType, name: 'Instagram', color: '#E4405F'},
    {id: 'twitch' as PlatformType, name: 'Twitch', color: '#9146FF'},
    {id: 'rtmp' as PlatformType, name: 'RTMP', color: '#00ff88'},
    {id: 'srt' as PlatformType, name: 'SRT', color: '#FFA500'},
  ];

  const handlePlatformSelect = (platform: string) => {
    router.push({
      pathname: '/live-stream',
      params: { platform },
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
                <PlatformIcon platform={platform.id} size={32} />
                <Text style={styles.platformName}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={navigateToSettings}>
            <IconSymbol name="bolt.fill" size={24} color="#00ff88" style={styles.actionIcon} />
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToOverlay}>
            <IconSymbol name="photo.fill" size={24} color="#00ff88" style={styles.actionIcon} />
            <Text style={styles.actionText}>Manage Overlays</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToReplay}>
            <IconSymbol name="globe" size={24} color="#00ff88" style={styles.actionIcon} />
            <Text style={styles.actionText}>Relay Gallery</Text>
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
    marginRight: 15,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;