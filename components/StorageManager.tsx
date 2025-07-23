import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart } from 'react-native-chart-kit';
import MediaStorageManager from '../services/MediaStorageManager';

const { width: screenWidth } = Dimensions.get('window');

interface StorageStats {
  used: number;
  available: number;
  percentage: number;
  breakdown: { [key: string]: number };
}

interface AnalyticsData {
  totalAssets: number;
  totalSize: number;
  categoryBreakdown: { category: string; count: number; size: number }[];
  recentActivity: any[];
}

export default function StorageManager() {
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cleanupInProgress, setCleanupInProgress] = useState(false);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      setLoading(true);
      
      // Load storage usage
      const usage = await MediaStorageManager.getStorageUsage();
      setStorageStats(usage);
      
      // Load analytics
      const analytics = await MediaStorageManager.getStorageAnalytics();
      setAnalyticsData(analytics);
      
    } catch (error) {
      console.error('Error loading storage data:', error);
      Alert.alert('Error', 'Failed to load storage information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStorageData();
    setRefreshing(false);
  };

  const handleCleanup = async () => {
    Alert.alert(
      'Clean Up Storage',
      'This will remove temporary files, old cache, and unused assets. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clean Up',
          onPress: async () => {
            try {
              setCleanupInProgress(true);
              await MediaStorageManager.performCleanupIfNeeded();
              await loadStorageData();
              Alert.alert('Success', 'Storage cleanup completed');
            } catch (error) {
              console.error('Cleanup error:', error);
              Alert.alert('Error', 'Failed to clean up storage');
            } finally {
              setCleanupInProgress(false);
            }
          }
        }
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getStorageColor = (percentage: number): string => {
    if (percentage < 50) return '#4CAF50';
    if (percentage < 80) return '#FF9800';
    return '#F44336';
  };

  const renderStorageOverview = () => {
    if (!storageStats) return null;

    const chartData = Object.entries(storageStats.breakdown).map(([name, size], index) => ({
      name,
      size,
      color: [
        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0', 
        '#F44336', '#607D8B', '#795548', '#E91E63'
      ][index % 8],
      legendFontColor: '#333',
      legendFontSize: 12
    }));

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Overview</Text>
        
        <View style={styles.storageHeader}>
          <View style={styles.storageInfo}>
            <Text style={styles.storageUsed}>
              {formatBytes(storageStats.used)} used
            </Text>
            <Text style={styles.storageTotal}>
              of {formatBytes(storageStats.used + storageStats.available)}
            </Text>
          </View>
          
          <View style={styles.storagePercentage}>
            <Text style={[
              styles.percentageText,
              { color: getStorageColor(storageStats.percentage) }
            ]}>
              {storageStats.percentage.toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill,
                { 
                  width: `${Math.min(storageStats.percentage, 100)}%`,
                  backgroundColor: getStorageColor(storageStats.percentage)
                }
              ]} 
            />
          </View>
        </View>

        {chartData.length > 0 && (
          <View style={styles.chartContainer}>
            <PieChart
              data={chartData}
              width={screenWidth - 32}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="size"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}
      </View>
    );
  };

  const renderStorageBreakdown = () => {
    if (!storageStats) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Storage Breakdown</Text>
        
        {Object.entries(storageStats.breakdown).map(([category, size], index) => {
          const percentage = storageStats.used > 0 ? (size / storageStats.used) * 100 : 0;
          
          return (
            <View key={category} style={styles.breakdownItem}>
              <View style={styles.breakdownHeader}>
                <View style={styles.breakdownLabel}>
                  <View style={[
                    styles.breakdownDot,
                    { backgroundColor: [
                      '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
                      '#F44336', '#607D8B', '#795548', '#E91E63'
                    ][index % 8] }
                  ]} />
                  <Text style={styles.breakdownName}>{category}</Text>
                </View>
                <Text style={styles.breakdownSize}>{formatBytes(size)}</Text>
              </View>
              
              <View style={styles.breakdownBar}>
                <View
                  style={[
                    styles.breakdownBarFill,
                    {
                      width: `${Math.max(percentage, 2)}%`,
                      backgroundColor: [
                        '#4CAF50', '#2196F3', '#FF9800', '#9C27B0',
                        '#F44336', '#607D8B', '#795548', '#E91E63'
                      ][index % 8]
                    }
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderAnalytics = () => {
    if (!analyticsData) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Analytics</Text>
        
        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>{analyticsData.totalAssets}</Text>
            <Text style={styles.analyticsLabel}>Total Assets</Text>
          </View>
          
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {formatBytes(analyticsData.totalSize)}
            </Text>
            <Text style={styles.analyticsLabel}>Total Size</Text>
          </View>
        </View>

        <Text style={styles.subsectionTitle}>Categories</Text>
        {analyticsData.categoryBreakdown.map(item => (
          <View key={item.category} style={styles.categoryItem}>
            <Text style={styles.categoryName}>{item.category}</Text>
            <View style={styles.categoryStats}>
              <Text style={styles.categoryStat}>{item.count} assets</Text>
              <Text style={styles.categoryStat}>{formatBytes(item.size)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderRecentActivity = () => {
    if (!analyticsData?.recentActivity) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {analyticsData.recentActivity.length === 0 ? (
          <Text style={styles.emptyText}>No recent activity</Text>
        ) : (
          analyticsData.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <Ionicons 
                name={activity.action === 'view' ? 'eye' : activity.action === 'use' ? 'play' : 'create'} 
                size={16} 
                color="#666" 
              />
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  {activity.action === 'view' ? 'Viewed' : activity.action === 'use' ? 'Used' : 'Edited'} {activity.filename}
                </Text>
                <Text style={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Storage Actions</Text>
      
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handleCleanup}
        disabled={cleanupInProgress}
      >
        {cleanupInProgress ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Ionicons name="trash" size={20} color="#007AFF" />
        )}
        <Text style={styles.actionButtonText}>
          {cleanupInProgress ? 'Cleaning...' : 'Clean Up Storage'}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="analytics" size={20} color="#007AFF" />
        <Text style={styles.actionButtonText}>View Detailed Analytics</Text>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="download" size={20} color="#007AFF" />
        <Text style={styles.actionButtonText}>Export Storage Report</Text>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
        <Ionicons name="warning" size={20} color="#F44336" />
        <Text style={[styles.actionButtonText, styles.dangerText]}>
          Reset All Data
        </Text>
        <Ionicons name="chevron-forward" size={16} color="#ccc" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading storage information...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {renderStorageOverview()}
      {renderStorageBreakdown()}
      {renderAnalytics()}
      {renderRecentActivity()}
      {renderActions()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 16,
    marginBottom: 12,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  storageInfo: {
    flex: 1,
  },
  storageUsed: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  storageTotal: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  storagePercentage: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 24,
    fontWeight: '700',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  breakdownItem: {
    marginBottom: 16,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  breakdownName: {
    fontSize: 14,
    color: '#333',
  },
  breakdownSize: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  breakdownBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  analyticsGrid: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  analyticsValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  categoryStats: {
    alignItems: 'flex-end',
  },
  categoryStat: {
    fontSize: 12,
    color: '#666',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#F44336',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
});