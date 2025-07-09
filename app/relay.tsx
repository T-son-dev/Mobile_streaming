import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { ReplayIcon } from '@/components/icons';

const Colors = {
  background: '#0f0f23',
  surface: '#1a1a2e',
  primary: '#00ff88',
  text: '#ffffff',
  textSecondary: '#888888',
  border: '#404040',
};

const ReplayScreen: React.FC = () => {
  const responsive = useResponsive();
  const styles = createResponsiveStyles(responsive);

  // Mock replay data
  const mockReplays = [
    {
      id: 1,
      title: 'Stream Highlight #1',
      duration: '00:30',
      thumbnail: '🎬',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Epic Moment',
      duration: '01:45',
      thumbnail: '⭐',
      date: '2024-01-14',
    },
    {
      id: 3,
      title: 'Funny Clip',
      duration: '00:15',
      thumbnail: '😂',
      date: '2024-01-13',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <ReplayIcon />
          </View>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Replay Gallery</Text>
            <Text style={styles.subtitle}>Saved moments from your streams</Text>
          </View>
        </View>

        {/* Coming Soon Notice */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>🚀 Coming in Week 4</Text>
          <Text style={styles.comingSoonText}>
            Complete replay functionality will be implemented in Week 4, including:
          </Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• 10-second replay buffer</Text>
            <Text style={styles.featureItem}>• Automatic highlight detection</Text>
            <Text style={styles.featureItem}>• Manual clip creation</Text>
            <Text style={styles.featureItem}>• Export to gallery</Text>
            <Text style={styles.featureItem}>• Social media sharing</Text>
          </View>
        </View>

        {/* Mock Replay Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview Gallery</Text>
          <Text style={styles.sectionSubtitle}>
            This is how your replay gallery will look
          </Text>
          
          <View style={styles.replayGrid}>
            {mockReplays.map((replay) => (
              <TouchableOpacity 
                key={replay.id} 
                style={styles.replayCard}
                disabled={true}
              >
                <View style={styles.replayThumbnail}>
                  <Text style={styles.replayThumbnailIcon}>{replay.thumbnail}</Text>
                  <View style={styles.replayDuration}>
                    <Text style={styles.replayDurationText}>{replay.duration}</Text>
                  </View>
                </View>
                <View style={styles.replayInfo}>
                  <Text style={styles.replayTitle}>{replay.title}</Text>
                  <Text style={styles.replayDate}>{replay.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buffer Settings Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Buffer Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Replay Buffer</Text>
              <Text style={styles.settingValue}>10 seconds</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Auto-save Highlights</Text>
              <Text style={styles.settingValue}>Enabled</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Storage Location</Text>
              <Text style={styles.settingValue}>Internal Storage</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Max Replay Length</Text>
              <Text style={styles.settingValue}>5 minutes</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard} disabled={true}>
              <Text style={styles.actionIcon}>📹</Text>
              <Text style={styles.actionTitle}>Save Last 30s</Text>
              <Text style={styles.actionSubtitle}>Quick save</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} disabled={true}>
              <Text style={styles.actionIcon}>✂️</Text>
              <Text style={styles.actionTitle}>Create Clip</Text>
              <Text style={styles.actionSubtitle}>Custom length</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} disabled={true}>
              <Text style={styles.actionIcon}>📤</Text>
              <Text style={styles.actionTitle}>Share</Text>
              <Text style={styles.actionSubtitle}>Social media</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionCard} disabled={true}>
              <Text style={styles.actionIcon}>🗑️</Text>
              <Text style={styles.actionTitle}>Clear All</Text>
              <Text style={styles.actionSubtitle}>Free space</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Implementation Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <View style={styles.notesCard}>
            <Text style={styles.notesText}>
              The replay system will use a circular buffer to continuously record the last 10 seconds of your stream. 
              When you tap "Save Replay," it will process and save the buffered video with proper encoding and compression.
            </Text>
            <Text style={styles.notesText}>
              Highlights will be automatically detected using audio level spikes and user interactions, 
              making it easy to capture your best moments without manual intervention.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const createResponsiveStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: responsive.layout.containerPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.xl,
    backgroundColor: Colors.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 12,
  },
  headerIconContainer: {
    width: responsive.layout.iconSize.extraLarge + 10,
    height: responsive.layout.iconSize.extraLarge + 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsive.spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: (responsive.layout.iconSize.extraLarge + 10) / 2,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: responsive.typography.title,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: responsive.spacing.xs,
  },
  subtitle: {
    fontSize: responsive.typography.caption,
    color: Colors.textSecondary,
  },
  comingSoonCard: {
    backgroundColor: Colors.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 12,
    marginBottom: responsive.spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  comingSoonTitle: {
    fontSize: responsive.typography.heading,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: responsive.spacing.sm,
  },
  comingSoonText: {
    fontSize: responsive.typography.body,
    color: Colors.text,
    marginBottom: responsive.spacing.md,
    lineHeight: responsive.typography.body * 1.5,
  },
  featuresList: {
    gap: responsive.spacing.xs,
  },
  featureItem: {
    fontSize: responsive.typography.caption,
    color: Colors.textSecondary,
    lineHeight: responsive.typography.caption * 1.4,
  },
  section: {
    marginBottom: responsive.spacing.xl,
  },
  sectionTitle: {
    fontSize: responsive.typography.heading,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: responsive.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: responsive.typography.caption,
    color: Colors.textSecondary,
    marginBottom: responsive.spacing.md,
  },
  replayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: responsive.spacing.sm,
  },
  replayCard: {
    width: responsive.isTablet ? '30%' : '48%',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: responsive.spacing.sm,
    opacity: 0.7,
  },
  replayThumbnail: {
    height: responsive.isTablet ? 120 : 100,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  replayThumbnailIcon: {
    fontSize: responsive.isTablet ? 40 : 30,
  },
  replayDuration: {
    position: 'absolute',
    bottom: responsive.spacing.xs,
    right: responsive.spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: responsive.spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
  },
  replayDurationText: {
    color: Colors.text,
    fontSize: responsive.typography.tiny,
    fontWeight: '600',
  },
  replayInfo: {
    padding: responsive.spacing.sm,
  },
  replayTitle: {
    fontSize: responsive.typography.caption,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  replayDate: {
    fontSize: responsive.typography.tiny,
    color: Colors.textSecondary,
  },
  settingsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: responsive.layout.cardPadding,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsive.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLabel: {
    fontSize: responsive.typography.body,
    color: Colors.text,
  },
  settingValue: {
    fontSize: responsive.typography.body,
    color: Colors.primary,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: responsive.spacing.sm,
  },
  actionCard: {
    width: responsive.isTablet ? '22%' : '48%',
    backgroundColor: Colors.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 0.7,
  },
  actionIcon: {
    fontSize: responsive.layout.iconSize.large,
    marginBottom: responsive.spacing.sm,
  },
  actionTitle: {
    fontSize: responsive.typography.caption,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: responsive.spacing.xs,
  },
  actionSubtitle: {
    fontSize: responsive.typography.tiny,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  notesCard: {
    backgroundColor: Colors.surface,
    padding: responsive.layout.cardPadding,
    borderRadius: 8,
  },
  notesText: {
    fontSize: responsive.typography.caption,
    color: Colors.textSecondary,
    lineHeight: responsive.typography.caption * 1.5,
    marginBottom: responsive.spacing.md,
  },
});

export default ReplayScreen;