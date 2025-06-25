import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const SettingsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.note}>Settings UI will be implemented in Week 1 - Wednesday</Text>
        
        {/* Placeholder for settings items */}
        <View style={styles.settingsPlaceholder}>
          <Text style={styles.placeholderText}>⚙️</Text>
          <Text style={styles.placeholderText}>Stream Quality</Text>
          <Text style={styles.placeholderText}>Audio Settings</Text>
          <Text style={styles.placeholderText}>Account Management</Text>
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
  settingsPlaceholder: {
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

export default SettingsScreen;