import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface QuickAccessMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onProModeClick: () => void;
}

const Colors = {
  overlay: 'rgba(0, 0, 0, 0.5)',
  surface: '#ffffff',
  text: '#1f2937', // gray-800
  textSecondary: '#6b7280', // gray-500
  primary: '#22c55e', // green-500
  border: '#e5e7eb', // gray-200
};

const QuickAccessMenu: React.FC<QuickAccessMenuProps> = ({ isOpen, onClose, onProModeClick }) => {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
          
          <View style={styles.menuGrid}>
            {/* Top Row */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Text style={styles.menuIconText}>#</Text>
              </View>
              <Text style={styles.menuLabel}>Grade</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <IconSymbol name="flashlight.on.fill" size={20} color={Colors.text} />
              </View>
              <Text style={styles.menuLabel}>Lanterna</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onProModeClick}>
              <View style={[styles.menuIcon, styles.proIcon]}>
                <Text style={styles.proText}>PRO</Text>
              </View>
              <Text style={styles.menuLabel}>Modo PRO</Text>
            </TouchableOpacity>

            {/* Bottom Row */}
            <TouchableOpacity style={styles.menuItem}>
              <View style={[styles.menuIcon, styles.screenIcon]}>
                <View style={styles.screenRect} />
              </View>
              <Text style={styles.menuLabel}>Tela Início</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <IconSymbol name="mic.slash.fill" size={20} color={Colors.text} />
              </View>
              <Text style={styles.menuLabel}>Mutar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <IconSymbol name="gearshape.fill" size={20} color={Colors.text} />
              </View>
              <Text style={styles.menuLabel}>Configurações</Text>
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
    padding: 20,
    marginHorizontal: 40,
    minWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  menuItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
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
  menuIconText: {
    fontSize: 20,
    color: Colors.text,
    fontWeight: 'bold',
  },
  proIcon: {
    backgroundColor: '#1f2937', // gray-800
  },
  proText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
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
  menuLabel: {
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default QuickAccessMenu;