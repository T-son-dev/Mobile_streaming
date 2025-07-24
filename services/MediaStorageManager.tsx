import * as FileSystem from 'expo-file-system';
import AssetDatabase, { MediaAsset } from '../database/AssetDatabase';
import { Platform } from 'react-native';
import CryptoJS from 'react-native-crypto-js';

export interface MediaStorageConfig {
  maxStorageSize: number; // in bytes
  cleanupThreshold: number; // percentage (0-100)
  enableCache: boolean;
  cacheMaxAge: number; // in milliseconds
}

export interface StorageStructure {
  mediaLibrary: string;
  images: {
    original: string;
    optimized: string;
    thumbnails: string;
  };
  categories: {
    logos: string;
    backgrounds: string;
    overlays: string;
    custom: string;
  };
  cache: {
    processed: string;
    previews: string;
    temp: string;
  };
}

class MediaStorageManager {
  private readonly config: MediaStorageConfig;
  private storageStructure: StorageStructure;
  private initialized = false;

  constructor(config?: Partial<MediaStorageConfig>) {
    this.config = {
      maxStorageSize: 5 * 1024 * 1024 * 1024, // 5GB default
      cleanupThreshold: 85, // Clean up when 85% full
      enableCache: true,
      cacheMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      ...config
    };

    // Initialize storage structure paths
    const baseDir = FileSystem.documentDirectory || '';

    this.storageStructure = {
      mediaLibrary: `${baseDir}/media_library`,
      images: {
        original: `${baseDir}/media_library/images/original`,
        optimized: `${baseDir}/media_library/images/optimized`,
        thumbnails: `${baseDir}/media_library/images/thumbnails`
      },
      categories: {
        logos: `${baseDir}/media_library/categories/logos`,
        backgrounds: `${baseDir}/media_library/categories/backgrounds`,
        overlays: `${baseDir}/media_library/categories/overlays`,
        custom: `${baseDir}/media_library/categories/custom`
      },
      cache: {
        processed: `${baseDir}/media_library/cache/processed`,
        previews: `${baseDir}/media_library/cache/previews`,
        temp: `${baseDir}/media_library/cache/temp`
      }
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Initialize database
      await AssetDatabase.initDatabase();

      // Create directory structure
      await this.createDirectoryStructure();

      // Perform cleanup if needed
      if (this.config.enableCache) {
        await this.performCleanupIfNeeded();
      }

      this.initialized = true;
      console.log('MediaStorageManager initialized successfully');
    } catch (error) {
      console.error('MediaStorageManager initialization failed:', error);
      throw error;
    }
  }

