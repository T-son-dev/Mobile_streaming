import { Platform, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export interface PermissionStatus {
  camera: boolean;
  microphone: boolean;
  mediaLibrary: boolean;
}

export interface PermissionResult {
  granted: boolean;
  status: PermissionStatus;
  message?: string;
}

class CameraPermissions {
  private static instance: CameraPermissions;

  public static getInstance(): CameraPermissions {
    if (!CameraPermissions.instance) {
      CameraPermissions.instance = new CameraPermissions();
    }
    return CameraPermissions.instance;
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      
      if (status === 'granted') {
        console.log('Camera permission granted');
        return true;
      } else {
        console.log('Camera permission denied');
        this.showPermissionDeniedAlert('camera');
        return false;
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const { status } = await Camera.requestMicrophonePermissionsAsync();
      
      if (status === 'granted') {
        console.log('Microphone permission granted');
        return true;
      } else {
        console.log('Microphone permission denied');
        this.showPermissionDeniedAlert('microphone');
        return false;
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  }

  async requestMediaLibraryPermission(): Promise<boolean> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status === 'granted') {
        console.log('Media library permission granted');
        return true;
      } else {
        console.log('Media library permission denied');
        this.showPermissionDeniedAlert('media library');
        return false;
      }
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  async requestAllPermissions(): Promise<PermissionResult> {
    try {
      console.log('Requesting all camera and media permissions...');

      const [cameraGranted, microphoneGranted, mediaLibraryGranted] = await Promise.all([
        this.requestCameraPermission(),
        this.requestMicrophonePermission(),
        this.requestMediaLibraryPermission()
      ]);

      const status: PermissionStatus = {
        camera: cameraGranted,
        microphone: microphoneGranted,
        mediaLibrary: mediaLibraryGranted
      };

      const allGranted = cameraGranted && microphoneGranted && mediaLibraryGranted;

      if (allGranted) {
        return {
          granted: true,
          status,
          message: 'All permissions granted successfully'
        };
      } else {
        const deniedPermissions = [];
        if (!cameraGranted) deniedPermissions.push('Camera');
        if (!microphoneGranted) deniedPermissions.push('Microphone');
        if (!mediaLibraryGranted) deniedPermissions.push('Media Library');

        return {
          granted: false,
          status,
          message: `Permissions denied: ${deniedPermissions.join(', ')}`
        };
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return {
        granted: false,
        status: { camera: false, microphone: false, mediaLibrary: false },
        message: 'Error occurred while requesting permissions'
      };
    }
  }

  async checkPermissionStatus(): Promise<PermissionStatus> {
    try {
      const [cameraStatus, microphoneStatus, mediaLibraryStatus] = await Promise.all([
        Camera.getCameraPermissionsAsync(),
        Camera.getMicrophonePermissionsAsync(),
        MediaLibrary.getPermissionsAsync()
      ]);

      return {
        camera: cameraStatus.status === 'granted',
        microphone: microphoneStatus.status === 'granted',
        mediaLibrary: mediaLibraryStatus.status === 'granted'
      };
    } catch (error) {
      console.error('Error checking permission status:', error);
      return { camera: false, microphone: false, mediaLibrary: false };
    }
  }

  async hasRequiredPermissions(): Promise<boolean> {
    const status = await this.checkPermissionStatus();
    return status.camera && status.microphone;
  }

  private showPermissionDeniedAlert(permissionType: string): void {
    Alert.alert(
      'Permission Required',
      `${permissionType.charAt(0).toUpperCase() + permissionType.slice(1)} permission is required for streaming. Please enable it in your device settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => this.openSettings() }
      ]
    );
  }

  private openSettings(): void {
    if (Platform.OS === 'ios') {
      // On iOS, we can't directly open app settings, but we can guide the user
      Alert.alert(
        'Open Settings',
        'Please go to Settings > Privacy & Security > Camera/Microphone to enable permissions for this app.',
        [{ text: 'OK' }]
      );
    } else {
      // On Android, we could potentially open app settings
      Alert.alert(
        'Open Settings',
        'Please go to App Settings > Permissions to enable Camera and Microphone permissions.',
        [{ text: 'OK' }]
      );
    }
  }

  async ensurePermissions(): Promise<boolean> {
    console.log('Ensuring all required permissions are granted...');

    const hasPermissions = await this.hasRequiredPermissions();
    if (hasPermissions) {
      console.log('All required permissions already granted');
      return true;
    }

    console.log('Requesting missing permissions...');
    const result = await this.requestAllPermissions();
    
    if (result.granted) {
      console.log('All permissions successfully granted');
      return true;
    } else {
      console.error('Failed to obtain required permissions:', result.message);
      Alert.alert(
        'Permissions Required',
        'Camera and microphone permissions are required for streaming. Please grant these permissions to continue.',
        [{ text: 'OK' }]
      );
      return false;
    }
  }
}

export const cameraPermissions = CameraPermissions.getInstance();
export default cameraPermissions;