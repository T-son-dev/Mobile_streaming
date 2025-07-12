import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface CameraControlsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.3)',
  surface: 'rgba(255, 255, 255, 0.95)',
  text: '#1f2937',
  textSecondary: '#6b7280',
  primary: '#84cc16', // lime-500 (bright green like in image)
  border: '#e5e7eb',
  iconBg: '#000000',
};

const CameraControls: React.FC<CameraControlsProps> = ({ isOpen, onClose }) => {
  const [isAutoFocus, setIsAutoFocus] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1.0);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 3.0));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
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
        
        <View style={styles.content}>
          {/* Auto Focus Section */}
          <View style={styles.focusSection}>
            <Text style={styles.focusLabel}>Auto Focus</Text>
            <Switch
              value={isAutoFocus}
              onValueChange={setIsAutoFocus}
              trackColor={{ false: '#d1d5db', true: Colors.primary }}
              thumbColor={isAutoFocus ? '#ffffff' : '#f3f4f6'}
              style={styles.switch}
            />
          </View>
          
          {/* Controls Row */}
          <View style={styles.controlsRow}>
            {/* Zoom Level Display */}
            <View style={styles.zoomContainer}>
              <TouchableOpacity onPress={handleZoomOut} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>-</Text>
              </TouchableOpacity>
              
              <View style={styles.zoomDisplay}>
                <Text style={styles.zoomText}>{zoomLevel.toFixed(1)}x</Text>
              </View>
              
              <TouchableOpacity onPress={handleZoomIn} style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            {/* Icon Buttons */}
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.iconCircle}>
                <IconSymbol name="person.fill" size={20} color="white" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.iconButton}>
              <View style={styles.iconCircle}>
                <IconSymbol name="iphone" size={20} color="white" />
              </View>
            </TouchableOpacity>
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
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    top: 90, // Adjust based on your camera button position
    right: 16, // Position it on the left side for camera controls
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    minWidth: 280,
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
    left: 30, // Position it above where the camera button would be
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
  content: {
    paddingTop: 8,
  },
  focusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  focusLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  zoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  zoomButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  zoomDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  zoomText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  iconButton: {
    marginLeft: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.iconBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CameraControls;