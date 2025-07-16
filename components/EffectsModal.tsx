import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '../utils/responsive';

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
  const responsive = useResponsive();
  const isNativeMobile = responsive.isNativeMobile;
  const isLandscape = responsive.orientation === 'landscape';

  if (!isOpen) return null;

  // Dynamic positioning based on responsive layout to position below Effects button
  const getModalPosition = () => {
    const headerHeight = responsive.headerHeight || 48;
    const gap = 4; // Small gap between button and modal
    const screenWidth = responsive.screenWidth || 375;
    
    if (isNativeMobile && isLandscape) {
      // For mobile landscape - position under second button in headerRight (effects/waveform button)
      const headerPadding = responsive.safeAreaHorizontal || 8;
      const rightSectionStart = screenWidth / 2; 
      const buttonSize = 32; // Mobile landscape button size
      const buttonGap = 8; // Gap between buttons
      const modalWidth = 280; // Mobile landscape modal width
      
      // Second button in headerRight section
      const firstButtonLeft = rightSectionStart + headerPadding;
      const secondButtonLeft = firstButtonLeft + buttonSize + buttonGap;
      const secondButtonCenter = secondButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: Math.max(8, secondButtonCenter - (modalWidth / 2)), // Ensure modal doesn't go off screen
      };
    } else if (isNativeMobile) {
      // For mobile portrait
      const headerPadding = responsive.safeAreaHorizontal || 8;
      const rightSectionStart = screenWidth / 2;
      const buttonSize = 28; // Mobile portrait button size
      const buttonGap = 8;
      const modalWidth = 320; // Mobile portrait modal width
      
      const firstButtonLeft = rightSectionStart + headerPadding;
      const secondButtonLeft = firstButtonLeft + buttonSize + buttonGap;
      const secondButtonCenter = secondButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: Math.max(8, secondButtonCenter - (modalWidth / 2)),
      };
    } else {
      // For desktop
      const headerPadding = 16;
      const rightSectionStart = screenWidth / 2;
      const buttonSize = 48; // Desktop button size
      const buttonGap = 12;
      const modalWidth = 500; // Desktop modal width
      
      const firstButtonLeft = rightSectionStart + headerPadding;
      const secondButtonLeft = firstButtonLeft + buttonSize + buttonGap;
      const secondButtonCenter = secondButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: Math.max(16, secondButtonCenter - (modalWidth / 2)),
      };
    }
  };

  const modalPosition = getModalPosition();

  const tabs: { key: TabType; label: string }[] = [
    { key: 'IMAGE', label: 'IMAGE' },
    { key: 'VIDEO', label: 'VIDEO' },
    { key: 'WEB', label: 'WEB' },
    { key: 'PLACARDS', label: 'PLACARDS' },
    { key: 'CHRONOMETER', label: 'CHRONO' }, // Shorter for mobile
  ];

  const renderImageContent = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={[
        styles.contentScroll,
        isNativeMobile && styles.contentScrollMobile
      ]}
    >
      {[1, 2, 3, 4, 5].map((num) => (
        <TouchableOpacity 
          key={num} 
          style={[
            styles.effectCard,
            isNativeMobile && styles.effectCardMobile
          ]}
          onPress={() => onEffectSelect('image', num)}
        >
          <View style={styles.effectCardContent}>
            <View style={[
              styles.onAirBadge,
              isNativeMobile && styles.onAirBadgeMobile
            ]}>
              <Text style={[
                styles.onAirText,
                isNativeMobile && styles.onAirTextMobile
              ]}>NO AR</Text>
            </View>
            <Text style={[
              styles.effectNumber,
              isNativeMobile && styles.effectNumberMobile
            ]}>{num}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderVideoContent = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={[
        styles.contentScroll,
        isNativeMobile && styles.contentScrollMobile
      ]}
    >
      {[1, 2, 3, 4, 5].map((num) => (
        <TouchableOpacity 
          key={num} 
          style={[
            styles.effectCard,
            isNativeMobile && styles.effectCardMobile
          ]}
          onPress={() => onEffectSelect('video', num)}
        >
          <View style={styles.effectCardContent}>
            <View style={[
              styles.onAirBadge,
              isNativeMobile && styles.onAirBadgeMobile
            ]}>
              <Text style={[
                styles.onAirText,
                isNativeMobile && styles.onAirTextMobile
              ]}>NO AR</Text>
            </View>
            <Text style={[
              styles.effectNumber,
              isNativeMobile && styles.effectNumberMobile
            ]}>{num}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderWebContent = () => (
    <View style={[
      styles.webContent,
      isNativeMobile && styles.webContentMobile
    ]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={[
          styles.contentScroll,
          isNativeMobile && styles.contentScrollMobile
        ]}
      >
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity 
            key={num} 
            style={[
              styles.webCard,
              isNativeMobile && styles.webCardMobile
            ]}
            onPress={() => onEffectSelect('web', num)}
          >
            <View style={styles.effectCardContent}>
              <View style={[
                styles.onAirBadge,
                isNativeMobile && styles.onAirBadgeMobile
              ]}>
                <Text style={[
                  styles.onAirText,
                  isNativeMobile && styles.onAirTextMobile
                ]}>NO AR</Text>
              </View>
              <View style={styles.webCardContent}>
                <Text style={[
                  styles.webTitle,
                  isNativeMobile && styles.webTitleMobile
                ]}>TITLE</Text>
                <Text style={[
                  styles.webSubtitle,
                  isNativeMobile && styles.webSubtitleMobile
                ]}>WEB {num}</Text>
              </View>
              <View style={styles.webIcon}>
                <IconSymbol 
                  name="globe" 
                  size={isNativeMobile ? 12 : 20} 
                  color={Colors.textWhite} 
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <View style={[
        styles.webUrlSection,
        isNativeMobile && styles.webUrlSectionMobile
      ]}>
        <View style={[
          styles.urlInputContainer,
          isNativeMobile && styles.urlInputContainerMobile
        ]}>
          <View style={[
            styles.urlSection,
            isNativeMobile && styles.urlSectionMobile
          ]}>
            <Text style={[
              styles.urlLabel,
              isNativeMobile && styles.urlLabelMobile
            ]}>URL SITE</Text>
            <TextInput
              style={[
                styles.urlInput,
                isNativeMobile && styles.urlInputMobile
              ]}
              value={webUrl}
              onChangeText={setWebUrl}
              placeholder="Enter website URL"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
          <View style={[
            styles.titleSection,
            isNativeMobile && styles.titleSectionMobile
          ]}>
            <Text style={[
              styles.titleLabel,
              isNativeMobile && styles.titleLabelMobile
            ]}>TITLE</Text>
            <TextInput
              style={[
                styles.titleInput,
                isNativeMobile && styles.titleInputMobile
              ]}
              value={webTitle}
              onChangeText={setWebTitle}
              placeholder="Enter title"
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>
        <TouchableOpacity 
          style={[
            styles.addButton,
            isNativeMobile && styles.addButtonMobile
          ]}
          onPress={() => onWebOverlayAdd(webUrl, webTitle)}
        >
          <IconSymbol 
            name="plus" 
            size={isNativeMobile ? 14 : 20} 
            color={Colors.textWhite} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPlacardsContent = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={[
        styles.contentScroll,
        isNativeMobile && styles.contentScrollMobile
      ]}
    >
      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
        <TouchableOpacity 
          key={num} 
          style={[
            styles.effectCard,
            isNativeMobile && styles.effectCardMobile
          ]}
          onPress={() => onEffectSelect('placards', num)}
        >
          <View style={styles.effectCardContent}>
            <View style={[
              styles.onAirBadge,
              isNativeMobile && styles.onAirBadgeMobile
            ]}>
              <Text style={[
                styles.onAirText,
                isNativeMobile && styles.onAirTextMobile
              ]}>NO AR</Text>
            </View>
            <Text style={[
              styles.effectNumber,
              isNativeMobile && styles.effectNumberMobile
            ]}>{num}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderChronometerContent = () => (
    <View style={[
      styles.chronometerContent,
      isNativeMobile && styles.chronometerContentMobile
    ]}>
      <Text style={[
        styles.comingSoon,
        isNativeMobile && styles.comingSoonMobile
      ]}>Chronometer Coming Soon</Text>
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
      
      <View style={[
        styles.container,
        isNativeMobile && styles.containerMobile,
        isNativeMobile && isLandscape && styles.containerMobileLandscape,
        {
          top: modalPosition.top,
          left: modalPosition.left,
        }
      ]}>
        {/* Triangle pointer */}
        <View style={[
          styles.triangle,
          isNativeMobile && styles.triangleMobile
        ]} />
        
        {/* Close button */}
        <TouchableOpacity style={[
          styles.closeButton,
          isNativeMobile && styles.closeButtonMobile
        ]} onPress={onClose}>
          <Text style={[
            styles.closeButtonText,
            isNativeMobile && styles.closeButtonTextMobile
          ]}>×</Text>
        </TouchableOpacity>
        
        {/* Tabs */}
        <View style={[
          styles.tabsContainer,
          isNativeMobile && styles.tabsContainerMobile
        ]}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                isNativeMobile && styles.tabMobile,
                activeTab === tab.key && styles.tabActive,
                activeTab === tab.key && tab.key === 'WEB' && styles.tabActiveWeb
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[
                styles.tabText,
                isNativeMobile && styles.tabTextMobile,
                activeTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Content */}
        <View style={[
          styles.content,
          isNativeMobile && styles.contentMobile
        ]}>
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
  containerMobile: {
    borderRadius: 8,
    minWidth: 280,
    maxWidth: 320,
    shadowRadius: 4,
  },
  containerMobileLandscape: {
    borderRadius: 6,
    minWidth: 240,
    maxWidth: 280,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    left: 24, // Center triangle above the effects button
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
  triangleMobile: {
    top: -6,
    left: 175,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
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
  closeButtonMobile: {
    top: 4,
    right: 8,
    width: 20,
    height: 20,
  },
  closeButtonText: {
    fontSize: 20,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  closeButtonTextMobile: {
    fontSize: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingTop: 12,
  },
  tabsContainerMobile: {
    paddingTop: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabMobile: {
    paddingHorizontal: 8,
    paddingVertical: 8,
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
  tabTextMobile: {
    fontSize: 10,
    fontWeight: '600',
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    minHeight: 120,
  },
  contentMobile: {
    padding: 8,
    minHeight: 80,
  },
  contentScroll: {
    flexDirection: 'row',
  },
  contentScrollMobile: {
    // Mobile specific scroll styles if needed
  },
  effectCard: {
    width: 80,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
  },
  effectCardMobile: {
    width: 50,
    height: 50,
    marginRight: 8,
    borderRadius: 6,
  },
  webCard: {
    width: 120,
    height: 80,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: Colors.surfaceDark,
    overflow: 'hidden',
  },
  webCardMobile: {
    width: 80,
    height: 50,
    marginRight: 8,
    borderRadius: 6,
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
  onAirBadgeMobile: {
    top: 2,
    left: 2,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  onAirText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  onAirTextMobile: {
    fontSize: 6,
  },
  effectNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  effectNumberMobile: {
    fontSize: 20,
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
  webTitleMobile: {
    fontSize: 7,
    marginBottom: 1,
  },
  webSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  webSubtitleMobile: {
    fontSize: 7,
  },
  webIcon: {
    position: 'absolute',
    bottom: 4,
    left: 4,
  },
  webContent: {
    gap: 16,
  },
  webContentMobile: {
    gap: 8,
  },
  webUrlSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  webUrlSectionMobile: {
    gap: 6,
  },
  urlInputContainer: {
    flex: 1,
    backgroundColor: Colors.surfaceDark,
    borderRadius: 8,
    padding: 12,
  },
  urlInputContainerMobile: {
    borderRadius: 6,
    padding: 6,
  },
  urlSection: {
    marginBottom: 12,
  },
  urlSectionMobile: {
    marginBottom: 6,
  },
  urlLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  urlLabelMobile: {
    fontSize: 8,
    marginBottom: 2,
  },
  urlInput: {
    backgroundColor: 'transparent',
    color: Colors.primary,
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  urlInputMobile: {
    fontSize: 10,
    paddingVertical: 2,
  },
  titleSection: {},
  titleSectionMobile: {},
  titleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  titleLabelMobile: {
    fontSize: 8,
    marginBottom: 2,
  },
  titleInput: {
    backgroundColor: 'transparent',
    color: Colors.primary,
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },
  titleInputMobile: {
    fontSize: 10,
    paddingVertical: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonMobile: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  chronometerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 80,
  },
  chronometerContentMobile: {
    minHeight: 50,
  },
  comingSoon: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  comingSoonMobile: {
    fontSize: 12,
  },
});

export default EffectsModal;