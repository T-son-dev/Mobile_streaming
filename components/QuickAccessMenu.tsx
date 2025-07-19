import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useResponsive } from '../utils/responsive';
import { useRouter } from 'expo-router';

interface QuickAccessMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onProModeClick: () => void;
  onHomeClick?: () => void;
  onSettingsClick?: () => void;
  onOverlayClick?: () => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.5)',
  surface: '#ffffff',
  text: '#1f2937', // gray-800
  textSecondary: '#6b7280', // gray-500
  primary: '#22c55e', // green-500
  border: '#e5e7eb', // gray-200
};

const QuickAccessMenu: React.FC<QuickAccessMenuProps> = ({ 
  isOpen, 
  onClose, 
  onProModeClick,
  onHomeClick,
  onSettingsClick,
  onOverlayClick
}) => {
  const responsive = useResponsive();
  const isNativeMobile = responsive.isNativeMobile;
  const isLandscape = responsive.orientation === 'landscape';
  const router = useRouter();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      router.push('/');
    }
    onClose();
  };

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick();
    } else {
      router.push('/settings');
    }
    onClose();
  };

  if (!isOpen) return null;

  // Dynamic positioning based on responsive layout to position below Menu button
  const getModalPosition = () => {
    const headerHeight = responsive.headerHeight || 48;
    const gap = 4; // Small gap between button and modal
    const screenWidth = responsive.screenWidth || 375;
    const rightPadding = 16; // Standard right padding
    
    if (isNativeMobile && isLandscape) {
      // For mobile landscape - position under menu button (last button in headerRight)
      const modalWidth = 200; // Mobile landscape modal width
      
      return {
        top: headerHeight + gap,
        right: rightPadding,
        width: modalWidth,
      };
    } else if (isNativeMobile) {
      // For mobile portrait
      const modalWidth = 240; // Mobile portrait modal width
      
      return {
        top: headerHeight + gap,
        right: rightPadding,
        width: modalWidth,
      };
    } else {
      // For desktop
      const modalWidth = 300; // Desktop modal width
      
      return {
        top: headerHeight + gap,
        right: rightPadding,
        width: modalWidth,
      };
    }
  };

  const modalPosition = getModalPosition();

  return (
    <>
      {/* Overlay to close menu when clicking outside */}
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
          right: modalPosition.right,
          width: modalPosition.width,
        }
      ]}>
        {/* Triangle pointer */}
        <View style={[
          styles.triangle,
          isNativeMobile && styles.triangleMobile
        ]} />
        
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
          styles.menuGrid,
          isNativeMobile && styles.menuGridMobile,
          isNativeMobile && isLandscape && styles.menuGridMobileLandscape
        ]}>
          {/* Top Row */}
          <TouchableOpacity style={[
            styles.menuItem,
            isNativeMobile && styles.menuItemMobile
          ]}>
            <View style={[
              styles.menuIcon,
              isNativeMobile && styles.menuIconMobile
            ]}>
              <Text style={[
                styles.menuIconText,
                isNativeMobile && styles.menuIconTextMobile
              ]}>#</Text>
            </View>
            <Text style={[
              styles.menuLabel,
              isNativeMobile && styles.menuLabelMobile
            ]}>Grid</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[
            styles.menuItem,
            isNativeMobile && styles.menuItemMobile
          ]}>
            <View style={[
              styles.menuIcon,
              isNativeMobile && styles.menuIconMobile
            ]}>
              <IconSymbol 
                name="flashlight.on.fill" 
                size={isNativeMobile ? 14 : 20} 
                color={Colors.text} 
              />
            </View>
            <Text style={[
              styles.menuLabel,
              isNativeMobile && styles.menuLabelMobile
            ]}>Flashlight</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.menuItem,
              isNativeMobile && styles.menuItemMobile
            ]} 
            onPress={onProModeClick}
          >
            <View style={[
              styles.menuIcon, 
              styles.proIcon,
              isNativeMobile && styles.menuIconMobile
            ]}>
              <Text style={[
                styles.proText,
                isNativeMobile && styles.proTextMobile
              ]}>PRO</Text>
            </View>
            <Text style={[
              styles.menuLabel,
              isNativeMobile && styles.menuLabelMobile
            ]}>PRO Mode</Text>
          </TouchableOpacity>

          {/* Bottom Row */}
          <TouchableOpacity 
            style={[
              styles.menuItem,
              isNativeMobile && styles.menuItemMobile
            ]}
            onPress={handleHomeClick}
          >
            <View style={[
              styles.menuIcon, 
              styles.screenIcon,
              isNativeMobile && styles.menuIconMobile
            ]}>
              <View style={[
                styles.screenRect,
                isNativeMobile && styles.screenRectMobile
              ]} />
            </View>
            <Text style={[
              styles.menuLabel,
              isNativeMobile && styles.menuLabelMobile
            ]}>Home Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.menuItem,
              isNativeMobile && styles.menuItemMobile
            ]}
            onPress={() => {
              if (onOverlayClick) {
                onOverlayClick();
              }
              onClose();
            }}
          >
            <View style={[
              styles.menuIcon,
              isNativeMobile && styles.menuIconMobile
            ]}>
              <IconSymbol 
                name="text.alignleft" 
                size={isNativeMobile ? 14 : 20} 
                color={Colors.text} 
              />
            </View>
            <Text style={[
              styles.menuLabel,
              isNativeMobile && styles.menuLabelMobile
            ]}>Overlays</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.menuItem,
              isNativeMobile && styles.menuItemMobile
            ]}
            onPress={handleSettingsClick}
          >
            <View style={[
              styles.menuIcon,
              isNativeMobile && styles.menuIconMobile
            ]}>
              <IconSymbol 
                name="gearshape.fill" 
                size={isNativeMobile ? 14 : 20} 
                color={Colors.text} 
              />
            </View>
            <Text style={[
              styles.menuLabel,
              isNativeMobile && styles.menuLabelMobile
            ]}>Settings</Text>
          </TouchableOpacity>
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
    padding: 20,
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
    padding: 12,
    shadowRadius: 4,
  },
  containerMobileLandscape: {
    borderRadius: 6,
    padding: 8,
  },
  triangle: {
    position: 'absolute',
    top: -8,
    right: 20, // Position it above the menu button area
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
    right: 4,
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  menuGridMobile: {
    paddingTop: 12,
  },
  menuGridMobileLandscape: {
    paddingTop: 8,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuItemMobile: {
    marginBottom: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6', // gray-100
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuIconMobile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  menuIconText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
  },
  menuIconTextMobile: {
    fontSize: 14,
  },
  proIcon: {
    backgroundColor: '#1f2937', // gray-800
  },
  proText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  proTextMobile: {
    fontSize: 8,
  },
  screenIcon: {
    backgroundColor: '#3b82f6', // blue-500
  },
  screenRect: {
    width: 24,
    height: 16,
    backgroundColor: Colors.surface,
    borderRadius: 2,
  },
  screenRectMobile: {
    width: 16,
    height: 10,
    borderRadius: 1,
  },
  menuLabel: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  menuLabelMobile: {
    fontSize: 8,
    lineHeight: 10,
  },
});

export default QuickAccessMenu;