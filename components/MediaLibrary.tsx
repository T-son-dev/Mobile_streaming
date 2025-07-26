import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import MediaStorageManager from '../services/MediaStorageManager';
import ImageUploadService from '../services/ImageUploadService';
import { MediaAsset, Category } from '../database/AssetDatabase';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface MediaLibraryProps {
  onAssetSelect?: (asset: MediaAsset) => void;
  selectionMode?: 'single' | 'multiple';
  selectedAssets?: MediaAsset[];
  onSelectionChange?: (assets: MediaAsset[]) => void;
  categoryFilter?: string;
  showUploadButton?: boolean;
  showSearchBar?: boolean;
  gridColumns?: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'date' | 'size' | 'usage';
type SortOrder = 'asc' | 'desc';

export default function MediaLibrary({
  onAssetSelect,
  selectionMode = 'single',
  selectedAssets = [],
  onSelectionChange,
  categoryFilter,
  showUploadButton = true,
  showSearchBar = true,
  gridColumns = 3
}: MediaLibraryProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<MediaAsset | null>(null);
  const [selectedAssetsLocal, setSelectedAssetsLocal] = useState<Set<number>>(new Set());

  // Initialize and load data
  useEffect(() => {
    initializeLibrary();
  }, []);

  // Update local selection when props change
  useEffect(() => {
    const selectedIds = new Set(selectedAssets.map(asset => asset.id).filter(Boolean));
    setSelectedAssetsLocal(selectedIds);
  }, [selectedAssets]);

  const initializeLibrary = async () => {
    try {
      setLoading(true);
      await MediaStorageManager.initialize();
      await loadAssets();
      await loadCategories();
    } catch (error) {
      console.error('Error initializing media library:', error);
      Alert.alert('Error', 'Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const loadAssets = async () => {
    try {
      const filter: any = {};
      
      if (selectedCategory && selectedCategory !== 'all') {
        filter.category = selectedCategory;
      }
      
      if (searchQuery.trim()) {
        filter.search = searchQuery.trim();
      }

      const loadedAssets = await MediaStorageManager.getAssets(filter);
      
      // Sort assets
      const sortedAssets = sortAssets(loadedAssets, sortBy, sortOrder);
      setAssets(sortedAssets);
    } catch (error) {
      console.error('Error loading assets:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const db = await MediaStorageManager['database']?.initDatabase();
      // This would need to be exposed by MediaStorageManager
      // For now, we'll use mock data
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

  const sortAssets = (assetList: MediaAsset[], sortField: SortBy, order: SortOrder): MediaAsset[] => {
    return [...assetList].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.filename.localeCompare(b.filename);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'size':
          comparison = a.file_size - b.file_size;
          break;
        case 'usage':
          comparison = a.usage_count - b.usage_count;
          break;
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };

  // Reload assets when filters change
  useEffect(() => {
    if (!loading) {
      loadAssets();
    }
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAssets();
    setRefreshing(false);
  }, [selectedCategory, searchQuery, sortBy, sortOrder]);

  const handleAssetPress = useCallback((asset: MediaAsset) => {
    if (selectionMode === 'multiple') {
      const newSelection = new Set(selectedAssetsLocal);
      
      if (newSelection.has(asset.id!)) {
        newSelection.delete(asset.id!);
      } else {
        newSelection.add(asset.id!);
      }
      
      setSelectedAssetsLocal(newSelection);
      
      const selectedAssetsList = assets.filter(a => newSelection.has(a.id!));
      onSelectionChange?.(selectedAssetsList);
    } else {
      // Log usage
      MediaStorageManager.logAssetUsage(asset.id!, 'view');
      
      if (onAssetSelect) {
        onAssetSelect(asset);
      } else {
        setPreviewAsset(asset);
      }
    }
  }, [selectionMode, selectedAssetsLocal, assets, onAssetSelect, onSelectionChange]);

  const handleAssetLongPress = useCallback((asset: MediaAsset) => {
    // Show context menu
    Alert.alert(
      asset.original_name,
      'Choose an action',
      [
        { text: 'Preview', onPress: () => setPreviewAsset(asset) },
        { text: 'Mark as Favorite', onPress: () => toggleFavorite(asset) },
        { text: 'Delete', onPress: () => confirmDelete(asset), style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  }, []);

  const toggleFavorite = async (asset: MediaAsset) => {
    try {
      await MediaStorageManager.updateAsset(asset.id!, { is_favorite: !asset.is_favorite });
      await loadAssets();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const confirmDelete = (asset: MediaAsset) => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete "${asset.original_name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteAsset(asset)
        }
      ]
    );
  };

  const deleteAsset = async (asset: MediaAsset) => {
    try {
      await MediaStorageManager.deleteAsset(asset.id!);
      await loadAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
      Alert.alert('Error', 'Failed to delete asset');
    }
  };

  const handleUpload = async () => {
    try {
      const result = await ImageUploadService.showUploadSourceSelection({
        selectionLimit: 5,
        category: selectedCategory !== 'all' ? selectedCategory : undefined
      });
      
      if (result.success) {
        await loadAssets();
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload images');
    }
  };

  // Memoized filtered and sorted assets
  const displayAssets = useMemo(() => {
    return assets;
  }, [assets]);

  const itemSize = useMemo(() => {
    const padding = 20;
    const spacing = 10;
    return (screenWidth - padding - (spacing * (gridColumns - 1))) / gridColumns;
  }, [gridColumns]);

  const renderGridItem = ({ item, index }: { item: MediaAsset; index: number }) => {
    const isSelected = selectedAssetsLocal.has(item.id!);
    
    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          { width: itemSize, height: itemSize },
          isSelected && styles.selectedItem
        ]}
        onPress={() => handleAssetPress(item)}
        onLongPress={() => handleAssetLongPress(item)}
        activeOpacity={0.7}
      >
        <ExpoImage
          source={{ uri: `file://${item.file_path}` }}
          style={styles.assetImage}
          contentFit="cover"
        />
        
        {/* Overlay for selection */}
        {selectionMode === 'multiple' && (
          <View style={styles.selectionOverlay}>
            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </View>
        )}
        
        {/* Favorite indicator */}
        {item.is_favorite && (
          <View style={styles.favoriteIndicator}>
            <Ionicons name="heart" size={16} color="#FF3366" />
          </View>
        )}
        
        {/* File info overlay */}
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.original_name}
          </Text>
          <Text style={styles.fileSize}>
            {(item.file_size / 1024).toFixed(0)}KB
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item }: { item: MediaAsset }) => {
    const isSelected = selectedAssetsLocal.has(item.id!);
    
    return (
      <TouchableOpacity
        style={[styles.listItem, isSelected && styles.selectedListItem]}
        onPress={() => handleAssetPress(item)}
        onLongPress={() => handleAssetLongPress(item)}
      >
        <ExpoImage
          source={{ uri: `file://${item.file_path}` }}
          style={styles.listItemImage}
          contentFit="cover"
        />
        
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemName} numberOfLines={1}>
            {item.original_name}
          </Text>
          <Text style={styles.listItemDetails}>
            {item.format?.toUpperCase()} • {(item.file_size / 1024).toFixed(0)}KB
          </Text>
          <Text style={styles.listItemDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.listItemActions}>
          {item.is_favorite && (
            <Ionicons name="heart" size={20} color="#FF3366" />
          )}
          {selectionMode === 'multiple' && (
            <View style={[styles.selectionCircle, isSelected && styles.selectedCircle]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      {showSearchBar && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search assets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'all' && styles.activeCategoryChip]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.categoryChipText, selectedCategory === 'all' && styles.activeCategoryChipText]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.name.toLowerCase() && styles.activeCategoryChip
            ]}
            onPress={() => setSelectedCategory(category.name.toLowerCase())}
          >
            <Text style={[
              styles.categoryChipText,
              selectedCategory === category.name.toLowerCase() && styles.activeCategoryChipText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name="options" size={20} color="#666" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons name={viewMode === 'grid' ? 'list' : 'grid'} size={20} color="#666" />
        </TouchableOpacity>
        
        {showUploadButton && (
          <TouchableOpacity
            style={[styles.controlButton, styles.uploadButton]}
            onPress={handleUpload}
          >
            <Ionicons name="add" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Options */}
      {showFilters && (
        <View style={styles.filterOptions}>
          <Text style={styles.filterLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['name', 'date', 'size', 'usage'].map(option => (
              <TouchableOpacity
                key={option}
                style={[styles.filterChip, sortBy === option && styles.activeFilterChip]}
                onPress={() => setSortBy(option as SortBy)}
              >
                <Text style={[styles.filterChipText, sortBy === option && styles.activeFilterChipText]}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity
            style={styles.sortOrderButton}
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <Ionicons 
              name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
              size={16} 
              color="#666" 
            />
            <Text style={styles.sortOrderText}>
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Results count */}
      <Text style={styles.resultsCount}>
        {displayAssets.length} {displayAssets.length === 1 ? 'asset' : 'assets'}
        {selectedAssetsLocal.size > 0 && ` • ${selectedAssetsLocal.size} selected`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading media library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={displayAssets}
        renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
        keyExtractor={item => item.id?.toString() || item.filename}
        numColumns={viewMode === 'grid' ? gridColumns : 1}
        key={`${viewMode}-${gridColumns}`} // Force re-render when layout changes
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={viewMode === 'grid' ? styles.row : undefined}
      />
      
      {/* Preview Modal */}
      <Modal
        visible={previewAsset !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewAsset(null)}
      >
        <View style={styles.previewContainer}>
          <TouchableOpacity 
            style={styles.previewBackdrop}
            onPress={() => setPreviewAsset(null)}
          />
          {previewAsset && (
            <View style={styles.previewContent}>
              <ExpoImage
                source={{ uri: `file://${previewAsset.file_path}` }}
                style={styles.previewImage}
                contentFit="contain"
              />
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle}>{previewAsset.original_name}</Text>
                <Text style={styles.previewDetails}>
                  {previewAsset.format?.toUpperCase()} • {(previewAsset.file_size / 1024).toFixed(0)}KB
                </Text>
                {previewAsset.width && previewAsset.height && (
                  <Text style={styles.previewDetails}>
                    {previewAsset.width} × {previewAsset.height}px
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.previewCloseButton}
                onPress={() => setPreviewAsset(null)}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  categoryFilter: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  activeCategoryChip: {
    backgroundColor: '#007AFF',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: 'white',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 12,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
  },
  filterOptions: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  activeFilterChip: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 13,
    color: '#666',
  },
  activeFilterChipText: {
    color: 'white',
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  sortOrderText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  resultsCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  gridItem: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedItem: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  assetImage: {
    flex: 1,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  selectedCircle: {
    backgroundColor: '#007AFF',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
  },
  fileInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
  },
  fileName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  fileSize: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedListItem: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  listItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  listItemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  listItemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  listItemDate: {
    fontSize: 12,
    color: '#999',
  },
  listItemActions: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 12,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewContent: {
    width: screenWidth * 0.9,
    height: screenHeight * 0.8,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    flex: 1,
  },
  previewInfo: {
    padding: 16,
    backgroundColor: 'white',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  previewDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  previewCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});