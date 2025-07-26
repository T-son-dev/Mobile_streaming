import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import MediaStorageManager from './MediaStorageManager';
import { MediaAsset } from '../database/AssetDatabase';

export interface UploadSource {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

export interface UploadOptions {
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  allowsEditing?: boolean;
  mediaType?: 'photo' | 'video' | 'mixed';
  selectionLimit?: number;
  includeBase64?: boolean;
  category?: string;
  tags?: string[];
}

export interface UploadProgress {
  id: string;
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface UploadResult {
  success: boolean;
  assets?: MediaAsset[];
  error?: string;
}

class ImageUploadService {
  private uploadQueue: Map<string, UploadProgress> = new Map();
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  private readonly uploadSources: UploadSource[] = [
    {
      id: 'gallery',
      name: 'Photo Gallery',
      icon: 'image',
      description: 'Select from device photo gallery',
      enabled: true
    },
    {
      id: 'camera',
      name: 'Camera',
      icon: 'camera',
      description: 'Take a new photo',
      enabled: true
    },
    {
      id: 'files',
      name: 'File Browser',
      icon: 'folder',
      description: 'Browse device files',
      enabled: true
    },
    {
      id: 'crop_picker',
      name: 'Advanced Picker',
      icon: 'crop',
      description: 'Pick and crop images',
      enabled: true
    },
    {
      id: 'clipboard',
      name: 'Clipboard',
      icon: 'clipboard',
      description: 'Paste from clipboard',
      enabled: Platform.OS === 'ios' // More limited on Android
    }
  ];

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraStatus === 'granted' && mediaStatus === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  getAvailableSources(): UploadSource[] {
    return this.uploadSources.filter(source => source.enabled);
  }

  async uploadFromGallery(options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permission denied' };
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsMultipleSelection: (options.selectionLimit || 1) > 1,
        quality: options.quality || 0.8,
        base64: options.includeBase64 || false,
        allowsEditing: options.allowsEditing || false,
      });

      if (result.canceled) {
        return { success: false, error: 'User cancelled' };
      }

      // Convert to standard format
      const assets = result.assets.map(asset => ({
        uri: asset.uri,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        fileSize: asset.fileSize || 0,
        type: asset.type || 'image',
        width: asset.width,
        height: asset.height,
        base64: asset.base64
      }));

