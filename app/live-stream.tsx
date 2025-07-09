import StreamingInterface from '@/components/StreamingInterface';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

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