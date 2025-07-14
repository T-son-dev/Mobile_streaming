import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { performanceMonitor, PerformanceMetrics, PerformanceAlert } from '@/services/PerformanceMonitor';
import { streamingService } from '@/services/streamingService';

const { width: screenWidth } = Dimensions.get('window');

interface StreamAnalyticsDashboardProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend
}) => (
  <View style={[styles.metricCard, { borderLeftColor: color }]}>
    <View style={styles.metricHeader}>
      <IconSymbol name={icon} size={20} color={color} />
      <Text style={styles.metricTitle}>{title}</Text>
      {trend && (
        <IconSymbol
          name={trend === 'up' ? 'arrow.up' : trend === 'down' ? 'arrow.down' : 'minus'}
          size={16}
          color={trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'}
        />
      )}
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
  </View>
);

const StreamAnalyticsDashboard: React.FC<StreamAnalyticsDashboardProps> = ({
  isVisible,
  onClose
}) => {
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    // Subscribe to performance metrics
    const unsubscribeMetrics = performanceMonitor.subscribeToMetrics((metrics) => {
      setCurrentMetrics(metrics);
    });

    // Subscribe to alerts
    const unsubscribeAlerts = performanceMonitor.subscribeToAlerts((alert) => {
      setActiveAlerts(prev => [...prev, alert]);
    });

    // Check if monitoring is active
    setIsMonitoring(performanceMonitor.isMonitoringActive());

    // Get current data
    const metrics = performanceMonitor.getCurrentMetrics();
    if (metrics) {
      setCurrentMetrics(metrics);
    }

    const alerts = performanceMonitor.getActiveAlerts();
    setActiveAlerts(alerts);

    // Auto-refresh every 5 seconds
    const refreshInterval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 5000);

    return () => {
      unsubscribeMetrics();
      unsubscribeAlerts();
      clearInterval(refreshInterval);
    };
  }, [isVisible, refreshKey]);

  const handleStartStopMonitoring = () => {
    if (isMonitoring) {
      performanceMonitor.stopMonitoring();
      setIsMonitoring(false);
    } else {
      performanceMonitor.startMonitoring();
      setIsMonitoring(true);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    performanceMonitor.resolveAlert(alertId);
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const handleClearAllAlerts = () => {
    activeAlerts.forEach(alert => {
      performanceMonitor.resolveAlert(alert.id);
    });
    setActiveAlerts([]);
  };

  const getAlertColor = (type: PerformanceAlert['type']) => {
    switch (type) {
      case 'critical': return '#ef4444';
      case 'error': return '#f97316';
      case 'warning': return '#eab308';
      default: return '#6b7280';
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} GB`;
    }
    return `${bytes} MB`;
  };

  if (!isVisible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stream Analytics</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.monitorButton, isMonitoring && styles.monitorButtonActive]}
              onPress={handleStartStopMonitoring}
            >
              <IconSymbol
                name={isMonitoring ? 'pause.circle' : 'play.circle'}
                size={20}
                color={isMonitoring ? '#ef4444' : '#10b981'}
              />
              <Text style={styles.monitorButtonText}>
                {isMonitoring ? 'Stop' : 'Start'} Monitor
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <IconSymbol name="xmark" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Performance Overview */}
          {currentMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Performance Overview</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Overall Score"
                  value={`${currentMetrics.overallScore}/100`}
                  icon="gauge"
                  color="#8b5cf6"
                />
                <MetricCard
                  title="Stability"
                  value={`${currentMetrics.stabilityScore}/100`}
                  icon="shield.checkered"
                  color="#10b981"
                />
                <MetricCard
                  title="Quality"
                  value={`${currentMetrics.qualityScore}/100`}
                  icon="star.fill"
                  color="#f59e0b"
                />
                <MetricCard
                  title="Thermal"
                  value={currentMetrics.thermalState}
                  icon="thermometer"
                  color={currentMetrics.thermalState === 'normal' ? '#10b981' : '#ef4444'}
                />
              </View>
            </View>
          )}

          {/* System Resources */}
          {currentMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Resources</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Memory"
                  value={formatBytes(currentMetrics.memoryUsage.used)}
                  subtitle={`${currentMetrics.memoryUsage.percentage.toFixed(1)}% of ${formatBytes(currentMetrics.memoryUsage.total)}`}
                  icon="memorychip"
                  color="#6366f1"
                />
                <MetricCard
                  title="CPU"
                  value={`${currentMetrics.cpuUsage.percentage.toFixed(1)}%`}
                  subtitle={`${currentMetrics.cpuUsage.cores} cores`}
                  icon="cpu"
                  color="#8b5cf6"
                />
                <MetricCard
                  title="Battery"
                  value={`${currentMetrics.batteryLevel}%`}
                  icon="battery.100"
                  color={currentMetrics.batteryLevel > 20 ? '#10b981' : '#ef4444'}
                />
              </View>
            </View>
          )}

          {/* Streaming Statistics */}
          {currentMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Streaming Statistics</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Bitrate"
                  value={`${currentMetrics.streamingStats.bitrate} kbps`}
                  icon="wifi"
                  color="#06b6d4"
                />
                <MetricCard
                  title="Frame Rate"
                  value={`${currentMetrics.streamingStats.fps} fps`}
                  icon="video"
                  color="#10b981"
                />
                <MetricCard
                  title="Resolution"
                  value={currentMetrics.streamingStats.resolution}
                  icon="viewfinder"
                  color="#8b5cf6"
                />
                <MetricCard
                  title="Duration"
                  value={formatDuration(currentMetrics.streamingStats.duration)}
                  icon="clock"
                  color="#f59e0b"
                />
                <MetricCard
                  title="Dropped Frames"
                  value={`${currentMetrics.streamingStats.droppedFrames}`}
                  subtitle={`${((currentMetrics.streamingStats.droppedFrames / Math.max(1, currentMetrics.streamingStats.totalFrames)) * 100).toFixed(2)}%`}
                  icon="exclamationmark.triangle"
                  color={currentMetrics.streamingStats.droppedFrames > 10 ? '#ef4444' : '#10b981'}
                />
                <MetricCard
                  title="Total Frames"
                  value={`${currentMetrics.streamingStats.totalFrames}`}
                  icon="square.grid.3x3"
                  color="#6b7280"
                />
              </View>
            </View>
          )}

          {/* Network Performance */}
          {currentMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Network Performance</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Upload Speed"
                  value={`${(currentMetrics.networkSpeed.upload / 1000).toFixed(1)} Mbps`}
                  icon="arrow.up.circle"
                  color="#10b981"
                />
                <MetricCard
                  title="Download Speed"
                  value={`${(currentMetrics.networkSpeed.download / 1000).toFixed(1)} Mbps`}
                  icon="arrow.down.circle"
                  color="#06b6d4"
                />
                <MetricCard
                  title="Latency"
                  value={`${currentMetrics.networkSpeed.latency} ms`}
                  icon="timer"
                  color={currentMetrics.networkSpeed.latency > 100 ? '#ef4444' : '#10b981'}
                />
              </View>
            </View>
          )}

          {/* Camera Performance */}
          {currentMetrics && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Camera Performance</Text>
              <View style={styles.metricsGrid}>
                <MetricCard
                  title="Front Camera"
                  value={currentMetrics.cameraStats.frontCameraActive ? 'Active' : 'Inactive'}
                  icon="camera.fill"
                  color={currentMetrics.cameraStats.frontCameraActive ? '#10b981' : '#6b7280'}
                />
                <MetricCard
                  title="Back Camera"
                  value={currentMetrics.cameraStats.backCameraActive ? 'Active' : 'Inactive'}
                  icon="camera"
                  color={currentMetrics.cameraStats.backCameraActive ? '#10b981' : '#6b7280'}
                />
                <MetricCard
                  title="Processing Time"
                  value={`${currentMetrics.cameraStats.processingTime.toFixed(1)} ms`}
                  icon="gearshape"
                  color="#8b5cf6"
                />
                <MetricCard
                  title="Capture Latency"
                  value={`${currentMetrics.cameraStats.captureLatency.toFixed(1)} ms`}
                  icon="stopwatch"
                  color="#f59e0b"
                />
              </View>
            </View>
          )}

          {/* Active Alerts */}
          {activeAlerts.length > 0 && (
            <View style={styles.section}>
              <View style={styles.alertsHeader}>
                <Text style={styles.sectionTitle}>Active Alerts ({activeAlerts.length})</Text>
                <TouchableOpacity 
                  style={styles.clearAlertsButton}
                  onPress={handleClearAllAlerts}
                >
                  <Text style={styles.clearAlertsText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {activeAlerts.map((alert) => (
                <View 
                  key={alert.id} 
                  style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.type) }]}
                >
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      <IconSymbol
                        name={alert.type === 'critical' ? 'exclamationmark.octagon' : 'exclamationmark.triangle'}
                        size={16}
                        color={getAlertColor(alert.type)}
                      />
                      <Text style={[styles.alertType, { color: getAlertColor(alert.type) }]}>
                        {alert.type.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertDetails}>
                      {alert.metric}: {alert.value.toFixed(1)} (threshold: {alert.threshold})
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.resolveButton}
                    onPress={() => handleResolveAlert(alert.id)}
                  >
                    <IconSymbol name="checkmark" size={16} color="#10b981" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* No Data State */}
          {!currentMetrics && (
            <View style={styles.noDataContainer}>
              <IconSymbol name="chart.bar" size={48} color="#6b7280" />
              <Text style={styles.noDataTitle}>No Performance Data</Text>
              <Text style={styles.noDataSubtitle}>
                Start monitoring to see real-time analytics
              </Text>
              <TouchableOpacity
                style={styles.startMonitoringButton}
                onPress={handleStartStopMonitoring}
              >
                <Text style={styles.startMonitoringText}>Start Monitoring</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monitorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    gap: 6,
  },
  monitorButtonActive: {
    backgroundColor: '#fee2e2',
  },
  monitorButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  closeButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  metricsGrid: {
    gap: 12,
  },
  metricCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  metricTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearAlertsButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  },
  clearAlertsText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  alertType: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  alertDetails: {
    fontSize: 12,
    color: '#6b7280',
  },
  resolveButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f0fdf4',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  startMonitoringButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
  startMonitoringText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});

export default StreamAnalyticsDashboard;