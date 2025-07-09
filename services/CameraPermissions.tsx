import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Linking, Platform } from 'react-native';

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  mediaLibrary: boolean;
}

class CameraPermissionsService {
  private permissionStatus: PermissionStatus = {
    camera: false,
    microphone: false,
    mediaLibrary: false,
  };

  async requestAllPermissions(): Promise<PermissionStatus> {
    try {
      console.log('Requesting camera and microphone permissions...');

      // Request camera permissions
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      this.permissionStatus.camera = cameraPermission.status === 'granted';

      // Request microphone permissions (usually included with camera on mobile)
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      this.permissionStatus.microphone = microphonePermission.status === 'granted';

      // Request media library permissions (for saving recordings)
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();
      this.permissionStatus.mediaLibrary = mediaLibraryPermission.status === 'granted';

      console.log('Permission status:', this.permissionStatus);

      // Check if all required permissions are granted
      if (!this.permissionStatus.camera || !this.permissionStatus.microphone) {
        this.showPermissionDeniedAlert();
        return this.permissionStatus;
      }

      return this.permissionStatus;

    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert(
        'Permission Error',
        'Failed to request permissions. Please enable camera and microphone access in device settings.'
      );
      return this.permissionStatus;
    }
  }

  async checkPermissions(): Promise<PermissionStatus> {
    try {
      // Check camera permissions
      const cameraPermission = await Camera.getCameraPermissionsAsync();
      this.permissionStatus.camera = cameraPermission.status === 'granted';

      // Check microphone permissions
      const microphonePermission = await Camera.getMicrophonePermissionsAsync();
      this.permissionStatus.microphone = microphonePermission.status === 'granted';

      // Check media library permissions
      const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync();
      this.permissionStatus.mediaLibrary = mediaLibraryPermission.status === 'granted';

      return this.permissionStatus;

    } catch (error) {
      console.error('Error checking permissions:', error);
      return this.permissionStatus;
    }
  }

  private showPermissionDeniedAlert(): void {
    Alert.alert(
      'Permissions Required',
      'This app requires camera and microphone access to function properly. Please enable these permissions in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: this.openAppSettings,
        },
      ]
    );
  }

  private openAppSettings = (): void => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  getCurrentStatus(): PermissionStatus {
    return this.permissionStatus;
  }

  hasRequiredPermissions(): boolean {
    return this.permissionStatus.camera && this.permissionStatus.microphone;
  }

  hasCameraPermission(): boolean {
    return this.permissionStatus.camera;
  }

  hasMicrophonePermission(): boolean {
    return this.permissionStatus.microphone;
  }

  hasMediaLibraryPermission(): boolean {
    return this.permissionStatus.mediaLibrary;
  }

  // Method to handle permission changes during app lifecycle
  async refreshPermissions(): Promise<PermissionStatus> {
    return await this.checkPermissions();
  }

  // Show specific permission request dialog
  showCameraPermissionRequest(): void {
    Alert.alert(
      'Camera Access Required',
      'To use the dual camera streaming feature, please grant camera access when prompted.',
      [
        {
          text: 'Continue',
          onPress: () => this.requestAllPermissions(),
        },
      ]
    );
  }

  showMicrophonePermissionRequest(): void {
    Alert.alert(
      'Microphone Access Required',
      'To stream audio, please grant microphone access when prompted.',
      [
        {
          text: 'Continue',
          onPress: () => this.requestAllPermissions(),
        },
      ]
    );
  }

  // Handle permission denial scenarios
  handlePermissionDenial(permissionType: 'camera' | 'microphone' | 'both'): void {
    let title = '';
    let message = '';

    switch (permissionType) {
      case 'camera':
        title = 'Camera Access Denied';
        message = 'Camera access is required for streaming. You can enable it in device settings.';
        break;
      case 'microphone':
        title = 'Microphone Access Denied';
        message = 'Microphone access is required for audio streaming. You can enable it in device settings.';
        break;
      case 'both':
        title = 'Permissions Denied';
        message = 'Camera and microphone access are required for streaming. You can enable them in device settings.';
        break;
    }

    Alert.alert(
      title,
      message,
      [
        { text: 'Later', style: 'cancel' },
        { text: 'Settings', onPress: this.openAppSettings },
      ]
    );
  }

  // Permission request with retry logic
  async requestPermissionsWithRetry(maxRetries: number = 2): Promise<boolean> {
    let attempts = 0;

    while (attempts < maxRetries) {
      const permissions = await this.requestAllPermissions();
      
      if (this.hasRequiredPermissions()) {
        return true;
      }

      attempts++;
      
      if (attempts < maxRetries) {
        await new Promise(resolve => {
          Alert.alert(
            'Permissions Required',
            'Some permissions were not granted. Would you like to try again?',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Retry', onPress: () => resolve(true) },
            ]
          );
        });
      }
    }

    // Final attempt failed
    this.handlePermissionDenial('both');
    return false;
  }
}

export const cameraPermissionsService = new CameraPermissionsService();
export default cameraPermissionsService;