  private async createDirectoryStructure(): Promise<void> {
    const directories = [
      this.storageStructure.mediaLibrary,
      this.storageStructure.images.original,
      this.storageStructure.images.optimized,
      this.storageStructure.images.thumbnails,
      this.storageStructure.categories.logos,
      this.storageStructure.categories.backgrounds,
      this.storageStructure.categories.overlays,
      this.storageStructure.categories.custom,
      this.storageStructure.cache.processed,
      this.storageStructure.cache.previews,
      this.storageStructure.cache.temp
    ];

    for (const dir of directories) {
      try {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
          console.log(`Created directory: ${dir}`);
        }
      } catch (error) {
        console.error(`Failed to create directory ${dir}:`, error);
        throw error;
      }
    }
  }

  private generateFileName(originalName: string, format?: string): string {
    const timestamp = new Date().getTime();
    const random = Math.random().toString(36).substring(7);
    const ext = format || originalName.split('.').pop() || 'jpg';
    const baseName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '_');
    
    return `${baseName}_${timestamp}_${random}.${ext}`;
  }

  private async generateFileHash(filePath: string): Promise<string> {
    try {
      const fileData = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.Base64 });
      return CryptoJS.MD5(fileData).toString();
    } catch (error) {
      console.error('Error generating file hash:', error);
      return '';
    }
  }

  async storeFile(
    sourceUri: string,
    options: {
      originalName: string;
      category?: string;
      tags?: string[];
      generateThumbnail?: boolean;
      optimize?: boolean;
    }
  ): Promise<MediaAsset> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Generate unique filename
      const fileName = this.generateFileName(options.originalName);
      
      // Determine target directory based on category
      const categoryDir = options.category ? 
        this.storageStructure.categories[options.category as keyof typeof this.storageStructure.categories] || 
        this.storageStructure.categories.custom :
        this.storageStructure.images.original;

      const targetPath = `${categoryDir}/${fileName}`;

      // Copy file to storage
      await FileSystem.copyAsync({ from: sourceUri, to: targetPath });

      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(targetPath);
      const fileHash = await this.generateFileHash(targetPath);

      // Check for duplicates
      const existingAssets = await AssetDatabase.getAssets();
      const duplicate = existingAssets.find(asset => 
        asset.file_size === (fileInfo.size || 0) && 
        asset.filename === fileName
      );

      if (duplicate) {
        // Remove the new file and return existing asset
        await FileSystem.deleteAsync(targetPath);
        console.log('Duplicate file detected, using existing asset');
        return duplicate;
      }

      // Create database entry
      const asset: Omit<MediaAsset, 'id' | 'created_at'> = {
        filename: fileName,
        original_name: options.originalName,
        file_path: targetPath,
        file_size: fileInfo.size || 0,
        format: fileName.split('.').pop() || 'unknown',
        usage_count: 0,
        category: options.category || 'custom',
        tags: options.tags?.join(',') || '',
        is_favorite: false
      };

      // Get image dimensions if it's an image
      if (this.isImageFile(fileName)) {
        try {
          // This would require react-native-image-size or similar
          // For now, we'll set placeholder values
          asset.width = 0;
          asset.height = 0;
        } catch (error) {
          console.log('Could not get image dimensions:', error);
        }
      }

      const assetId = await AssetDatabase.insertAsset(asset);
      
      // Generate thumbnail if requested
      if (options.generateThumbnail && this.isImageFile(fileName)) {
        await this.generateThumbnail(targetPath, assetId);
      }

      // Optimize image if requested
      if (options.optimize && this.isImageFile(fileName)) {
        await this.optimizeImage(targetPath, assetId);
      }

      // Return the created asset with ID
      return {
        ...asset,
        id: assetId,
        created_at: fileInfo.modificationTime ? new Date(fileInfo.modificationTime * 1000).toISOString() : new Date().toISOString()
      };

    } catch (error) {
      console.error('Error storing file:', error);
      throw error;
    }
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic'];
    const ext = filename.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(ext || '');
  }

  private async generateThumbnail(originalPath: string, assetId: number): Promise<string> {
    try {
      const fileName = `thumb_${assetId}.jpg`;
      const thumbnailPath = `${this.storageStructure.images.thumbnails}/${fileName}`;

      // This would use react-native-image-resizer
      // For now, we'll copy the original as placeholder
      await FileSystem.copyAsync({ from: originalPath, to: thumbnailPath });

      return thumbnailPath;
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      throw error;
    }
  }

  private async optimizeImage(originalPath: string, assetId: number): Promise<string> {
    try {
      const fileName = `opt_${assetId}.jpg`;
      const optimizedPath = `${this.storageStructure.images.optimized}/${fileName}`;

      // This would use react-native-image-resizer for compression
      // For now, we'll copy the original as placeholder
      await FileSystem.copyAsync({ from: originalPath, to: optimizedPath });

      return optimizedPath;
    } catch (error) {
      console.error('Error optimizing image:', error);
      throw error;
    }
  }

  async deleteAsset(assetId: number): Promise<void> {
    try {
      const assets = await AssetDatabase.getAssets();
      const asset = assets.find(a => a.id === assetId);
      
      if (!asset) {
        throw new Error('Asset not found');
      }

      // Delete physical files
      const fileInfo = await FileSystem.getInfoAsync(asset.file_path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(asset.file_path);
      }

      // Delete thumbnail if exists
      const thumbnailPath = `${this.storageStructure.images.thumbnails}/thumb_${assetId}.jpg`;
      const thumbInfo = await FileSystem.getInfoAsync(thumbnailPath);
      if (thumbInfo.exists) {
        await FileSystem.deleteAsync(thumbnailPath);
      }

      // Delete optimized version if exists
      const optimizedPath = `${this.storageStructure.images.optimized}/opt_${assetId}.jpg`;
      const optInfo = await FileSystem.getInfoAsync(optimizedPath);
      if (optInfo.exists) {
        await FileSystem.deleteAsync(optimizedPath);
      }

      // Delete from database
      await AssetDatabase.deleteAsset(assetId);

      console.log(`Asset ${assetId} deleted successfully`);
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  }

  async getStorageUsage(): Promise<{
    used: number;
    available: number;
    percentage: number;
    breakdown: { [key: string]: number };
  }> {
    try {
      let totalUsed = 0;
      const breakdown: { [key: string]: number } = {};

      // Calculate usage for each directory
      const directories = [
        { name: 'Original Images', path: this.storageStructure.images.original },
        { name: 'Optimized Images', path: this.storageStructure.images.optimized },
        { name: 'Thumbnails', path: this.storageStructure.images.thumbnails },
        { name: 'Categories', path: this.storageStructure.categories.logos },
        { name: 'Cache', path: this.storageStructure.cache.processed }
      ];

      for (const dir of directories) {
        try {
          const size = await this.getDirectorySize(dir.path);
          breakdown[dir.name] = size;
          totalUsed += size;
        } catch (error) {
          breakdown[dir.name] = 0;
        }
      }

      const percentage = (totalUsed / this.config.maxStorageSize) * 100;

      return {
        used: totalUsed,
        available: this.config.maxStorageSize - totalUsed,
        percentage,
        breakdown
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      throw error;
    }
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) return 0;

      const items = await FileSystem.readDirectoryAsync(dirPath);
      let totalSize = 0;

      for (const itemName of items) {
        const itemPath = `${dirPath}/${itemName}`;
        const itemInfo = await FileSystem.getInfoAsync(itemPath);
        if (itemInfo.exists) {
          if (itemInfo.isDirectory) {
            totalSize += await this.getDirectorySize(itemPath);
          } else {
            totalSize += itemInfo.size || 0;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error(`Error calculating directory size for ${dirPath}:`, error);
      return 0;
    }
  }

  async performCleanupIfNeeded(): Promise<void> {
    try {
      const usage = await this.getStorageUsage();
      
      if (usage.percentage < this.config.cleanupThreshold) {
        return; // No cleanup needed
      }

      console.log(`Storage usage at ${usage.percentage.toFixed(1)}%, performing cleanup`);

      // Clean up temporary files
      await this.cleanupTempFiles();

      // Clean up old cache files
      await this.cleanupOldCache();

      // Clean up unused assets (if any)
      await this.cleanupUnusedAssets();

      console.log('Cleanup completed');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  private async cleanupTempFiles(): Promise<void> {
    try {
      const tempDir = this.storageStructure.cache.temp;
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(tempDir);
        for (const fileName of files) {
          await FileSystem.deleteAsync(`${tempDir}/${fileName}`);
        }
        console.log(`Cleaned up ${files.length} temporary files`);
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  private async cleanupOldCache(): Promise<void> {
    try {
      const cacheDir = this.storageStructure.cache.processed;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const cutoffTime = Date.now() - this.config.cacheMaxAge;
      let cleanedCount = 0;

      for (const fileName of files) {
        const filePath = `${cacheDir}/${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.modificationTime && fileInfo.modificationTime * 1000 < cutoffTime) {
          await FileSystem.deleteAsync(filePath);
          cleanedCount++;
        }
      }

      console.log(`Cleaned up ${cleanedCount} old cache files`);
    } catch (error) {
      console.error('Error cleaning up old cache:', error);
    }
  }

  private async cleanupUnusedAssets(): Promise<void> {
    try {
      // Get assets that haven't been used in 30 days
      const assets = await AssetDatabase.getAssets();
      const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days
      let cleanedCount = 0;

      for (const asset of assets) {
        const lastUsed = asset.last_used ? new Date(asset.last_used).getTime() : 0;
        
        if (lastUsed > 0 && lastUsed < cutoffTime && asset.usage_count === 0) {
          await this.deleteAsset(asset.id!);
          cleanedCount++;
        }
      }

      console.log(`Cleaned up ${cleanedCount} unused assets`);
    } catch (error) {
      console.error('Error cleaning up unused assets:', error);
    }
  }

  getStorageStructure(): StorageStructure {
    return this.storageStructure;
  }

  async getAssets(filter?: Parameters<typeof AssetDatabase.getAssets>[0]): Promise<MediaAsset[]> {
    return await AssetDatabase.getAssets(filter);
  }

  async updateAsset(id: number, updates: Partial<MediaAsset>): Promise<void> {
    return await AssetDatabase.updateAsset(id, updates);
  }

  async logAssetUsage(assetId: number, action: 'view' | 'use' | 'edit'): Promise<void> {
    return await AssetDatabase.logUsage(assetId, action);
  }

  async getStorageAnalytics(): Promise<ReturnType<typeof AssetDatabase.getStorageStats>> {
    return await AssetDatabase.getStorageStats();
  }
}

export default new MediaStorageManager();