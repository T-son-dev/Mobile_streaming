import ImageResizer from 'react-native-image-resizer';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  format: string;
  size: number;
  dimensions: ImageDimensions;
  colorSpace?: string;
  hasAlpha?: boolean;
  orientation?: number;
  exif?: { [key: string]: any };
}

export interface CompressionOptions {
  quality: number; // 0-100
  maxWidth?: number;
  maxHeight?: number;
  format?: 'JPEG' | 'PNG' | 'WEBP';
  maintainAspectRatio?: boolean;
  progressive?: boolean;
}

export interface ThumbnailOptions {
  width: number;
  height: number;
  quality?: number;
  crop?: boolean;
  format?: 'JPEG' | 'PNG' | 'WEBP';
}

export interface ProcessingResult {
  success: boolean;
  outputPath?: string;
  originalSize?: number;
  processedSize?: number;
  compressionRatio?: number;
  error?: string;
  metadata?: ImageMetadata;
}

class ImageProcessor {
  private readonly supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'heic'];
  private readonly tempDir: string;

  constructor() {
    this.tempDir = FileSystem.cacheDirectory || '';
  }

  // Smart compression with quality preservation
  async compressImage(
    inputPath: string,
    outputPath: string,
    options: CompressionOptions = { quality: 80 }
  ): Promise<ProcessingResult> {
    try {
      const originalStats = await FileSystem.getInfoAsync(inputPath);
      const originalSize = originalStats.size || 0;

      // Get image metadata first
      const metadata = await this.extractMetadata(inputPath);
      
      // Determine optimal compression settings
      const compressionSettings = this.calculateOptimalCompression(metadata, options);

      const result = await ImageResizer.createResizedImage(
        inputPath,
        compressionSettings.maxWidth || metadata.dimensions.width,
        compressionSettings.maxHeight || metadata.dimensions.height,
        compressionSettings.format || 'JPEG',
        compressionSettings.quality,
        0, // rotation
        outputPath.replace(/\.[^/.]+$/, ''), // Remove extension, ImageResizer adds it
        false, // keepMeta
        {
          mode: options.maintainAspectRatio !== false ? 'contain' : 'cover',
          onlyScaleDown: true
        }
      );

      const processedStats = await FileSystem.getInfoAsync(result.path);
      const processedSize = processedStats.size || 0;
      const compressionRatio = ((originalSize - processedSize) / originalSize) * 100;

      return {
        success: true,
        outputPath: result.path,
        originalSize,
        processedSize,
        compressionRatio,
        metadata
      };

    } catch (error) {
      console.error('Image compression failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate multiple thumbnail sizes
  async generateThumbnails(
    inputPath: string,
    outputDir: string,
    sizes: ThumbnailOptions[] = [
      { width: 150, height: 150, quality: 85 },
      { width: 300, height: 300, quality: 90 },
      { width: 600, height: 600, quality: 95 }
    ]
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const size of sizes) {
      try {
        const filename = `thumb_${size.width}x${size.height}.jpg`;
        const outputPath = `${outputDir}/${filename}`;

        const result = await ImageResizer.createResizedImage(
          inputPath,
          size.width,
          size.height,
          size.format || 'JPEG',
          size.quality || 85,
          0, // rotation
          outputPath.replace(/\.[^/.]+$/, ''),
          false, // keepMeta
          {
            mode: size.crop ? 'cover' : 'contain',
            onlyScaleDown: false
          }
        );

        const originalStats = await FileSystem.getInfoAsync(inputPath);
        const processedStats = await FileSystem.getInfoAsync(result.path);

        results.push({
          success: true,
          outputPath: result.path,
          originalSize: originalStats.size || 0,
          processedSize: processedStats.size || 0,
          compressionRatio: ((originalStats.size || 0 - processedStats.size || 0) / originalStats.size || 0) * 100
        });

      } catch (error) {
        console.error(`Thumbnail generation failed for ${size.width}x${size.height}:`, error);
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Format conversion with optimization
  async convertFormat(
    inputPath: string,
    outputPath: string,
    targetFormat: 'JPEG' | 'PNG' | 'WEBP',
    options: { quality?: number; preserveMetadata?: boolean } = {}
  ): Promise<ProcessingResult> {
    try {
      const originalStats = await FileSystem.getInfoAsync(inputPath);
      const metadata = await this.extractMetadata(inputPath);

      // Determine optimal quality based on format
      let quality = options.quality || 90;
      if (targetFormat === 'JPEG' && quality > 95) quality = 95;
      if (targetFormat === 'PNG') quality = 100; // PNG is lossless
      if (targetFormat === 'WEBP' && quality > 90) quality = 90;

      const result = await ImageResizer.createResizedImage(
        inputPath,
        metadata.dimensions.width,
        metadata.dimensions.height,
        targetFormat,
        quality,
        0, // rotation
        outputPath.replace(/\.[^/.]+$/, ''),
        options.preserveMetadata || false
      );

      const processedStats = await FileSystem.getInfoAsync(result.path);
      const compressionRatio = ((originalStats.size || 0 - processedStats.size || 0) / originalStats.size || 0) * 100;

      return {
        success: true,
        outputPath: result.path,
        originalSize: originalStats.size || 0,
        processedSize: processedStats.size || 0,
        compressionRatio,
        metadata
      };

    } catch (error) {
      console.error('Format conversion failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Extract comprehensive image metadata
  async extractMetadata(imagePath: string): Promise<ImageMetadata> {
    try {
      const stats = await FileSystem.getInfoAsync(imagePath);
      const extension = imagePath.split('.').pop()?.toLowerCase() || 'unknown';
      
      // For now, we'll use ImageResizer to get basic dimensions
      // In a real implementation, you might use react-native-image-size or similar
      let dimensions: ImageDimensions = { width: 0, height: 0 };
      
      try {
        // This is a workaround - create a temporary resized image to get dimensions
        const tempPath = `${this.tempDir}/temp_metadata_${Date.now()}.jpg`;
        const result = await ImageResizer.createResizedImage(
          imagePath,
          2000, // Large size to avoid scaling
          2000,
          'JPEG',
          10, // Low quality for metadata extraction
          0,
          tempPath.replace(/\.[^/.]+$/, ''),
          false
        );
        
        dimensions.width = result.width;
        dimensions.height = result.height;
        
        // Clean up temp file
        await FileSystem.deleteAsync(result.path);
      } catch (error) {
        console.log('Could not extract dimensions:', error);
      }

      return {
        format: extension,
        size: stats.size || 0,
        dimensions,
        colorSpace: 'sRGB', // Default assumption
        hasAlpha: extension === 'png',
        orientation: 1, // Default orientation
        // EXIF data would require additional library
        exif: {}
      };

    } catch (error) {
      console.error('Metadata extraction failed:', error);
      throw error;
    }
  }

  // Optimize image based on content analysis
  async smartOptimize(
    inputPath: string,
    outputPath: string,
    targetSizeKB?: number
  ): Promise<ProcessingResult> {
    try {
      const metadata = await this.extractMetadata(inputPath);
      
      // Analyze image characteristics
      const isLargeImage = metadata.dimensions.width > 2000 || metadata.dimensions.height > 2000;
      const isSmallFile = metadata.size || 0 < 500 * 1024; // 500KB
      const hasAlpha = metadata.hasAlpha;

      // Determine optimal settings
      let options: CompressionOptions = {
        quality: 85,
        maintainAspectRatio: true
      };

      if (targetSizeKB) {
        // Calculate quality to achieve target size (rough estimation)
        const currentSizeKB = metadata.size || 0 / 1024;
        const ratio = targetSizeKB / currentSizeKB;
        options.quality = Math.max(30, Math.min(95, Math.round(85 * ratio)));
      }

      if (isLargeImage) {
        // Reduce dimensions for very large images
        options.maxWidth = 1920;
        options.maxHeight = 1080;
        options.quality = Math.max(options.quality - 10, 70);
      }

      if (isSmallFile) {
        // High quality for small files
        options.quality = Math.min(95, options.quality + 10);
      }

      if (hasAlpha) {
        // Use PNG for images with transparency
        options.format = 'PNG';
        options.quality = 100;
      } else {
        // Use JPEG for photos
        options.format = 'JPEG';
      }

      return await this.compressImage(inputPath, outputPath, options);

    } catch (error) {
      console.error('Smart optimization failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Batch processing for multiple images
  async batchProcess(
    inputPaths: string[],
    outputDir: string,
    operation: 'compress' | 'thumbnail' | 'convert' | 'optimize',
    options: any = {}
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];

    for (const inputPath of inputPaths) {
      try {
        const filename = inputPath.split('/').pop() || 'unknown';
        const baseName = filename.split('.')[0];
        const outputPath = `${outputDir}/${baseName}_processed.jpg`;

        let result: ProcessingResult;

        switch (operation) {
          case 'compress':
            result = await this.compressImage(inputPath, outputPath, options);
            break;
          case 'thumbnail':
            const thumbnailResults = await this.generateThumbnails(inputPath, outputDir, options.size || 0s);
            result = thumbnailResults[0] || { success: false, error: 'No thumbnails generated' };
            break;
          case 'convert':
            result = await this.convertFormat(inputPath, outputPath, options.format, options);
            break;
          case 'optimize':
            result = await this.smartOptimize(inputPath, outputPath, options.targetSizeKB);
            break;
          default:
            result = { success: false, error: 'Unknown operation' };
        }

        results.push(result);

      } catch (error) {
        console.error(`Batch processing failed for ${inputPath}:`, error);
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Image validation and security scanning
  async validateImage(imagePath: string): Promise<{
    isValid: boolean;
    issues: string[];
    metadata?: ImageMetadata;
  }> {
    const issues: string[] = [];
    let isValid = true;

    try {
      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imagePath);
      const exists = fileInfo.exists;
      if (!exists) {
        issues.push('File does not exist');
        isValid = false;
        return { isValid, issues };
      }

      // Check file extension
      const extension = imagePath.split('.').pop()?.toLowerCase() || '';
      if (!this.supportedFormats.includes(extension)) {
        issues.push(`Unsupported format: ${extension}`);
        isValid = false;
      }

      // Extract metadata to validate image structure
      const metadata = await this.extractMetadata(imagePath);

      // Check file size limits (100MB max)
      const maxSize = 100 * 1024 * 1024;
      if (metadata.size || 0 > maxSize) {
        issues.push(`File too large: ${(metadata.size || 0 / 1024 / 1024).toFixed(1)}MB (max: 100MB)`);
        isValid = false;
      }

      // Check dimensions
      if (metadata.dimensions.width === 0 || metadata.dimensions.height === 0) {
        issues.push('Invalid image dimensions');
        isValid = false;
      }

      // Check for extremely large dimensions
      const maxDimension = 10000;
      if (metadata.dimensions.width > maxDimension || metadata.dimensions.height > maxDimension) {
        issues.push(`Image dimensions too large: ${metadata.dimensions.width}x${metadata.dimensions.height}`);
        isValid = false;
      }

      return { isValid, issues, metadata };

    } catch (error) {
      console.error('Image validation failed:', error);
      return {
        isValid: false,
        issues: [`Validation error: ${error.message}`]
      };
    }
  }

  // Calculate optimal compression settings based on image characteristics
  private calculateOptimalCompression(
    metadata: ImageMetadata,
    options: CompressionOptions
  ): CompressionOptions {
    const settings = { ...options };

    // Adjust quality based on image size
    if (metadata.size || 0 > 10 * 1024 * 1024) { // > 10MB
      settings.quality = Math.min(settings.quality, 75);
    } else if (metadata.size || 0 > 5 * 1024 * 1024) { // > 5MB
      settings.quality = Math.min(settings.quality, 80);
    }

    // Adjust dimensions for very large images
    const maxDimension = Math.max(metadata.dimensions.width, metadata.dimensions.height);
    if (maxDimension > 3000) {
      const scaleFactor = 2000 / maxDimension;
      settings.maxWidth = Math.round(metadata.dimensions.width * scaleFactor);
      settings.maxHeight = Math.round(metadata.dimensions.height * scaleFactor);
    }

    // Use PNG for images with transparency, JPEG for photos
    if (!settings.format) {
      settings.format = metadata.hasAlpha ? 'PNG' : 'JPEG';
    }

    return settings;
  }

  // Utility methods
  isImageFile(filePath: string): boolean {
    const extension = filePath.split('.').pop()?.toLowerCase() || '';
    return this.supportedFormats.includes(extension);
  }

  getSupportedFormats(): string[] {
    return [...this.supportedFormats];
  }

  // Clean up temporary files
  async cleanupTempFiles(): Promise<void> {
    try {
      const files = await FileSystem.readDirectoryAsync(this.tempDir);
      const tempImageFiles = files.filter(fileName => 
        fileName.startsWith('temp_') && this.isImageFile(fileName)
      );

      for (const fileName of tempImageFiles) {
        try {
          const filePath = `${this.tempDir}${fileName}`;
          await FileSystem.deleteAsync(filePath);
        } catch (error) {
          console.log(`Could not delete temp file ${fileName}:`, error);
        }
      }

      console.log(`Cleaned up ${tempImageFiles.length} temporary image files`);
    } catch (error) {
      console.error('Temp file cleanup failed:', error);
    }
  }
}

export default new ImageProcessor();