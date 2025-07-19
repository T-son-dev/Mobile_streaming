import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Overlay, TextOverlay, ImageOverlay } from '@/types/overlay';
import OverlayRenderer from './OverlayRenderer';
import { overlayService } from '@/services/OverlayService';
import { assetManager } from '@/services/AssetManager';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface UniversalOverlayManagerProps {
  visible: boolean;
  onClose: () => void;
  containerSize?: { width: number; height: number };
}

const UniversalOverlayManager: React.FC<UniversalOverlayManagerProps> = ({
  visible,
  onClose,
  containerSize,
}) => {
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [editingOverlayId, setEditingOverlayId] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  
  const screenDimensions = containerSize || Dimensions.get('window');

  useEffect(() => {
    if (visible) {
      // Initialize service and load overlays when modal becomes visible
      const initializeService = async () => {
        await overlayService.initialize();
        setOverlays(overlayService.getAllOverlays());
      };
      initializeService();
    }

    // Subscribe to overlay events
    const handleOverlayChange = () => {
      setOverlays(overlayService.getAllOverlays());
    };

    overlayService.on('overlayCreated', handleOverlayChange);
    overlayService.on('overlayUpdated', handleOverlayChange);
    overlayService.on('overlayDeleted', handleOverlayChange);
    overlayService.on('overlaysCleared', handleOverlayChange);
    overlayService.on('overlaysUpdated', handleOverlayChange);

    return () => {
      overlayService.off('overlayCreated', handleOverlayChange);
      overlayService.off('overlayUpdated', handleOverlayChange);
      overlayService.off('overlayDeleted', handleOverlayChange);
      overlayService.off('overlaysCleared', handleOverlayChange);
      overlayService.off('overlaysUpdated', handleOverlayChange);
    };
  }, [visible]);

  const handleCreateText = useCallback(() => {
    const newOverlay = overlayService.createOverlay({
      type: 'text',
      name: 'New Text Overlay',
      enabled: true,
      position: { x: 20, y: 20 },
      size: { width: 200, height: 50 },
      zIndex: overlays.length,
      content: 'New Text',
      style: {
        color: '#FFFFFF',
        fontSize: 24,
        fontFamily: 'System',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 8,
      },
    } as TextOverlay);
    setSelectedOverlayId(newOverlay.id);
    setShowTypeSelector(false);
  }, [overlays.length]);

  const handleCreateImage = useCallback(async () => {
    try {
      const asset = await assetManager.selectImageFromLibrary();
      if (!asset) {
        setShowTypeSelector(false);
        return;
      }

      const newOverlay = overlayService.createOverlay({
        type: 'image',
        name: asset.name || 'Image Overlay',
        enabled: true,
        position: { x: 20, y: 20 },
        size: { width: 200, height: 150 },
        zIndex: overlays.length,
        url: asset.uri,
        opacity: 1,
      } as ImageOverlay);
      setSelectedOverlayId(newOverlay.id);
      setShowTypeSelector(false);
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image');
      setShowTypeSelector(false);
    }
  }, [overlays.length]);

  const handleDeleteOverlay = useCallback((id: string) => {
    Alert.alert(
      'Delete Overlay',
      'Are you sure you want to delete this overlay?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            overlayService.deleteOverlay(id);
            if (selectedOverlayId === id) {
              setSelectedOverlayId(null);
            }
          },
        },
      ]
    );
  }, [selectedOverlayId]);

  const handleToggleOverlay = useCallback((id: string) => {
    overlayService.toggleOverlay(id);
  }, []);

  const handleToggleAll = useCallback(() => {
    const hasEnabled = overlays.some(o => o.enabled);
    if (hasEnabled) {
      overlayService.disableAllOverlays();
    } else {
      overlayService.enableAllOverlays();
    }
  }, [overlays]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear All Overlays',
      'Are you sure you want to remove all overlays?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            overlayService.clearAllOverlays();
            setSelectedOverlayId(null);
            setEditingOverlayId(null);
          },
        },
      ]
    );
  }, []);


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Overlay Manager</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>

        {/* Preview Area */}
        <View style={styles.previewContainer}>
          <View style={styles.preview}>
            <OverlayRenderer
              containerWidth={screenDimensions.width * 0.8}
              containerHeight={screenDimensions.height * 0.4}
              onOverlaySelect={setSelectedOverlayId}
              selectedOverlayId={selectedOverlayId}
              editingOverlayId={editingOverlayId}
              onEditingChange={setEditingOverlayId}
            />
          </View>
        </View>

        {/* Overlay List */}
        <View style={styles.overlayList}>
          <Text style={styles.sectionTitle}>Overlays ({overlays.length})</Text>
          <ScrollView style={styles.overlayScroll}>
            {overlays.map((overlay) => (
              <View 
                key={overlay.id} 
                style={[
                  styles.overlayItem,
                  overlay.id === selectedOverlayId && styles.selectedOverlayItem
                ]}
              >
                <TouchableOpacity
                  style={styles.overlayInfo}
                  onPress={() => setSelectedOverlayId(overlay.id)}
                >
                  <View style={styles.overlayTypeIcon}>
                    <IconSymbol 
                      name={overlay.type === 'text' ? 'text.alignleft' : 'photo.fill'} 
                      size={16} 
                      color={overlay.enabled ? Colors.dark.tint : Colors.dark.tabIconDefault} 
                    />
                  </View>
                  <View style={styles.overlayDetails}>
                    <Text style={styles.overlayName}>{overlay.name}</Text>
                    <Text style={styles.overlayPosition}>
                      {overlay.position.x.toFixed(0)}%, {overlay.position.y.toFixed(0)}% • Z:{overlay.zIndex}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.overlayActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, overlay.enabled && styles.activeButton]}
                    onPress={() => handleToggleOverlay(overlay.id)}
                  >
                    <IconSymbol 
                      name={overlay.enabled ? 'circle' : 'circle'} 
                      size={16} 
                      color={overlay.enabled ? Colors.dark.tint : Colors.dark.tabIconDefault} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteOverlay(overlay.id)}
                  >
                    <IconSymbol name="trash" size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
            <TouchableOpacity 
              style={styles.toolButton} 
              onPress={() => setShowTypeSelector(true)}
            >
              <IconSymbol name="circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.toolButtonText}>Add</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.toolButton} onPress={handleToggleAll}>
              <IconSymbol name="circle" size={24} color={Colors.dark.tint} />
              <Text style={styles.toolButtonText}>Toggle All</Text>
            </TouchableOpacity>
            
            {overlays.length > 0 && (
              <TouchableOpacity style={styles.toolButton} onPress={handleClearAll}>
                <IconSymbol name="xmark" size={24} color="#ff4444" />
                <Text style={[styles.toolButtonText, { color: '#ff4444' }]}>Clear All</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          {/* Quick Stats */}
          <View style={styles.stats}>
            <Text style={styles.statsText}>
              {overlays.filter(o => o.enabled).length} active • 
              {overlays.filter(o => o.type === 'text').length} text • 
              {overlays.filter(o => o.type === 'image').length} image
            </Text>
          </View>
        </View>

        {/* Type Selector Modal */}
        <Modal
          visible={showTypeSelector}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowTypeSelector(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.typeSelectorModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Overlay</Text>
                <TouchableOpacity onPress={() => setShowTypeSelector(false)}>
                  <IconSymbol name="xmark" size={20} color={Colors.dark.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.typeGrid}>
                <TouchableOpacity style={styles.typeCard} onPress={handleCreateText}>
                  <IconSymbol name="text.alignleft" size={32} color={Colors.dark.tint} />
                  <Text style={styles.typeTitle}>Text</Text>
                  <Text style={styles.typeDescription}>Add custom text with styling</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.typeCard} onPress={handleCreateImage}>
                  <IconSymbol name="photo.fill" size={32} color={Colors.dark.tint} />
                  <Text style={styles.typeTitle}>Image</Text>
                  <Text style={styles.typeDescription}>Select image from gallery</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1e293b',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 8,
  },
  previewContainer: {
    height: 200,
    margin: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    overflow: 'hidden',
  },
  preview: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlayList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  overlayScroll: {
    maxHeight: 200,
  },
  overlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 8,
    marginBottom: 8,
    padding: 12,
  },
  selectedOverlayItem: {
    borderWidth: 2,
    borderColor: Colors.dark.tint,
  },
  overlayInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlayTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  overlayDetails: {
    flex: 1,
  },
  overlayName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  overlayPosition: {
    color: Colors.dark.tabIconDefault,
    fontSize: 12,
    marginTop: 2,
  },
  overlayActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: Colors.dark.tint + '20',
  },
  controls: {
    backgroundColor: '#1e293b',
    paddingVertical: 20,
  },
  toolbar: {
    paddingHorizontal: 20,
    maxHeight: 80,
  },
  toolButton: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
  },
  toolButtonText: {
    color: Colors.dark.text,
    fontSize: 12,
    marginTop: 4,
  },
  stats: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  statsText: {
    color: Colors.dark.tabIconDefault,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelectorModal: {
    backgroundColor: Colors.dark.background,
    borderRadius: 20,
    padding: 20,
    width: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark.text,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e293b',
    borderRadius: 12,
  },
  typeTitle: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  typeDescription: {
    color: Colors.dark.tabIconDefault,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default UniversalOverlayManager;