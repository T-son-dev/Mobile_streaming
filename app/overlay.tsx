import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  OverlayTypeCard,
  OverlayPreview,
  OverlayListItem,
  PositionControl,
  TextStyleEditor,
} from '@/components/ui/OverlayComponents';
import { Overlay, OverlayType, TextOverlay } from '@/types/overlay';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useResponsive } from '@/hooks/useResponsive';
import { CropIcon } from '@/components/icons';

const OverlayScreen: React.FC = () => {
  const responsive = useResponsive();
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [selectedOverlayId, setSelectedOverlayId] = useState<string | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [editingOverlay, setEditingOverlay] = useState<Overlay | null>(null);

  const selectedOverlay = overlays.find(o => o.id === selectedOverlayId);
  const styles = createResponsiveStyles(responsive);

  const createOverlay = (type: OverlayType) => {
    const newOverlay: Overlay = {
      id: Date.now().toString(),
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Overlay`,
      enabled: true,
      position: { x: 10, y: 10 },
      size: { width: 200, height: 100 },
      zIndex: overlays.length,
      ...(type === 'text' && {
        content: 'Sample Text',
        style: {
          color: '#FFFFFF',
          fontSize: responsive.typography.body,
          fontFamily: 'System',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          padding: responsive.spacing.xs,
        },
      }),
      ...(type === 'image' && {
        url: '',
        opacity: 1,
      }),
      ...(type === 'web' && {
        url: '',
        refreshInterval: 60,
      }),
      ...(type === 'video' && {
        url: '',
        loop: true,
        muted: true,
      }),
    } as Overlay;

    setOverlays([...overlays, newOverlay]);
    setSelectedOverlayId(newOverlay.id);
    setEditingOverlay(newOverlay);
    setShowTypeSelector(false);
  };

  const updateOverlay = (id: string, updates: Partial<Overlay>) => {
    setOverlays(overlays.map(o => o.id === id ? { ...o, ...updates } : o));
    if (editingOverlay && editingOverlay.id === id) {
      setEditingOverlay({ ...editingOverlay, ...updates });
    }
  };

  const deleteOverlay = (id: string) => {
    Alert.alert(
      'Delete Overlay',
      'Are you sure you want to delete this overlay?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setOverlays(overlays.filter(o => o.id !== id));
            if (selectedOverlayId === id) {
              setSelectedOverlayId(null);
            }
            if (editingOverlay?.id === id) {
              setEditingOverlay(null);
            }
          },
        },
      ]
    );
  };

  const toggleOverlay = (id: string) => {
    updateOverlay(id, { enabled: !overlays.find(o => o.id === id)?.enabled });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconContainer}>
            <CropIcon />
          </View>
          <Text style={styles.title}>Overlay Manager</Text>
        </View>

        <OverlayPreview
          overlays={overlays}
          selectedId={selectedOverlayId}
          onSelectOverlay={(id) => {
            setSelectedOverlayId(id);
            setEditingOverlay(overlays.find(o => o.id === id) || null);
          }}
          responsive={responsive}
        />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Overlays</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowTypeSelector(true)}
            >
              <IconSymbol name="plus" size={responsive.layout.iconSize.small} color={Colors.dark.background} />
              <Text style={styles.addButtonText}>Add Overlay</Text>
            </TouchableOpacity>
          </View>

          {overlays.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No overlays yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap "Add Overlay" to create your first overlay
              </Text>
            </View>
          ) : (
            overlays.map((overlay) => (
              <OverlayListItem
                key={overlay.id}
                overlay={overlay}
                selected={overlay.id === selectedOverlayId}
                onPress={() => {
                  setSelectedOverlayId(overlay.id);
                  setEditingOverlay(overlay);
                }}
                onToggle={() => toggleOverlay(overlay.id)}
                onDelete={() => deleteOverlay(overlay.id)}
                responsive={responsive}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Type Selector Modal */}
      <Modal
        visible={showTypeSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTypeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.typeModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Overlay Type</Text>
              <TouchableOpacity onPress={() => setShowTypeSelector(false)} style={styles.closeButtonContainer}>
                <IconSymbol name="xmark" size={responsive.layout.iconSize.medium} color={Colors.dark.tabIconDefault} />
              </TouchableOpacity>
            </View>
            <View style={styles.typeGrid}>
              <OverlayTypeCard
                type="text"
                iconName="text.alignleft"
                title="Text"
                description="Add custom text with styling"
                onPress={() => createOverlay('text')}
                responsive={responsive}
              />
              <OverlayTypeCard
                type="image"
                iconName="photo.fill"
                title="Image"
                description="Display images from URL"
                onPress={() => createOverlay('image')}
                responsive={responsive}
              />
              <OverlayTypeCard
                type="web"
                iconName="globe"
                title="Web"
                description="Embed web content"
                onPress={() => createOverlay('web')}
                responsive={responsive}
              />
              <OverlayTypeCard
                type="video"
                iconName="play.rectangle.fill"
                title="Video"
                description="Play video files"
                onPress={() => createOverlay('video')}
                responsive={responsive}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Overlay Editor Modal */}
      <Modal
        visible={!!editingOverlay}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingOverlay(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.editorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Edit {editingOverlay?.type.charAt(0).toUpperCase()}{editingOverlay?.type.slice(1)} Overlay
              </Text>
              <TouchableOpacity onPress={() => setEditingOverlay(null)} style={styles.closeButtonContainer}>
                <IconSymbol name="xmark" size={responsive.layout.iconSize.medium} color={Colors.dark.tabIconDefault} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.editorContent}>
              {editingOverlay && (
                <>
                  <View style={styles.editorSection}>
                    <Text style={styles.inputLabel}>Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={editingOverlay.name}
                      onChangeText={(name) => updateOverlay(editingOverlay.id, { name })}
                      placeholder="Overlay name"
                      placeholderTextColor={Colors.dark.tabIconDefault}
                    />
                  </View>

                  <PositionControl
                    position={editingOverlay.position}
                    size={editingOverlay.size}
                    onPositionChange={(position) =>
                      updateOverlay(editingOverlay.id, { position })
                    }
                    onSizeChange={(size) =>
                      updateOverlay(editingOverlay.id, { size })
                    }
                    responsive={responsive}
                  />

                  {editingOverlay.type === 'text' && (
                    <TextStyleEditor
                      style={(editingOverlay as TextOverlay).style}
                      content={(editingOverlay as TextOverlay).content}
                      onStyleChange={(style) =>
                        updateOverlay(editingOverlay.id, { style })
                      }
                      onContentChange={(content) =>
                        updateOverlay(editingOverlay.id, { content })
                      }
                      responsive={responsive}
                    />
                  )}

                  {(editingOverlay.type === 'image' ||
                    editingOverlay.type === 'web' ||
                    editingOverlay.type === 'video') && (
                    <View style={styles.editorSection}>
                      <Text style={styles.inputLabel}>URL</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editingOverlay.url}
                        onChangeText={(url) => updateOverlay(editingOverlay.id, { url })}
                        placeholder="https://example.com/..."
                        placeholderTextColor={Colors.dark.tabIconDefault}
                        keyboardType="url"
                      />
                    </View>
                  )}

                  {editingOverlay.type === 'image' && (
                    <View style={styles.editorSection}>
                      <Text style={styles.inputLabel}>Opacity</Text>
                      <TextInput
                        style={styles.textInput}
                        value={String(editingOverlay.opacity || 1)}
                        onChangeText={(text) => {
                          const opacity = parseFloat(text) || 1;
                          updateOverlay(editingOverlay.id, {
                            opacity: Math.min(1, Math.max(0, opacity)),
                          });
                        }}
                        keyboardType="numeric"
                        placeholder="1.0"
                        placeholderTextColor={Colors.dark.tabIconDefault}
                      />
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const createResponsiveStyles = (responsive: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: responsive.layout.containerPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsive.spacing.xl,
  },
  headerIconContainer: {
    width: responsive.layout.iconSize.extraLarge,
    height: responsive.layout.iconSize.extraLarge,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: responsive.spacing.md,
    backgroundColor: Colors.dark.surface,
    borderRadius: responsive.layout.iconSize.extraLarge / 2,
  },
  title: {
    fontSize: responsive.typography.display,
    fontWeight: 'bold',
    color: Colors.dark.text,
    flex: 1,
  },
  section: {
    marginTop: responsive.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.spacing.md,
  },
  sectionTitle: {
    fontSize: responsive.typography.heading,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.tint,
    paddingHorizontal: responsive.spacing.md,
    paddingVertical: responsive.spacing.sm,
    borderRadius: 20,
    gap: responsive.spacing.xs,
  },
  addButtonText: {
    color: Colors.dark.background,
    fontSize: responsive.typography.caption,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: responsive.spacing.xxl,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
  },
  emptyStateText: {
    color: Colors.dark.text,
    fontSize: responsive.typography.subheading,
    marginBottom: responsive.spacing.xs,
  },
  emptyStateSubtext: {
    color: Colors.dark.tabIconDefault,
    fontSize: responsive.typography.caption,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  typeModal: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: responsive.layout.containerPadding,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsive.spacing.lg,
  },
  modalTitle: {
    color: Colors.dark.text,
    fontSize: responsive.typography.heading,
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    padding: responsive.spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: responsive.spacing.sm,
  },
  editorModal: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '80%',
    maxHeight: '90%',
  },
  editorContent: {
    padding: responsive.layout.containerPadding,
  },
  editorSection: {
    marginBottom: responsive.spacing.xl,
  },
  inputLabel: {
    color: Colors.dark.text,
    fontSize: responsive.typography.body,
    marginBottom: responsive.spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.dark.surface,
    color: Colors.dark.text,
    padding: responsive.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: responsive.typography.body,
    minHeight: responsive.layout.buttonHeight,
  },
});

export default OverlayScreen;