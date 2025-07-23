import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  ProgressBarAndroid,
  ProgressViewIOS,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ImageUploadService, { UploadProgress, UploadOptions } from '../services/ImageUploadService';
import { MediaAsset } from '../database/AssetDatabase';

const { width: screenWidth } = Dimensions.get('window');

interface ImageUploaderProps {
  visible: boolean;
  onClose: () => void;
  onUploadComplete?: (assets: MediaAsset[]) => void;
  defaultCategory?: string;
  allowMultiple?: boolean;
  maxSelection?: number;
}

export default function ImageUploader({
  visible,
  onClose,
  onUploadComplete,
  defaultCategory,
  allowMultiple = true,
  maxSelection = 10
}: ImageUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<MediaAsset[]>([]);

  const uploadSources = [
    {
      id: 'gallery',
      title: 'Photo Gallery',
      description: 'Select from your device photo gallery',
      icon: 'images',
      color: '#4CAF50'
    },
    {
      id: 'camera',
      title: 'Camera',
      description: 'Take a new photo',
      icon: 'camera',
      color: '#2196F3'
    },
    {
      id: 'files',
      title: 'File Browser',
      description: 'Browse and select image files',
      icon: 'folder',
      color: '#FF9800'
    },
    {
      id: 'crop_picker',
      title: 'Advanced Picker',
      description: 'Pick and crop images with editing tools',
      icon: 'crop',
      color: '#9C27B0'
    }
  ];

  const handleSourceSelect = useCallback(async (sourceId: string) => {
    try {
      setUploading(true);
      setUploadProgress([]);
      setUploadResults([]);

      const options: UploadOptions = {
        selectionLimit: allowMultiple ? maxSelection : 1,
        category: defaultCategory,
        quality: 0.8,
        maxWidth: 2048,
        maxHeight: 2048
      };

      let result;
      
      switch (sourceId) {
        case 'gallery':
          result = await ImageUploadService.uploadFromGallery(options);
          break;
        case 'camera':
          result = await ImageUploadService.uploadFromCamera(options);
          break;
        case 'files':
          result = await ImageUploadService.uploadFromFiles(options);
          break;
        case 'crop_picker':
          result = await ImageUploadService.uploadWithCropPicker(options);
          break;
        default:
          throw new Error('Unknown upload source');
      }

      if (result.success && result.assets) {
        setUploadResults(result.assets);
        onUploadComplete?.(result.assets);
        
        // Show success message
        Alert.alert(
          'Upload Complete',
          `Successfully uploaded ${result.assets.length} ${result.assets.length === 1 ? 'image' : 'images'}`,
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        Alert.alert('Upload Failed', result.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [allowMultiple, maxSelection, defaultCategory, onUploadComplete, onClose]);

  const renderProgressBar = (progress: UploadProgress) => {
    const ProgressComponent = Platform.OS === 'ios' ? ProgressViewIOS : ProgressBarAndroid;
    
    return (
      <View key={progress.id} style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressFilename} numberOfLines={1}>
            {progress.filename}
          </Text>
          <Text style={styles.progressPercent}>
            {Math.round(progress.progress)}%
          </Text>
        </View>
        
        <ProgressComponent
          style={styles.progressBar}
          progress={progress.progress / 100}
          color={progress.status === 'error' ? '#F44336' : '#4CAF50'}
        />
        
        <View style={styles.progressFooter}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(progress.status) }]} />
          <Text style={styles.progressStatus}>
            {getStatusText(progress.status)}
          </Text>
          {progress.error && (
            <Text style={styles.progressError} numberOfLines={1}>
              {progress.error}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const getStatusColor = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending': return '#FFC107';
      case 'uploading': return '#2196F3';
      case 'processing': return '#FF9800';
      case 'completed': return '#4CAF50';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending': return 'Waiting...';
      case 'uploading': return 'Uploading...';
      case 'processing': return 'Processing...';
      case 'completed': return 'Complete';
      case 'error': return 'Failed';
      default: return 'Unknown';
    }
  };

  const renderDragDropZone = () => (
    <View style={styles.dragDropZone}>
      <Ionicons name="cloud-upload-outline" size={64} color="#ccc" />
      <Text style={styles.dragDropTitle}>Drag & Drop Images</Text>
      <Text style={styles.dragDropSubtitle}>
        or tap to select from the options below
      </Text>
      <View style={styles.supportedFormats}>
        <Text style={styles.supportedFormatsText}>
          Supports: JPG, PNG, GIF, WebP, HEIC
        </Text>
        <Text style={styles.supportedFormatsText}>
          Max size: 100MB per image
        </Text>
      </View>
    </View>
  );

  const renderUploadSources = () => (
    <View style={styles.sourcesContainer}>
      <Text style={styles.sourcesTitle}>Choose Upload Source</Text>
      
      {uploadSources.map(source => (
        <TouchableOpacity
          key={source.id}
          style={styles.sourceButton}
          onPress={() => handleSourceSelect(source.id)}
          disabled={uploading}
          activeOpacity={0.7}
        >
          <View style={[styles.sourceIcon, { backgroundColor: source.color }]}>
            <Ionicons name={source.icon as any} size={24} color="white" />
          </View>
          
          <View style={styles.sourceInfo}>
            <Text style={styles.sourceTitle}>{source.title}</Text>
            <Text style={styles.sourceDescription}>{source.description}</Text>
          </View>
          
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderUploadProgress = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>Uploading Images</Text>
      
      <ScrollView style={styles.progressList}>
        {uploadProgress.map(renderProgressBar)}
      </ScrollView>
      
      <View style={styles.progressSummary}>
        <Text style={styles.progressSummaryText}>
          {uploadProgress.filter(p => p.status === 'completed').length} of {uploadProgress.length} completed
        </Text>
      </View>
    </View>
  );

  const renderUploadResults = () => (
    <View style={styles.resultsContainer}>
      <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
      <Text style={styles.resultsTitle}>Upload Complete!</Text>
      <Text style={styles.resultsSubtitle}>
        Successfully uploaded {uploadResults.length} {uploadResults.length === 1 ? 'image' : 'images'}
      </Text>
      
      <ScrollView style={styles.resultsList}>
        {uploadResults.map(asset => (
          <View key={asset.id} style={styles.resultItem}>
            <Ionicons name="image" size={20} color="#4CAF50" />
            <Text style={styles.resultItemName} numberOfLines={1}>
              {asset.original_name}
            </Text>
            <Text style={styles.resultItemSize}>
              {(asset.file_size / 1024).toFixed(0)}KB
            </Text>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity style={styles.doneButton} onPress={onClose}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </View>
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
          <TouchableOpacity onPress={onClose} disabled={uploading}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Upload Images</Text>
          
          <View style={styles.headerRight}>
            {uploading && <ActivityIndicator size="small" color="#007AFF" />}
          </View>
        </View>
        
        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!uploading && uploadResults.length === 0 && (
            <>
              {renderDragDropZone()}
              {renderUploadSources()}
            </>
          )}
          
          {uploading && renderUploadProgress()}
          
          {!uploading && uploadResults.length > 0 && renderUploadResults()}
        </ScrollView>
        
        {/* Footer */}
        {!uploading && uploadResults.length === 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {allowMultiple ? `Select up to ${maxSelection} images` : 'Select 1 image'}
            </Text>
            {defaultCategory && (
              <Text style={styles.footerCategory}>
                Category: {defaultCategory}
              </Text>
            )}
          </View>
        )}
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
  headerRight: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  dragDropZone: {
    margin: 16,
    padding: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragDropTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  dragDropSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  supportedFormats: {
    marginTop: 16,
    alignItems: 'center',
  },
  supportedFormatsText: {
    fontSize: 12,
    color: '#999',
    marginVertical: 2,
  },
  sourcesContainer: {
    margin: 16,
  },
  sourcesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  sourceDescription: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    margin: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressList: {
    maxHeight: 300,
  },
  progressItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressFilename: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 8,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    height: 4,
    marginVertical: 8,
  },
  progressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  progressStatus: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  progressError: {
    flex: 1,
    fontSize: 12,
    color: '#F44336',
  },
  progressSummary: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  progressSummaryText: {
    fontSize: 14,
    color: '#666',
  },
  resultsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  resultsSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  resultsList: {
    width: '100%',
    maxHeight: 200,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultItemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  resultItemSize: {
    fontSize: 12,
    color: '#666',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerCategory: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});