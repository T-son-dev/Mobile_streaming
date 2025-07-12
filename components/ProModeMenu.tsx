import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ProModeMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.5)',
  surface: '#ffffff',
  text: '#1f2937', // gray-800
  textSecondary: '#6b7280', // gray-500
  primary: '#22c55e', // green-500
  border: '#e5e7eb', // gray-200
};

const ProModeMenu: React.FC<ProModeMenuProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>PRO Mode</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.content}>
            <View style={styles.controlsGrid}>
              {/* Camera Controls */}
              <View style={styles.controlGroup}>
                <Text style={styles.controlGroupTitle}>Camera</Text>
                
                <TouchableOpacity style={styles.controlItem}>
                  <View style={styles.controlIcon}>
                    <IconSymbol name="camera.rotate" size={20} color={Colors.text} />
                  </View>
                  <Text style={styles.controlLabel}>Rotation</Text>
                  <Text style={styles.controlValue}>0.3m</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlItem}>
                  <View style={styles.controlIcon}>
                    <IconSymbol name="plus.magnifyingglass" size={20} color={Colors.text} />
                  </View>
                  <Text style={styles.controlLabel}>Zoom</Text>
                  <Text style={styles.controlValue}>1x</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlItem}>
                  <Text style={styles.controlLabelSmall}>ISO</Text>
                  <Text style={styles.controlValue}>622</Text>
                </TouchableOpacity>
              </View>
              
              {/* Exposure Controls */}
              <View style={styles.controlGroup}>
                <Text style={styles.controlGroupTitle}>Exposure</Text>
                
                <TouchableOpacity style={styles.controlItem}>
                  <View style={styles.controlIcon}>
                    <IconSymbol name="circle" size={20} color={Colors.text} />
                  </View>
                  <Text style={styles.controlLabel}>Aperture</Text>
                  <Text style={styles.controlValue}>f/2.8</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlItem}>
                  <View style={styles.controlIcon}>
                    <IconSymbol name="bolt" size={20} color={Colors.text} />
                  </View>
                  <Text style={styles.controlLabel}>Shutter</Text>
                  <Text style={styles.controlValue}>1/125</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlItem}>
                  <Text style={styles.controlLabelSmall}>WB</Text>
                  <Text style={styles.controlValue}>AWB</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <TouchableOpacity style={styles.resetButton}>
              <IconSymbol name="arrow.clockwise" size={20} color={Colors.text} />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    minWidth: 320,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  controlGroup: {
    flex: 1,
    marginHorizontal: 10,
  },
  controlGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  controlItem: {
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
  },
  controlIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6', // gray-100
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  controlLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  controlLabelSmall: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  controlValue: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f3f4f6', // gray-100
    borderRadius: 8,
    gap: 8,
  },
  resetButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
});

export default ProModeMenu;