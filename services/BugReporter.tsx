import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface BugReport {
  id: string;
  timestamp: number;
  type: 'crash' | 'performance' | 'ui' | 'functionality' | 'accessibility' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  reproductionSteps: string[];
  expectedBehavior: string;
  actualBehavior: string;
  environment: EnvironmentInfo;
  logs: LogEntry[];
  screenshots: string[];
  userInfo: {
    userId?: string;
    sessionId: string;
    userAgent: string;
  };
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  tags: string[];
  metadata: { [key: string]: any };
}

export interface EnvironmentInfo {
  platform: string;
  platformVersion: string;
  deviceModel: string;
  appVersion: string;
  buildNumber: string;
  screenDimensions: {
    width: number;
    height: number;
    scale: number;
  };
  memoryUsage: number;
  batteryLevel?: number;
  networkType?: string;
  timestamp: number;
}

export interface LogEntry {
  timestamp: number;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: string;
  message: string;
  data?: any;
}

class BugReporter {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;
  private readonly STORAGE_KEY = 'bug_reports';
  private readonly LOGS_STORAGE_KEY = 'debug_logs';
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.setupGlobalErrorHandlers();
    this.loadStoredLogs();
  }

  // Initialize the bug reporter
  async initialize(): Promise<void> {
    try {
      await this.loadStoredLogs();
      this.log('info', 'BugReporter', 'Bug reporter initialized', { sessionId: this.sessionId });
    } catch (error) {
      console.error('Error initializing BugReporter:', error);
    }
  }

  // Logging methods
  log(level: LogEntry['level'], category: string, message: string, data?: any): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data
    };

    this.logs.push(logEntry);
    
    // Keep only the last MAX_LOGS entries
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Store logs periodically
    this.storeLogsDebounced();

    // Console output for debugging
    const logMethod = console[level] || console.log;
    logMethod(`[${category}] ${message}`, data || '');
  }

  debug(category: string, message: string, data?: any): void {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any): void {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any): void {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, data?: any): void {
    this.log('error', category, message, data);
  }

  // Bug reporting methods
  async reportBug(bugData: Omit<BugReport, 'id' | 'timestamp' | 'environment' | 'logs' | 'userInfo' | 'status'>): Promise<string> {
    try {
      const bugReport: BugReport = {
        id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        environment: await this.collectEnvironmentInfo(),
        logs: this.getRecentLogs(100), // Last 100 log entries
        userInfo: {
          sessionId: this.sessionId,
          userAgent: await this.getUserAgent()
        },
        status: 'open',
        ...bugData
      };

      // Store the bug report
      await this.storeBugReport(bugReport);

      // Log the bug report creation
      this.info('BugReporter', 'Bug report created', {
        id: bugReport.id,
        type: bugReport.type,
        severity: bugReport.severity
      });

      return bugReport.id;

    } catch (error) {
      this.error('BugReporter', 'Failed to create bug report', error);
      throw error;
    }
  }

  // Quick bug reporting methods
  async reportCrash(error: Error, context?: string): Promise<string> {
    return await this.reportBug({
      type: 'crash',
      severity: 'critical',
      title: `Application Crash: ${error.name}`,
      description: error.message,
      reproductionSteps: ['App crashed unexpectedly'],
      expectedBehavior: 'App should function normally',
      actualBehavior: `App crashed with error: ${error.message}`,
      screenshots: [],
      tags: ['crash', 'auto-reported'],
      metadata: {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        context: context || 'unknown'
      }
    });
  }

  async reportPerformanceIssue(details: {
    component: string;
    metric: string;
    expectedValue: number;
    actualValue: number;
    description?: string;
  }): Promise<string> {
    return await this.reportBug({
      type: 'performance',
      severity: 'medium',
      title: `Performance Issue: ${details.component}`,
      description: details.description || `${details.metric} performance below expected threshold`,
      reproductionSteps: [`Use ${details.component}`, `Monitor ${details.metric}`],
      expectedBehavior: `${details.metric} should be ${details.expectedValue}`,
      actualBehavior: `${details.metric} was ${details.actualValue}`,
      screenshots: [],
      tags: ['performance', 'auto-reported'],
      metadata: details
    });
  }

  async reportUIIssue(details: {
    component: string;
    issue: string;
    severity?: BugReport['severity'];
    reproductionSteps?: string[];
  }): Promise<string> {
    return await this.reportBug({
      type: 'ui',
      severity: details.severity || 'medium',
      title: `UI Issue: ${details.component}`,
      description: details.issue,
      reproductionSteps: details.reproductionSteps || ['Navigate to affected component'],
      expectedBehavior: 'UI should display correctly',
      actualBehavior: details.issue,
      screenshots: [],
      tags: ['ui', 'auto-reported'],
      metadata: { component: details.component }
    });
  }

  // Screenshot methods
  async captureScreenshot(): Promise<string | null> {
    try {
      // Screenshot capture would need platform-specific implementation
      // For now, return mock path
      const screenshotDir = `${FileSystem.cacheDirectory}screenshots/`;
      const screenshotPath = `${screenshotDir}screenshot_${Date.now()}.png`;
      
      // Mock screenshot creation
      await FileSystem.makeDirectoryAsync(screenshotDir, { intermediates: true });
      await FileSystem.writeAsStringAsync(screenshotPath, 'mock_screenshot_data', { encoding: FileSystem.EncodingType.Base64 });
      
      this.debug('BugReporter', 'Screenshot captured', { path: screenshotPath });
      return screenshotPath;

    } catch (error) {
      this.error('BugReporter', 'Failed to capture screenshot', error);
      return null;
    }
  }

  // Environment collection
  private async collectEnvironmentInfo(): Promise<EnvironmentInfo> {
    const { width, height, scale } = Dimensions.get('window');
    
    return {
      platform: Platform.OS,
      platformVersion: Platform.Version.toString(),
      deviceModel: await this.getDeviceModel(),
      appVersion: '1.0.0', // Would come from app config
      buildNumber: '1', // Would come from app config
      screenDimensions: { width, height, scale },
      memoryUsage: await this.getMemoryUsage(),
      batteryLevel: await this.getBatteryLevel(),
      networkType: await this.getNetworkType(),
      timestamp: Date.now()
    };
  }

  private async getDeviceModel(): Promise<string> {
    // Device model detection would need platform-specific implementation
    return `${Platform.OS} Device`;
  }

  private async getUserAgent(): Promise<string> {
    const env = await this.collectEnvironmentInfo();
    return `StreamingApp/${env.appVersion} (${env.platform} ${env.platformVersion}; ${env.deviceModel})`;
  }

  private async getMemoryUsage(): Promise<number> {
    // Memory usage detection would need platform-specific implementation
    return 250 * 1024 * 1024; // Mock 250MB
  }

  private async getBatteryLevel(): Promise<number | undefined> {
    // Battery level detection would need platform-specific implementation
    return 75; // Mock 75%
  }

  private async getNetworkType(): Promise<string | undefined> {
    // Network type detection would need platform-specific implementation
    return 'wifi'; // Mock wifi
  }

  // Global error handlers
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalHandler = global.onunhandledrejection;
    global.onunhandledrejection = (event) => {
      this.error('Global', 'Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
      
      // Report as crash if critical
      if (event.reason instanceof Error) {
        this.reportCrash(event.reason, 'unhandled_promise_rejection');
      }
      
      if (originalHandler) {
        originalHandler(event);
      }
    };

    // Handle React Native errors
    const originalErrorHandler = global.ErrorUtils?.getGlobalHandler();
    global.ErrorUtils?.setGlobalHandler((error, isFatal) => {
      this.error('Global', 'React Native error', {
        error: error.message,
        stack: error.stack,
        isFatal
      });
      
      if (isFatal) {
        this.reportCrash(error, 'react_native_fatal_error');
      }
      
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });
  }

  // Log management
  private getRecentLogs(count: number): LogEntry[] {
    return this.logs.slice(-count);
  }

  private storeLogsTimeout: NodeJS.Timeout | null = null;

  private storeLogsDebounced(): void {
    if (this.storeLogsTimeout) {
      clearTimeout(this.storeLogsTimeout);
    }
    
    this.storeLogsTimeout = setTimeout(() => {
      this.storeLogs();
    }, 5000); // Store logs every 5 seconds max
  }

  private async storeLogs(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LOGS_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error storing logs:', error);
    }
  }

  private async loadStoredLogs(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.LOGS_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored logs:', error);
    }
  }

  // Bug report storage and retrieval
  private async storeBugReport(report: BugReport): Promise<void> {
    try {
      const existingReports = await this.getBugReports();
      existingReports.push(report);
      
      // Keep only last 50 reports
      const recentReports = existingReports.slice(-50);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(recentReports));
    } catch (error) {
      console.error('Error storing bug report:', error);
      throw error;
    }
  }

  async getBugReports(): Promise<BugReport[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading bug reports:', error);
      return [];
    }
  }

  async getBugReport(id: string): Promise<BugReport | null> {
    try {
      const reports = await this.getBugReports();
      return reports.find(report => report.id === id) || null;
    } catch (error) {
      console.error('Error loading bug report:', error);
      return null;
    }
  }

  async updateBugReportStatus(id: string, status: BugReport['status']): Promise<void> {
    try {
      const reports = await this.getBugReports();
      const reportIndex = reports.findIndex(report => report.id === id);
      
      if (reportIndex !== -1) {
        reports[reportIndex].status = status;
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(reports));
        
        this.info('BugReporter', 'Bug report status updated', { id, status });
      }
    } catch (error) {
      console.error('Error updating bug report status:', error);
      throw error;
    }
  }

  // Analytics and reporting
  async getBugReportAnalytics(): Promise<{
    totalReports: number;
    byType: { [key: string]: number };
    bySeverity: { [key: string]: number };
    byStatus: { [key: string]: number };
    recentTrends: { date: string; count: number }[];
  }> {
    try {
      const reports = await this.getBugReports();
      
      const byType: { [key: string]: number } = {};
      const bySeverity: { [key: string]: number } = {};
      const byStatus: { [key: string]: number } = {};
      const dailyCounts: { [key: string]: number } = {};
      
      reports.forEach(report => {
        // By type
        byType[report.type] = (byType[report.type] || 0) + 1;
        
        // By severity
        bySeverity[report.severity] = (bySeverity[report.severity] || 0) + 1;
        
        // By status
        byStatus[report.status] = (byStatus[report.status] || 0) + 1;
        
        // Daily trends
        const date = new Date(report.timestamp).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      
      const recentTrends = Object.entries(dailyCounts)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-30) // Last 30 days
        .map(([date, count]) => ({ date, count }));
      
      return {
        totalReports: reports.length,
        byType,
        bySeverity,
        byStatus,
        recentTrends
      };
      
    } catch (error) {
      console.error('Error generating bug report analytics:', error);
      throw error;
    }
  }

  // Export functionality
  async exportBugReports(): Promise<string> {
    try {
      const reports = await this.getBugReports();
      const analytics = await this.getBugReportAnalytics();
      
      const exportData = {
        exportTimestamp: Date.now(),
        sessionId: this.sessionId,
        analytics,
        reports: reports.map(report => ({
          ...report,
          logs: report.logs.slice(-50) // Limit logs per report
        }))
      };
      
      const exportJson = JSON.stringify(exportData, null, 2);
      const exportPath = `${FileSystem.documentDirectory}bug_reports_export_${Date.now()}.json`;
      
      await FileSystem.writeAsStringAsync(exportPath, exportJson, { encoding: FileSystem.EncodingType.UTF8 });
      
      this.info('BugReporter', 'Bug reports exported', { path: exportPath });
      return exportPath;
      
    } catch (error) {
      console.error('Error exporting bug reports:', error);
      throw error;
    }
  }

  // Cleanup
  async clearOldReports(olderThanDays: number = 30): Promise<number> {
    try {
      const reports = await this.getBugReports();
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      const filteredReports = reports.filter(report => report.timestamp > cutoffTime);
      const deletedCount = reports.length - filteredReports.length;
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredReports));
      
      this.info('BugReporter', 'Old bug reports cleared', { 
        deletedCount, 
        remainingCount: filteredReports.length 
      });
      
      return deletedCount;
      
    } catch (error) {
      console.error('Error clearing old reports:', error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      await AsyncStorage.removeItem(this.LOGS_STORAGE_KEY);
      this.logs = [];
      
      this.info('BugReporter', 'All bug reporter data cleared');
    } catch (error) {
      console.error('Error clearing bug reporter data:', error);
      throw error;
    }
  }
}

export default new BugReporter();