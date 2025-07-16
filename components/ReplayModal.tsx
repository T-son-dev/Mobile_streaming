import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '../utils/responsive';

interface ReplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReplaySettingsChange: (enabled: boolean, seconds: number) => void;
  onLastMovePress: () => void;
  onBestMomentsPress: () => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.2)', // Reduced opacity to be less intrusive
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#22c55e', // green-500
  accent: '#84cc16', // lime-500
  border: '#e5e7eb',
};

const ReplayModal: React.FC<ReplayModalProps> = ({ 
  isOpen, 
  onClose, 
  onReplaySettingsChange,
  onLastMovePress,
  onBestMomentsPress 
}) => {
  const [isReplayEnabled, setIsReplayEnabled] = useState(false);
  const [selectedSeconds, setSelectedSeconds] = useState(8);
  const responsive = useResponsive();
  const isNativeMobile = responsive.isNativeMobile;
  const isLandscape = responsive.orientation === 'landscape';

  if (!isOpen) return null;

  // Dynamic positioning based on responsive layout to position below Replay button
  const getModalPosition = () => {
    const headerHeight = responsive.headerHeight || 48;
    const gap = 4; // Small gap between button and modal
    const screenWidth = responsive.screenWidth || 375;
    
    // Calculate position based on header layout:
    // Header has headerLeft (flex: 1) and headerRight (flex: 1) 
    // Replay button is first in headerRight section
    // Need to position relative to where that button would be
    
    if (isNativeMobile && isLandscape) {
      // For mobile landscape
      const headerPadding = responsive.safeAreaHorizontal || 8;
      const rightSectionStart = screenWidth / 2; 
      const buttonSize = 32; // Mobile landscape button size
      const modalWidth = 120; // Mobile landscape modal width
      
      // First button in headerRight section
      const firstButtonLeft = rightSectionStart + headerPadding;
      const firstButtonCenter = firstButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: firstButtonCenter - (modalWidth / 2), // Center modal under button
      };
    } else if (isNativeMobile) {
      // For mobile portrait
      const headerPadding = responsive.safeAreaHorizontal || 8;
      const rightSectionStart = screenWidth / 2;
      const buttonSize = 28; // Mobile portrait button size
      const modalWidth = 140; // Mobile portrait modal width
      
      const firstButtonLeft = rightSectionStart + headerPadding;
      const firstButtonCenter = firstButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: firstButtonCenter - (modalWidth / 2),
      };
    } else {
      // For desktop
      const headerPadding = 16;
      const rightSectionStart = screenWidth / 2;
      const buttonSize = 48; // Desktop button size
      const modalWidth = 170; // Desktop modal width
      
      const firstButtonLeft = rightSectionStart + headerPadding;
      const firstButtonCenter = firstButtonLeft + (buttonSize / 2);
      
      return {
        top: headerHeight + gap,
        left: firstButtonCenter - (modalWidth / 2),
      };
    }
  };

  const modalPosition = getModalPosition();

  const handleReplayToggle = (value: boolean) => {
    setIsReplayEnabled(value);
    onReplaySettingsChange(value, selectedSeconds);
  };

  const handleSecondsChange = (seconds: number) => {
    setSelectedSeconds(seconds);
    if (isReplayEnabled) {
      onReplaySettingsChange(isReplayEnabled, seconds);
    }
  };

  const incrementSeconds = () => {
    if (selectedSeconds < 10) {
      handleSecondsChange(selectedSeconds + 1);
    }
  };

  const decrementSeconds = () => {
    if (selectedSeconds > 1) {
      handleSecondsChange(selectedSeconds - 1);
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
        
        <View style={[
          styles.content,
          isNativeMobile && styles.contentMobile
        ]}>
          {/* Main Row - Replay Toggle and Seconds Controller side by side */}
          <View style={[
            styles.mainRow,
            isNativeMobile && styles.mainRowMobile
          ]}>
            {/* Left Side - Replay Toggle */}
            <View style={[
              styles.replaySection,
              isNativeMobile && styles.replaySectionMobile
            ]}>
              <Text style={[
                styles.replayLabel,
                isNativeMobile && styles.replayLabelMobile
              ]}>Replay</Text>
              <Switch
                value={isReplayEnabled}
                onValueChange={handleReplayToggle}
                trackColor={{ false: '#d1d5db', true: Colors.primary }}
                thumbColor={isReplayEnabled ? '#ffffff' : '#f3f4f6'}
                style={[
                  styles.switch,
                  isNativeMobile && styles.switchMobile
                ]}
              />
            </View>
            
            {/* Right Side - Seconds Controller */}
            <View style={[
              styles.secondsSection,
              isNativeMobile && styles.secondsSectionMobile
            ]}>
              <Text style={[
                styles.secondsLabel,
                isNativeMobile && styles.secondsLabelMobile
              ]}>Segundos</Text>
              <View style={[
                styles.secondsController,
                isNativeMobile && styles.secondsControllerMobile
              ]}>
                <TouchableOpacity 
                  style={[
                    styles.secondsButton,
                    isNativeMobile && styles.secondsButtonMobile,
                    selectedSeconds <= 1 && styles.secondsButtonDisabled
                  ]}
                  onPress={decrementSeconds}
                  disabled={selectedSeconds <= 1}
                >
                  <Text style={[
                    styles.secondsButtonText,
                    isNativeMobile && styles.secondsButtonTextMobile,
                    selectedSeconds <= 1 && styles.secondsButtonTextDisabled
                  ]}>−</Text>
                </TouchableOpacity>
                
                <View style={[
                  styles.secondsDisplay,
                  isNativeMobile && styles.secondsDisplayMobile
                ]}>
                  <Text style={[
                    styles.secondsValue,
                    isNativeMobile && styles.secondsValueMobile
                  ]}>{selectedSeconds}</Text>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.secondsButton,
                    isNativeMobile && styles.secondsButtonMobile,
                    selectedSeconds >= 10 && styles.secondsButtonDisabled
                  ]}
                  onPress={incrementSeconds}
                  disabled={selectedSeconds >= 10}
                >
                  <Text style={[
                    styles.secondsButtonText,
                    isNativeMobile && styles.secondsButtonTextMobile,
                    selectedSeconds >= 10 && styles.secondsButtonTextDisabled
                  ]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
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
    zIndex: 1998, // Higher z-index to ensure it's above everything
  },
  container: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    borderRadius: 6,
    padding: 8,
    minWidth: 150,
    maxWidth: 170,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 1999,
  },
  containerMobile: {
    padding: 6,
    minWidth: 120,
    maxWidth: 140,
    borderRadius: 4,
    shadowRadius: 2,
  },
  containerMobileLandscape: {
    padding: 4,
    minWidth: 100,
    maxWidth: 120,
    borderRadius: 3,
  },
  triangle: {
    position: 'absolute',
    top: -6,
    left: '50%', // Center horizontally on modal
    marginLeft: -6, // Offset by half triangle width
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface,
    zIndex: 2000,
  },
  triangleMobile: {
    top: -4,
    marginLeft: -4, // Offset by half triangle width for mobile
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonMobile: {
    top: 2,
    right: 2,
    width: 16,
    height: 16,
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  closeButtonTextMobile: {
    fontSize: 12,
  },
  content: {
    paddingTop: 4,
  },
  contentMobile: {
    paddingTop: 2,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  mainRowMobile: {
    gap: 8, // Much smaller gap for mobile
  },
  replaySection: {
    flex: 1,
    alignItems: 'center',
  },
  replaySectionMobile: {
    flex: 1,
  },
  replayLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  replayLabelMobile: {
    fontSize: 9, // Much smaller for mobile
    marginBottom: 2,
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  switchMobile: {
    transform: [{ scaleX: 0.6 }, { scaleY: 0.6 }], // Much smaller for mobile
  },
  secondsSection: {
    flex: 1,
    alignItems: 'center',
  },
  secondsSectionMobile: {
    flex: 1,
  },
  secondsLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  secondsLabelMobile: {
    fontSize: 9, // Much smaller for mobile
    marginBottom: 2,
  },
  secondsController: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  secondsControllerMobile: {
    borderRadius: 10,
    paddingHorizontal: 1,
    paddingVertical: 1,
  },
  secondsButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondsButtonMobile: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  secondsButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondsButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondsButtonTextMobile: {
    fontSize: 10,
  },
  secondsButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  secondsDisplay: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  secondsDisplayMobile: {
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  secondsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  secondsValueMobile: {
    fontSize: 12,
  },
});

export default ReplayModal;