      return await this.processSelectedAssets(assets, options);
    } catch (error) {
      console.error('Gallery upload error:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadFromCamera(options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Camera permission denied' };
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        quality: options.quality || 0.8,
        base64: options.includeBase64 || false,
        allowsEditing: options.allowsEditing || false,
      });

      if (result.canceled) {
        return { success: false, error: 'User cancelled' };
      }

      // Convert to standard format
      const assets = [{
        uri: result.assets[0].uri,
        fileName: result.assets[0].fileName || `photo_${Date.now()}.jpg`,
        fileSize: result.assets[0].fileSize || 0,
        type: result.assets[0].type || 'image',
        width: result.assets[0].width,
        height: result.assets[0].height,
        base64: result.assets[0].base64
      }];

      return await this.processSelectedAssets(assets, options);
    } catch (error) {
      console.error('Camera upload error:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadFromFiles(options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'File access permission denied' };
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        multiple: (options.selectionLimit || 1) > 1,
      });

      if (result.canceled) {
        return { success: false, error: 'User cancelled' };
      }

      // Convert Expo DocumentPicker result to ImagePicker format
      const assets = result.assets.map(file => ({
        uri: file.uri,
        fileName: file.name,
        fileSize: file.size || 0,
        type: file.mimeType || 'image/jpeg',
        width: 0, // Will be detected later
        height: 0
      }));

      return await this.processSelectedAssets(assets, options);
    } catch (error) {
      console.error('File upload error:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadWithCropPicker(options: UploadOptions = {}): Promise<UploadResult> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return { success: false, error: 'Permission denied' };
      }

      const cropOptions = {
        width: options.maxWidth || 800,
        height: options.maxHeight || 600,
        cropping: options.allowsEditing !== false,
        quality: options.quality || 0.8,
        mediaType: 'photo',
        multiple: (options.selectionLimit || 1) > 1,
        includeBase64: options.includeBase64 || false,
      };

      const result = await ImageCropPicker.openPicker(cropOptions);
      const assets = Array.isArray(result) ? result : [result];

      // Convert to standard format
      const standardAssets = assets.map(asset => ({
        uri: asset.path,
        fileName: asset.filename || `image_${Date.now()}.jpg`,
        fileSize: asset.size,
        type: asset.mime,
        width: asset.width,
        height: asset.height
      }));

      return await this.processSelectedAssets(standardAssets, options);
    } catch (error) {
      console.error('Crop picker upload error:', error);
      return { success: false, error: error.message };
    }
  }

  async uploadFromClipboard(options: UploadOptions = {}): Promise<UploadResult> {
    // This would require additional clipboard image handling
    // For now, show not implemented message
    Alert.alert('Not Implemented', 'Clipboard upload feature coming soon!');
    return { success: false, error: 'Clipboard upload not yet implemented' };
  }

  private async processSelectedAssets(
    selectedAssets: any[],
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      const processedAssets: MediaAsset[] = [];
      
      for (let i = 0; i < selectedAssets.length; i++) {
        const asset = selectedAssets[i];
        const uploadId = `upload_${Date.now()}_${i}`;
        
        // Initialize progress tracking
        const progress: UploadProgress = {
          id: uploadId,
          filename: asset.fileName || `image_${Date.now()}.jpg`,
          progress: 0,
          status: 'pending'
        };
        
        this.uploadQueue.set(uploadId, progress);
        this.notifyProgress(uploadId, progress);

        try {
          // Update progress - starting upload
          progress.status = 'uploading';
          progress.progress = 25;
          this.uploadQueue.set(uploadId, progress);
          this.notifyProgress(uploadId, progress);

          // Store the file using MediaStorageManager
          const storedAsset = await MediaStorageManager.storeFile(asset.uri, {
            originalName: asset.fileName || `image_${Date.now()}.jpg`,
            category: options.category,
            tags: options.tags,
            generateThumbnail: true,
            optimize: true
          });

          // Update progress - processing
          progress.status = 'processing';
          progress.progress = 75;
          this.uploadQueue.set(uploadId, progress);
          this.notifyProgress(uploadId, progress);

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 500));

          // Update progress - completed
          progress.status = 'completed';
          progress.progress = 100;
          this.uploadQueue.set(uploadId, progress);
          this.notifyProgress(uploadId, progress);

          processedAssets.push(storedAsset);

        } catch (assetError) {
          progress.status = 'error';
          progress.error = assetError.message;
          this.uploadQueue.set(uploadId, progress);
          this.notifyProgress(uploadId, progress);
          
          console.error(`Error processing asset ${asset.fileName}:`, assetError);
        }
      }

      // Clean up progress tracking after a delay
      setTimeout(() => {
        selectedAssets.forEach((_, i) => {
          const uploadId = `upload_${Date.now()}_${i}`;
          this.uploadQueue.delete(uploadId);
          this.progressCallbacks.delete(uploadId);
        });
      }, 5000);

      return {
        success: processedAssets.length > 0,
        assets: processedAssets,
        error: processedAssets.length === 0 ? 'No assets processed successfully' : undefined
      };

    } catch (error) {
      console.error('Error processing selected assets:', error);
      return { success: false, error: error.message };
    }
  }

  // Batch upload multiple files
  async batchUpload(
    sourceType: 'gallery' | 'files' | 'crop_picker',
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const batchOptions = {
      ...options,
      selectionLimit: 10 // Default batch limit
    };

    switch (sourceType) {
      case 'gallery':
        return await this.uploadFromGallery(batchOptions);
      case 'files':
        return await this.uploadFromFiles(batchOptions);
      case 'crop_picker':
        return await this.uploadWithCropPicker(batchOptions);
      default:
        return { success: false, error: 'Unsupported source type for batch upload' };
    }
  }

  // Progress tracking
  onUploadProgress(uploadId: string, callback: (progress: UploadProgress) => void): void {
    this.progressCallbacks.set(uploadId, callback);
  }

  private notifyProgress(uploadId: string, progress: UploadProgress): void {
    const callback = this.progressCallbacks.get(uploadId);
    if (callback) {
      callback(progress);
    }
  }

  getUploadProgress(uploadId: string): UploadProgress | undefined {
    return this.uploadQueue.get(uploadId);
  }

  getAllUploadProgress(): UploadProgress[] {
    return Array.from(this.uploadQueue.values());
  }

  // Cancel upload (for future implementation)
  async cancelUpload(uploadId: string): Promise<boolean> {
    const progress = this.uploadQueue.get(uploadId);
    if (progress && progress.status === 'uploading') {
      progress.status = 'error';
      progress.error = 'Upload cancelled by user';
      this.uploadQueue.set(uploadId, progress);
      this.notifyProgress(uploadId, progress);
      return true;
    }
    return false;
  }

  // Utility method to show upload source selection
  async showUploadSourceSelection(options: UploadOptions = {}): Promise<UploadResult> {
    return new Promise((resolve) => {
      const availableSources = this.getAvailableSources();
      
      const sourceNames = availableSources.map(source => source.name);
      sourceNames.push('Cancel');

      Alert.alert(
        'Select Upload Source',
        'Choose where to upload images from:',
        sourceNames.map((name, index) => ({
          text: name,
          onPress: async () => {
            if (name === 'Cancel') {
              resolve({ success: false, error: 'User cancelled' });
              return;
            }

            const source = availableSources[index];
            let result: UploadResult;

            switch (source.id) {
              case 'gallery':
                result = await this.uploadFromGallery(options);
                break;
              case 'camera':
                result = await this.uploadFromCamera(options);
                break;
              case 'files':
                result = await this.uploadFromFiles(options);
                break;
              case 'crop_picker':
                result = await this.uploadWithCropPicker(options);
                break;
              case 'clipboard':
                result = await this.uploadFromClipboard(options);
                break;
              default:
                result = { success: false, error: 'Unknown source type' };
            }

            resolve(result);
          }
        })),
        { cancelable: true }
      );
    });
  }
}

export default new ImageUploadService();