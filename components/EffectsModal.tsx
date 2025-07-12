import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface EffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEffectSelect: (effectType: string, effectId: number) => void;
  onWebOverlayAdd: (url: string, title: string) => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.3)',
  surface: 'rgba(255, 255, 255, 0.95)',
  surfaceDark: '#2d3748',
  text: '#1f2937',
  textSecondary: '#6b7280',
  textWhite: '#ffffff',
  primary: '#22c55e',
  accent: '#84cc16',
  border: '#e5e7eb',
  tabActive: '#ffffff',
  tabInactive: '#9ca3af',
  onAirRed: '#ef4444',
};

type TabType = 'IMAGE' | 'VIDEO' | 'WEB' | 'PLACARDS' | 'CHRONOMETER';

const EffectsModal: React.FC<EffectsModalProps> = ({ 
  isOpen, 
  onClose, 
  onEffectSelect,
  onWebOverlayAdd 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('IMAGE');
  const [webUrl, setWebUrl] = useState('http://website.website.site.site.com');
  const [webTitle, setWebTitle] = useState('URL Title');

  if (!isOpen) return null;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'IMAGE', label: 'IMAGE' },
    { key: 'VIDEO', label: 'VIDEO' },
    { key: 'WEB', label: 'WEB' },
    { key: 'PLACARDS', label: 'PLACARDS' },
    { key: 'CHRONOMETER', label: 'CHRONOMETER' },
  ];

  const renderImageContent = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentScroll}>
      {[1, 2, 3, 4, 5].map((num) => (
        <TouchableOpacity 
          key={num} 
          style={styles.effectCard}
          onPress={() => onEffectSelect('image', num)}
        >
          <View style={styles.effectCardContent}>
            <View style={styles.onAirBadge}>
              <Text style={styles.onAirText}>NO AR</Text>
            </View>
            <Text style={styles.effectNumber}>{num}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVideoContent = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentScroll}>
      {[1, 2, 3, 4, 5].map((num) => (
        <TouchableOpacity 
          key={num} 
          style={styles.effectCard}
          onPress={() => onEffectSelect('video', num)}
        >
          <View style={styles.effectCardContent}>
            <View style={styles.onAirBadge}>
              <Text style={styles.onAirText}>NO AR</Text>
            </View>
            <Text style={styles.effectNumber}>{num}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWebContent = () => (
    <View style={styles.webContent}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentScroll}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity 
            key={num} 
            style={styles.webCard}
            onPress={() => onEffectSelect('web', num)}
          >
            <View style={styles.effectCardContent}>
              <View style={styles.onAirBadge}>
                <Text style={styles.onAirText}>NO AR</Text>
              </View>
              <View style={styles.webCardContent}>
                <Text style={styles.webTitle}>TITLE</Text>
                <Text style={styles.webSubtitle}>WEB {num}</Text>
              </View>
              <View style={styles.webIcon}>
                <IconSymbol name="globe" size={20} color={Colors.textWhite} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={styles.webUrlSection}>
        <View style={styles.urlInputContainer}>
          <View style={styles.urlSection}>
            <Text style={styles.urlLabel}>URL SITE</Text>
            <TextInput
              style={styles.urlInput}
              value={webUrl}
              onChangeText={setWebUrl}
              placeholder="Enter website URL"
            />
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.titleLabel}>TITLE</Text>
            <TextInput
              style={styles.titleInput}
              value={webTitle}
              onChangeText={setWebTitle}
              placeholder="Enter title"
            />
          </View>
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => onWebOverlayAdd(webUrl, webTitle)}
        >
          <IconSymbol name="plus" size={20} color={Colors.textWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlacardsContent = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contentScroll}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
        <TouchableOpacity 
          key={num} 
          style={styles.effectCard}
          onPress={() => onEffectSelect('placards', num)}
        >
          <View style={styles.effectCardContent}>
            <View style={styles.onAirBadge}>
              <Text style={styles.onAirText}>NO AR</Text>
            </View>
            <Text style={styles.effectNumber}>{num}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderChronometerContent = () => (
    <View style={styles.chronometerContent}>
      <Text style={styles.comingSoon}>Chronometer Coming Soon</Text>
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'IMAGE':
        return renderImageContent();
      case 'VIDEO':
        return renderVideoContent();
      case 'WEB':
        return renderWebContent();
      case 'PLACARDS':
        return renderPlacardsContent();
      case 'CHRONOMETER':
        return renderChronometerContent();
      default:
        return renderImageContent();
    }
  };

  return (
    <>
      {/* Overlay to close when clicking outside */}
      <TouchableOpacity 
        style={styles.overlay} 
        onPress={onClose}
        activeOpacity={1}
      />
      
      <View style={styles.container}>
        {/* Triangle pointer */}
        <View style={styles.triangle} />
        
        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
        
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
                activeTab === tab.key && tab.key === 'WEB' && styles.tabActiveWeb
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.overlay,
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    top: 90,
    left: 72, // Position under waveform button (second button, accounting for gap)
    backgroundColor: Colors.surface,
    borderRadius: 12,
    minWidth: 500,
    maxWidth: 600,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 999,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    left: 24, // Center triangle above the waveform button
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
    zIndex: 1000,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.text,
  },
  tabActiveWeb: {
    borderBottomColor: Colors.text,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    minHeight: 120,
  },
  contentScroll: {
    flexDirection: 'row',
  },
  effectCard: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
  },
  webCard: {
    width: 120,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
  },
  effectCardContent: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onAirBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: Colors.onAirRed,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  onAirText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  effectNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  webCardContent: {
    alignItems: 'center',
  },
  webTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 2,
  },
  webSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  webIcon: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  webContent: {
    gap: 16,
  },
  webUrlSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  urlInputContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 8,
    padding: 12,
  },
  urlSection: {
    marginBottom: 12,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  urlInput: {
    backgroundColor: 'transparent',
    color: Colors.primary,
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  titleSection: {},
  titleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  titleInput: {
    backgroundColor: 'transparent',
    color: Colors.primary,
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chronometerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  comingSoon: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default EffectsModal;