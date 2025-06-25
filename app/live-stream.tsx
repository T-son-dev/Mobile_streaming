import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useRouter, useLocalSearchParams} from 'expo-router';

const LiveStreamScreen: React.FC = () => {
  const router = useRouter();
  const { platform } = useLocalSearchParams<{ platform?: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Live Stream</Text>
        <Text style={styles.subtitle}>Platform: {platform || 'Not selected'}</Text>
        <Text style={styles.note}>Camera and streaming will be implemented in Week 2</Text>
        
        {/* Placeholder for camera view */}
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.placeholderText}>📹</Text>
          <Text style={styles.placeholderText}>Camera Preview</Text>
        </View>
        
        {/* Placeholder controls */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlText}>Start Stream</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backText: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#00ff88',
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
    textAlign: 'center',
  },
  cameraPlaceholder: {
    width: '100%',
    aspectRatio: 9/16,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#00ff88',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#666',
    fontSize: 18,
    marginBottom: 10,
  },
  controls: {
    width: '100%',
  },
  controlButton: {
    backgroundColor: '#00ff88',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
  },
  controlText: {
    color: '#0f0f23',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LiveStreamScreen;