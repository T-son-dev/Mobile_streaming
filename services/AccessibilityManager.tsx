import { AccessibilityInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AccessibilitySettings {
  screenReaderEnabled: boolean;
  highContrastEnabled: boolean;
  largeTextEnabled: boolean;
  reducedMotionEnabled: boolean;
  voiceOverEnabled: boolean;
  talkBackEnabled: boolean;
  switchControlEnabled: boolean;
  boldTextEnabled: boolean;
  customFontScale: number;
  announceUpdates: boolean;
}

export interface AccessibilityReport {
  timestamp: number;
  settings: AccessibilitySettings;
  compliance: {
    wcag21AA: boolean;
    section508: boolean;
    ada: boolean;
    score: number; // 0-100
  };
  issues: AccessibilityIssue[];
  recommendations: string[];
}

export interface AccessibilityIssue {
  id: string;
  type: 'contrast' | 'touch_target' | 'keyboard' | 'focus' | 'content' | 'navigation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  description: string;
  wcagGuideline: string;
  fix: string;
}

class AccessibilityManager {
  private settings: AccessibilitySettings;
  private readonly STORAGE_KEY = 'accessibility_settings';
  private listeners: Array<(settings: AccessibilitySettings) => void> = [];

  constructor() {
    this.settings = {
      screenReaderEnabled: false,
      highContrastEnabled: false,
      largeTextEnabled: false,
      reducedMotionEnabled: false,
      voiceOverEnabled: false,
      talkBackEnabled: false,
      switchControlEnabled: false,
      boldTextEnabled: false,
      customFontScale: 1.0,
      announceUpdates: true
    };
  }

  async initialize(): Promise<void> {
    try {
      // Load saved settings
      await this.loadSettings();
      
      // Detect system accessibility settings
      await this.detectSystemSettings();
      
      // Set up accessibility listeners
      this.setupAccessibilityListeners();
      
      console.log('AccessibilityManager initialized');
    } catch (error) {
      console.error('Error initializing AccessibilityManager:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving accessibility settings:', error);
    }
  }

  private async detectSystemSettings(): Promise<void> {
    try {
      // Detect screen reader
      const screenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      this.settings.screenReaderEnabled = screenReaderEnabled;

      if (Platform.OS === 'ios') {
        // iOS-specific checks
        this.settings.voiceOverEnabled = screenReaderEnabled;
      } else if (Platform.OS === 'android') {
        // Android-specific checks
        this.settings.talkBackEnabled = screenReaderEnabled;
      }

      // Detect high contrast (if available)
      try {
        const highContrastEnabled = await AccessibilityInfo.prefersCrossFadeTransitions();
        this.settings.highContrastEnabled = highContrastEnabled;
      } catch {
        // Not available on all platforms
      }

      // Detect reduced motion
      try {
        const reducedMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        this.settings.reducedMotionEnabled = reducedMotionEnabled;
      } catch {
        // Not available on all platforms
      }

      await this.saveSettings();
      this.notifyListeners();

    } catch (error) {
      console.error('Error detecting system accessibility settings:', error);
    }
  }

  private setupAccessibilityListeners(): void {
    // Listen for screen reader changes
    AccessibilityInfo.addEventListener('screenReaderChanged', (enabled) => {
      this.settings.screenReaderEnabled = enabled;
      if (Platform.OS === 'ios') {
        this.settings.voiceOverEnabled = enabled;
      } else {
        this.settings.talkBackEnabled = enabled;
      }
      this.saveSettings();
      this.notifyListeners();
    });

    // Listen for reduced motion changes
    AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      this.settings.reducedMotionEnabled = enabled;
      this.saveSettings();
      this.notifyListeners();
    });
  }

  // Settings Management
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  async updateSetting<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ): Promise<void> {
    this.settings[key] = value;
    await this.saveSettings();
    this.notifyListeners();
  }

  async updateSettings(updates: Partial<AccessibilitySettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
    this.notifyListeners();
  }

  // Event Listeners
  addSettingsListener(listener: (settings: AccessibilitySettings) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.settings));
  }

  // Accessibility Helpers
  shouldReduceMotion(): boolean {
    return this.settings.reducedMotionEnabled;
  }

  shouldUseHighContrast(): boolean {
    return this.settings.highContrastEnabled;
  }

  shouldUseLargeText(): boolean {
    return this.settings.largeTextEnabled;
  }

  getFontScale(): number {
    return this.settings.largeTextEnabled ? Math.max(1.2, this.settings.customFontScale) : this.settings.customFontScale;
  }

  isScreenReaderActive(): boolean {
    return this.settings.screenReaderEnabled;
  }

  shouldAnnounceUpdates(): boolean {
    return this.settings.announceUpdates && this.settings.screenReaderEnabled;
  }

  // Accessibility Testing
  async runAccessibilityAudit(): Promise<AccessibilityReport> {
    const issues: AccessibilityIssue[] = [];
    
    // Check touch target sizes
    issues.push(...this.checkTouchTargets());
    
    // Check color contrast
    issues.push(...this.checkColorContrast());
    
    // Check content accessibility
    issues.push(...this.checkContentAccessibility());
    
    // Check navigation accessibility
    issues.push(...this.checkNavigationAccessibility());

    // Calculate compliance scores
    const compliance = this.calculateCompliance(issues);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(issues);

    return {
      timestamp: Date.now(),
      settings: this.getSettings(),
      compliance,
      issues,
      recommendations
    };
  }

  private checkTouchTargets(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Simulate touch target analysis
    // In a real implementation, this would analyze actual UI components
    const touchTargets = [
      { component: 'overlay-resize-handle', size: 40 },
      { component: 'overlay-delete-button', size: 32 },
      { component: 'overlay-style-button', size: 36 }
    ];

    touchTargets.forEach(target => {
      if (target.size < 44) { // iOS HIG minimum
        issues.push({
          id: `touch-target-${target.component}`,
          type: 'touch_target',
          severity: target.size < 32 ? 'high' : 'medium',
          component: target.component,
          description: `Touch target is ${target.size}px, minimum recommended is 44px`,
          wcagGuideline: 'WCAG 2.1 SC 2.5.5 Target Size',
          fix: 'Increase touch target size to at least 44x44 pixels'
        });
      }
    });

    return issues;
  }

  private checkColorContrast(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Simulate color contrast analysis
    const colorPairs = [
      { component: 'overlay-text', foreground: '#666666', background: '#ffffff', ratio: 4.1 },
      { component: 'button-text', foreground: '#999999', background: '#ffffff', ratio: 2.8 },
      { component: 'error-text', foreground: '#ff4444', background: '#ffffff', ratio: 3.9 }
    ];

    colorPairs.forEach(pair => {
      if (pair.ratio < 4.5) { // WCAG AA requirement
        issues.push({
          id: `contrast-${pair.component}`,
          type: 'contrast',
          severity: pair.ratio < 3.0 ? 'critical' : 'high',
          component: pair.component,
          description: `Color contrast ratio is ${pair.ratio.toFixed(2)}:1, minimum required is 4.5:1`,
          wcagGuideline: 'WCAG 2.1 SC 1.4.3 Contrast (Minimum)',
          fix: 'Use darker colors to achieve at least 4.5:1 contrast ratio'
        });
      }
    });

    return issues;
  }

  private checkContentAccessibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Simulate content accessibility analysis
    const contentElements = [
      { component: 'overlay-image', hasAltText: false },
      { component: 'control-button', hasLabel: true },
      { component: 'status-indicator', hasAnnouncement: false }
    ];

    contentElements.forEach(element => {
      if (element.component.includes('image') && !element.hasAltText) {
        issues.push({
          id: `alt-text-${element.component}`,
          type: 'content',
          severity: 'high',
          component: element.component,
          description: 'Image missing alternative text for screen readers',
          wcagGuideline: 'WCAG 2.1 SC 1.1.1 Non-text Content',
          fix: 'Add descriptive alternative text for all images'
        });
      }

      if (element.component.includes('status') && !element.hasAnnouncement) {
        issues.push({
          id: `status-${element.component}`,
          type: 'content',
          severity: 'medium',
          component: element.component,
          description: 'Status changes not announced to screen readers',
          wcagGuideline: 'WCAG 2.1 SC 4.1.3 Status Messages',
          fix: 'Add ARIA live regions for status announcements'
        });
      }
    });

    return issues;
  }

  private checkNavigationAccessibility(): AccessibilityIssue[] {
    const issues: AccessibilityIssue[] = [];
    
    // Simulate navigation accessibility analysis
    const navigationElements = [
      { component: 'overlay-controls', keyboardAccessible: false },
      { component: 'modal-dialog', focusManagement: true },
      { component: 'tab-navigation', ariaLabels: false }
    ];

    navigationElements.forEach(element => {
      if (!element.keyboardAccessible) {
        issues.push({
          id: `keyboard-${element.component}`,
          type: 'keyboard',
          severity: 'critical',
          component: element.component,
          description: 'Component not accessible via keyboard navigation',
          wcagGuideline: 'WCAG 2.1 SC 2.1.1 Keyboard',
          fix: 'Ensure all interactive elements are keyboard accessible'
        });
      }

      if (!element.ariaLabels && element.component.includes('tab')) {
        issues.push({
          id: `aria-${element.component}`,
          type: 'navigation',
          severity: 'medium',
          component: element.component,
          description: 'Navigation elements missing ARIA labels',
          wcagGuideline: 'WCAG 2.1 SC 4.1.2 Name, Role, Value',
          fix: 'Add appropriate ARIA labels to navigation elements'
        });
      }
    });

    return issues;
  }

  private calculateCompliance(issues: AccessibilityIssue[]): AccessibilityReport['compliance'] {
    const totalChecks = 20; // Total number of accessibility checks
    const criticalIssues = issues.filter(i => i.severity === 'critical').length;
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    const lowIssues = issues.filter(i => i.severity === 'low').length;

    // Calculate weighted score
    const score = Math.max(0, 100 - (
      criticalIssues * 20 +
      highIssues * 10 +
      mediumIssues * 5 +
      lowIssues * 2
    ));

    return {
      wcag21AA: criticalIssues === 0 && highIssues === 0,
      section508: criticalIssues === 0 && highIssues <= 2,
      ada: criticalIssues === 0 && (highIssues + mediumIssues) <= 3,
      score
    };
  }

  private generateRecommendations(issues: AccessibilityIssue[]): string[] {
    const recommendations: string[] = [];
    
    // Priority recommendations based on issue types
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    const highIssues = issues.filter(i => i.severity === 'high');

    if (criticalIssues.length > 0) {
      recommendations.push('Address critical accessibility issues immediately to ensure basic usability');
    }

    if (highIssues.some(i => i.type === 'contrast')) {
      recommendations.push('Improve color contrast ratios to meet WCAG AA standards');
    }

    if (highIssues.some(i => i.type === 'touch_target')) {
      recommendations.push('Increase touch target sizes to minimum 44x44 pixels');
    }

    if (issues.some(i => i.type === 'keyboard')) {
      recommendations.push('Implement comprehensive keyboard navigation support');
    }

    if (issues.some(i => i.type === 'content')) {
      recommendations.push('Add proper labels and alternative text for all content');
    }

    // General recommendations
    recommendations.push('Test with real assistive technology users');
    recommendations.push('Implement automated accessibility testing in CI/CD pipeline');
    
    return recommendations;
  }

  // Accessibility Announcements
  async announceToUser(message: string, priority: 'low' | 'high' = 'low'): Promise<void> {
    if (!this.shouldAnnounceUpdates()) return;

    try {
      if (Platform.OS === 'ios') {
        // iOS VoiceOver announcement
        AccessibilityInfo.announceForAccessibility(message);
      } else if (Platform.OS === 'android') {
        // Android TalkBack announcement
        AccessibilityInfo.announceForAccessibility(message);
      }
    } catch (error) {
      console.error('Error making accessibility announcement:', error);
    }
  }

  // Focus Management
  async setAccessibilityFocus(viewRef: any): Promise<void> {
    if (!this.isScreenReaderActive()) return;

    try {
      AccessibilityInfo.setAccessibilityFocus(viewRef);
    } catch (error) {
      console.error('Error setting accessibility focus:', error);
    }
  }

  // Utility Methods
  getAccessibilityProps(role: string, label?: string, hint?: string): any {
    const props: any = {
      accessible: true,
      accessibilityRole: role,
    };

    if (label) {
      props.accessibilityLabel = label;
    }

    if (hint) {
      props.accessibilityHint = hint;
    }

    // Add platform-specific props
    if (Platform.OS === 'ios') {
      props.accessibilityTraits = this.getRoleTraits(role);
    }

    return props;
  }

  private getRoleTraits(role: string): string[] {
    // iOS accessibility traits mapping
    const traitMap: { [key: string]: string[] } = {
      button: ['button'],
      link: ['link'],
      text: ['staticText'],
      image: ['image'],
      header: ['header'],
      tab: ['button', 'selected'],
      switch: ['switch'],
      slider: ['adjustable']
    };

    return traitMap[role] || [];
  }

  // Theme adjustments based on accessibility settings
  getAccessibilityTheme(): {
    fontSize: number;
    contrast: 'normal' | 'high';
    motionReduced: boolean;
  } {
    return {
      fontSize: this.getFontScale(),
      contrast: this.shouldUseHighContrast() ? 'high' : 'normal',
      motionReduced: this.shouldReduceMotion()
    };
  }
}

export default new AccessibilityManager();