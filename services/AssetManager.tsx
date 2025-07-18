import { Alert, Platform } from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Conditional import for permissions
let PermissionsAndroid: any = null;
try {
  if (Platform.OS === 'android') {
    PermissionsAndroid = require('react-native').PermissionsAndroid;
  }
} catch (error) {
  console.warn('PermissionsAndroid not available:', error);
}

// Conditional imports for native modules
let RNFS: any = null;
let ImageResizer: any = null;

try {
  RNFS = require('react-native-fs');
} catch (error) {
  console.warn('react-native-fs not available:', error);
}

try {
  ImageResizer = require('react-native-image-resizer');
} catch (error) {
  console.warn('react-native-image-resizer not available:', error);
}

export interface AssetInfo {
  id: string;
  name: string;
  uri: string;
  originalUri: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
  createdAt: Date;
  compressed: boolean;
}

export class AssetManager {
  private assets: Map<string, AssetInfo> = new Map();
  private static instance: AssetManager | null = null;
  private readonly assetsDirectory: string;
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];

  constructor() {
    this.assetsDirectory = RNFS 
      ? `${RNFS.DocumentDirectoryPath}/overlay_assets`
      : `/tmp/overlay_assets`; // Fallback for web/environments without RNFS
    this.initializeDirectory();
    this.loadAssets();
  }

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  private async initializeDirectory(): Promise<void> {
    try {
      if (!RNFS) {
        console.warn('RNFS not available, skipping directory initialization');
        return;
      }
      
      const exists = await RNFS.exists(this.assetsDirectory);
      if (!exists) {
        await RNFS.mkdir(this.assetsDirectory);
      }
    } catch (error) {
      console.error('Error initializing assets directory:', error);
    }
  }

  // Image selection and import
  async selectImageFromLibrary(): Promise<AssetInfo | null> {
    try {
      // Check permissions on Android
      if (Platform.OS === 'android' && PermissionsAndroid) {
        const hasPermission = await this.checkAndRequestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Please grant storage permission to select images. For full functionality, consider building a development build.',
            [{ text: 'OK' }]
          );
          return null;
        }
      }

      return new Promise((resolve) => {
        const options = {
          mediaType: 'photo' as MediaType,
          includeBase64: false,
          maxHeight: 2000,
          maxWidth: 2000,
          quality: 0.8,
        };

        launchImageLibrary(options, (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorMessage) {
            if (response.errorMessage?.includes('permission')) {
              Alert.alert(
                'Permission Denied',
                'Due to Android permission changes, full media library access requires a development build. Limited functionality in Expo Go.',
                [{ text: 'OK' }]
              );
            }
            resolve(null);
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            this.processSelectedImage(asset)
              .then(resolve)
              .catch((error) => {
                console.error('Error processing selected image:', error);
                Alert.alert('Error', 'Failed to process selected image');
                resolve(null);
              });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('Error selecting image from library:', error);
      return null;
    }
  }

  private async checkAndRequestPermissions(): Promise<boolean> {
    try {
      if (!PermissionsAndroid) return true;

      // For Android 13+ (API 33+), we need READ_MEDIA_IMAGES
      // For older versions, we need READ_EXTERNAL_STORAGE
      const androidVersion = Platform.Version as number;
      const permission = androidVersion >= 33 
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const granted = await PermissionsAndroid.check(permission);
      if (granted) {
        return true;
      }

      const result = await PermissionsAndroid.request(permission, {
        title: 'Photo Library Permission',
        message: 'This app needs access to your photo library to add overlay images.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });

      return result === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  }

  private async processSelectedImage(asset: any): Promise<AssetInfo | null> {
    try {
      if (!asset.uri || !asset.type) {
        throw new Error('Invalid asset data');
      }

      // Validate file format
      if (!this.supportedFormats.includes(asset.type)) {
        Alert.alert('Unsupported Format', 'Please select a PNG, JPG, or SVG image.');
        return null;
      }

      // Get file info
      let fileInfo;
      if (RNFS) {
        fileInfo = await RNFS.stat(asset.uri);
      } else {
        // Fallback for environments without RNFS
        fileInfo = {
          size: asset.fileSize || 1024 * 1024, // Default 1MB if not available
        };
      }
      
      // Check file size
      if (fileInfo.size > this.maxFileSize) {
        Alert.alert(
          'File Too Large', 
          `Image is ${(fileInfo.size / 1024 / 1024).toFixed(1)}MB. Maximum size is ${this.maxFileSize / 1024 / 1024}MB.`
        );
        return null;
      }

      // Process and optimize image
      const assetInfo = await this.createAssetInfo(asset, fileInfo);
      
      // Copy to assets directory and optimize if needed
      const finalAsset = await this.optimizeAndStore(assetInfo);
      
      // Store asset info
      this.assets.set(finalAsset.id, finalAsset);
      await this.saveAssets();
      
      return finalAsset;
    } catch (error) {
      console.error('Error processing selected image:', error);
      return null;
    }
  }

  private async createAssetInfo(asset: any, fileInfo: any): Promise<AssetInfo> {
    const id = this.generateAssetId();
    const name = asset.fileName || `Asset_${id}`;
    
    return {
      id,
      name,
      uri: asset.uri,
      originalUri: asset.uri,
      size: fileInfo.size,
      width: asset.width || 0,
      height: asset.height || 0,
      mimeType: asset.type,
      createdAt: new Date(),
      compressed: false,
    };
  }

  private async optimizeAndStore(assetInfo: AssetInfo): Promise<AssetInfo> {
    try {
      // Skip optimization if native modules not available
      if (!RNFS || !ImageResizer) {
        console.warn('Native modules not available, using original asset');
        return assetInfo;
      }

      const targetPath = `${this.assetsDirectory}/${assetInfo.id}.jpg`;
      
      // For SVG or large images, optimize
      if (assetInfo.mimeType === 'image/svg+xml' || assetInfo.size > 1024 * 1024) {
        const resized = await ImageResizer.createResizedImage(
          assetInfo.uri,
          800, // max width
          600, // max height
          'JPEG',
          85, // quality
          0, // rotation
          targetPath, // output path
          false, // keep metadata
          { mode: 'contain' }
        );

        const optimizedInfo = await RNFS.stat(resized.uri);
        
        return {
          ...assetInfo,
          uri: resized.uri,
          size: optimizedInfo.size,
          width: resized.width,
          height: resized.height,
          mimeType: 'image/jpeg',
          compressed: true,
        };
      } else {
        // Just copy the file
        await RNFS.copyFile(assetInfo.uri, targetPath);
        
        return {
          ...assetInfo,
          uri: targetPath,
        };
      }
    } catch (error) {
      console.error('Error optimizing and storing asset:', error);
      return assetInfo; // Return original on error
    }
  }

  // Asset management
  async deleteAsset(id: string): Promise<boolean> {
    try {
      const asset = this.assets.get(id);
      if (!asset) return false;

      // Delete file if RNFS is available
      if (RNFS) {
        try {
          if (await RNFS.exists(asset.uri)) {
            await RNFS.unlink(asset.uri);
          }
        } catch (fileError) {
          console.warn('Error deleting file:', fileError);
          // Continue even if file deletion fails
        }
      }

      // Remove from assets
      this.assets.delete(id);
      await this.saveAssets();
      
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      return false;
    }
  }

  async renameAsset(id: string, newName: string): Promise<boolean> {
    try {
      const asset = this.assets.get(id);
      if (!asset) return false;

      asset.name = newName;
      this.assets.set(id, asset);
      await this.saveAssets();
      
      return true;
    } catch (error) {
      console.error('Error renaming asset:', error);
      return false;
    }
  }

  getAsset(id: string): AssetInfo | null {
    return this.assets.get(id) || null;
  }

  getAllAssets(): AssetInfo[] {
    return Array.from(this.assets.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getAssetsByType(mimeType: string): AssetInfo[] {
    return this.getAllAssets().filter(asset => asset.mimeType === mimeType);
  }

  // Storage management
  async getStorageUsage(): Promise<{
    totalAssets: number;
    totalSize: number;
    averageSize: number;
    storageUsed: string;
  }> {
    const assets = this.getAllAssets();
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    
    return {
      totalAssets: assets.length,
      totalSize,
      averageSize: assets.length > 0 ? totalSize / assets.length : 0,
      storageUsed: this.formatFileSize(totalSize),
    };
  }

  async cleanupUnusedAssets(usedAssetIds: string[]): Promise<number> {
    let deletedCount = 0;
    
    try {
      for (const [id, asset] of this.assets.entries()) {
        if (!usedAssetIds.includes(id)) {
          const deleted = await this.deleteAsset(id);
          if (deleted) deletedCount++;
        }
      }
    } catch (error) {
      console.error('Error cleaning up unused assets:', error);
    }
    
    return deletedCount;
  }

  // Data persistence
  private async saveAssets(): Promise<void> {
    try {
      const assetsArray = Array.from(this.assets.entries()).map(([id, asset]) => ({
        id,
        ...asset,
        createdAt: asset.createdAt.toISOString(),
      }));
      
      await AsyncStorage.setItem('overlay_assets', JSON.stringify(assetsArray));
    } catch (error) {
      console.error('Error saving assets:', error);
    }
  }

  private async loadAssets(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('overlay_assets');
      if (stored) {
        const assetsArray = JSON.parse(stored);
        
        for (const assetData of assetsArray) {
          // Verify file still exists (skip check if RNFS not available)
          let fileExists = true;
          if (RNFS) {
            try {
              fileExists = await RNFS.exists(assetData.uri);
            } catch (error) {
              console.warn('Error checking file existence:', error);
              fileExists = false;
            }
          }
          
          if (fileExists) {
            this.assets.set(assetData.id, {
              ...assetData,
              createdAt: new Date(assetData.createdAt),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading assets:', error);
      this.assets.clear();
    }
  }

  // Import/Export
  async exportAssetData(): Promise<string> {
    try {
      const assetsArray = Array.from(this.assets.entries()).map(([id, asset]) => ({
        id,
        name: asset.name,
        size: asset.size,
        width: asset.width,
        height: asset.height,
        mimeType: asset.mimeType,
        createdAt: asset.createdAt.toISOString(),
        compressed: asset.compressed,
      }));
      
      return JSON.stringify(assetsArray, null, 2);
    } catch (error) {
      console.error('Error exporting asset data:', error);
      return '[]';
    }
  }

  // Utilities
  private generateAssetId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Performance monitoring
  getPerformanceStats(): {
    assetCount: number;
    totalMemoryUsage: number;
    averageFileSize: number;
    cacheHitRate: number;
  } {
    const assets = this.getAllAssets();
    const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0);
    
    return {
      assetCount: assets.length,
      totalMemoryUsage: totalSize,
      averageFileSize: assets.length > 0 ? totalSize / assets.length : 0,
      cacheHitRate: 0.95, // Placeholder - would track actual cache hits in production
    };
  }

  // Cleanup
  async dispose(): Promise<void> {
    try {
      await this.saveAssets();
      this.assets.clear();
    } catch (error) {
      console.error('Error disposing asset manager:', error);
    }
  }
}

// Export singleton instance
export const assetManager = AssetManager.getInstance();