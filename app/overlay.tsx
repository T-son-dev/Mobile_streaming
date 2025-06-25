import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const OverlayScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Overlay Manager</Text>
        <Text style={styles.note}>Overlay features will be implemented in Week 3</Text>
        
        {/* Placeholder for overlay options */}
        <View style={styles.overlayPlaceholder}>
          <Text style={styles.placeholderText}>🎨</Text>
          <Text style={styles.placeholderText}>Image Overlays</Text>
          <Text style={styles.placeholderText}>Text Overlays</Text>
          <Text style={styles.placeholderText}>Web Overlays</Text>
          <Text style={styles.placeholderText}>Video Overlays</Text>
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 30,
  },
  overlayPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default OverlayScreen;