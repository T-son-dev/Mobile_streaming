import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MediaLibrary from './MediaLibrary';
import ImageUploader from './ImageUploader';
import StorageManager from './StorageManager';
import { MediaAsset, Category } from '../database/AssetDatabase';
import MediaStorageManager from '../services/MediaStorageManager';

const { width: screenWidth } = Dimensions.get('window');

interface AssetBrowserProps {
  visible: boolean;
  onClose: () => void;
  onAssetSelect?: (asset: MediaAsset) => void;
  onMultipleAssetsSelect?: (assets: MediaAsset[]) => void;
  selectionMode?: 'single' | 'multiple';
  initialCategory?: string;
  showUploadButton?: boolean;
  showStorageManager?: boolean;
  title?: string;
}

type BrowserTab = 'browse' | 'upload' | 'storage' | 'organize';

export default function AssetBrowser({
  visible,
  onClose,
  onAssetSelect,
  onMultipleAssetsSelect,
  selectionMode = 'single',
  initialCategory,
  showUploadButton = true,
  showStorageManager = true,
  title = 'Asset Browser'
}: AssetBrowserProps) {
  const [activeTab, setActiveTab] = useState<BrowserTab>('browse');
  const [selectedAssets, setSelectedAssets] = useState<MediaAsset[]>([]);
  const [showUploader, setShowUploader] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#007AFF');
  const [newCategoryIcon, setNewCategoryIcon] = useState('folder');

  const predefinedColors = [
    '#007AFF', '#34C759', '#FF3B30', '#FF9500',
    '#AF52DE', '#FF2D92', '#A2845E', '#8E8E93'
  ];

  const predefinedIcons = [
    'folder', 'image', 'camera', 'layers', 'logo',
    'star', 'heart', 'bookmark', 'tag', 'flag'
  ];

  useEffect(() => {
    if (visible) {
      loadCategories();
      if (initialCategory) {
        // Could set initial filter here
      }
    }
  }, [visible, initialCategory]);

  const loadCategories = async () => {
    try {
      // This would come from the database
      const mockCategories: Category[] = [
        { id: 1, name: 'Logos', color: '#4F46E5', icon: 'logo', created_at: new Date().toISOString() },
        { id: 2, name: 'Overlays', color: '#059669', icon: 'layers', created_at: new Date().toISOString() },
        { id: 3, name: 'Backgrounds', color: '#DC2626', icon: 'image', created_at: new Date().toISOString() },
        { id: 4, name: 'Screenshots', color: '#7C2D12', icon: 'camera', created_at: new Date().toISOString() },
        { id: 5, name: 'Custom', color: '#6B7280', icon: 'folder', created_at: new Date().toISOString() }
      ];
      setCategories(mockCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleAssetSelect = useCallback((asset: MediaAsset) => {
    if (selectionMode === 'single') {
      onAssetSelect?.(asset);
      onClose();
    } else {
      // Handle multiple selection
      const isSelected = selectedAssets.some(a => a.id === asset.id);
      let newSelection;
      
      if (isSelected) {
        newSelection = selectedAssets.filter(a => a.id !== asset.id);
      } else {
        newSelection = [...selectedAssets, asset];
      }
      
      setSelectedAssets(newSelection);
    }
  }, [selectionMode, selectedAssets, onAssetSelect, onClose]);

  const handleMultipleSelectionComplete = () => {
    if (selectedAssets.length > 0) {
      onMultipleAssetsSelect?.(selectedAssets);
      onClose();
    } else {
      Alert.alert('No Selection', 'Please select at least one asset');
    }
  };

  const handleUploadComplete = useCallback((assets: MediaAsset[]) => {
    setShowUploader(false);
    // Optionally auto-select uploaded assets
    if (selectionMode === 'multiple') {
      setSelectedAssets(prev => [...prev, ...assets]);
    } else if (assets.length === 1) {
      onAssetSelect?.(assets[0]);
      onClose();
    }
  }, [selectionMode, onAssetSelect, onClose]);

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      // This would create a new category in the database
      const newCategory: Category = {
        id: Date.now(), // Temporary ID
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
        created_at: new Date().toISOString()
      };

      setCategories(prev => [...prev, newCategory]);
      setNewCategoryName('');
      setShowNewCategoryModal(false);
      
      Alert.alert('Success', `Category "${newCategory.name}" created successfully`);
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category');
    }
  };

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'browse' && styles.activeTab]}
        onPress={() => setActiveTab('browse')}
      >
        <Ionicons 
          name="grid" 
          size={20} 
          color={activeTab === 'browse' ? '#007AFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'browse' && styles.activeTabText]}>
          Browse
        </Text>
      </TouchableOpacity>

      {showUploadButton && (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
          onPress={() => setActiveTab('upload')}
        >
          <Ionicons 
            name="cloud-upload" 
            size={20} 
            color={activeTab === 'upload' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}>
            Upload
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.tab, activeTab === 'organize' && styles.activeTab]}
        onPress={() => setActiveTab('organize')}
      >
        <Ionicons 
          name="folder" 
          size={20} 
          color={activeTab === 'organize' ? '#007AFF' : '#666'} 
        />
        <Text style={[styles.tabText, activeTab === 'organize' && styles.activeTabText]}>
          Organize
        </Text>
      </TouchableOpacity>

      {showStorageManager && (
        <TouchableOpacity
          style={[styles.tab, activeTab === 'storage' && styles.activeTab]}
          onPress={() => setActiveTab('storage')}
        >
          <Ionicons 
            name="settings" 
            size={20} 
            color={activeTab === 'storage' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'storage' && styles.activeTabText]}>
            Storage
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderBrowseTab = () => (
    <MediaLibrary
      onAssetSelect={handleAssetSelect}
      selectionMode={selectionMode}
      selectedAssets={selectedAssets}
      onSelectionChange={setSelectedAssets}
      categoryFilter={initialCategory}
      showUploadButton={false} // We handle upload in our tab
      showSearchBar={true}
      gridColumns={3}
    />
  );

  const renderUploadTab = () => (
    <View style={styles.uploadTab}>
      <Text style={styles.uploadTitle}>Upload New Images</Text>
      <Text style={styles.uploadSubtitle}>
        Add images to your media library
      </Text>
      
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => setShowUploader(true)}
      >
        <Ionicons name="cloud-upload" size={24} color="white" />
        <Text style={styles.uploadButtonText}>Choose Upload Source</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrganizeTab = () => (
    <ScrollView style={styles.organizeTab} showsVerticalScrollIndicator={false}>
      <View style={styles.organizeSection}>
        <View style={styles.organizeSectionHeader}>
          <Text style={styles.organizeSectionTitle}>Categories</Text>
          <TouchableOpacity
            style={styles.addCategoryButton}
            onPress={() => setShowNewCategoryModal(true)}
          >
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addCategoryText}>Add Category</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesList}>
          {categories.map(category => (
            <View key={category.id} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                <Ionicons name={category.icon as any} size={20} color="white" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryDate}>
                  Created {new Date(category.created_at).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity style={styles.categoryAction}>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.organizeSection}>
        <Text style={styles.organizeSectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="duplicate" size={20} color="#666" />
          <Text style={styles.quickActionText}>Find Duplicates</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="trash" size={20} color="#666" />
          <Text style={styles.quickActionText}>Clean Unused Assets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.quickAction}>
          <Ionicons name="download" size={20} color="#666" />
          <Text style={styles.quickActionText}>Export Library</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStorageTab = () => (
    <StorageManager />
  );

  const renderNewCategoryModal = () => (
    <Modal
      visible={showNewCategoryModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowNewCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Create New Category</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Category Name</Text>
            <TextInput
              style={styles.textInput}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Enter category name"
              autoFocus
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorPicker}>
                {predefinedColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      newCategoryColor === color && styles.selectedColorOption
                    ]}
                    onPress={() => setNewCategoryColor(color)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.iconPicker}>
                {predefinedIcons.map(icon => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      newCategoryIcon === icon && styles.selectedIconOption
                    ]}
                    onPress={() => setNewCategoryIcon(icon)}
                  >
                    <Ionicons name={icon as any} size={20} color="#666" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowNewCategoryModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateCategory}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{title}</Text>
          
          {selectionMode === 'multiple' && selectedAssets.length > 0 && (
            <TouchableOpacity onPress={handleMultipleSelectionComplete}>
              <Text style={styles.doneText}>Done ({selectedAssets.length})</Text>
            </TouchableOpacity>
          )}
          
          {selectionMode !== 'multiple' && <View style={styles.headerSpacer} />}
        </View>

        {/* Tab Bar */}
        {renderTabBar()}

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'browse' && renderBrowseTab()}
          {activeTab === 'upload' && renderUploadTab()}
          {activeTab === 'organize' && renderOrganizeTab()}
          {activeTab === 'storage' && renderStorageTab()}
        </View>

        {/* Image Uploader Modal */}
        <ImageUploader
          visible={showUploader}
          onClose={() => setShowUploader(false)}
          onUploadComplete={handleUploadComplete}
          defaultCategory={initialCategory}
          allowMultiple={true}
          maxSelection={10}
        />

        {/* New Category Modal */}
        {renderNewCategoryModal()}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSpacer: {
    width: 24,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  uploadTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  organizeTab: {
    flex: 1,
  },
  organizeSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  organizeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  organizeSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCategoryText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categoryAction: {
    padding: 8,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  quickActionText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: screenWidth * 0.9,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#007AFF',
  },
  iconPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIconOption: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});