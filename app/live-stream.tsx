import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import StreamingInterface from '@/components/StreamingInterface';

const LiveStreamScreen: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StreamingInterface />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default LiveStreamScreen;