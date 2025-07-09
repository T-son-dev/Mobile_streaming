import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    PermissionsAndroid,
    Platform,
    StyleSheet,
    View
} from 'react-native';

export type CameraLayout = 'pip' | 'split' | 'overlay' | 'single';

export interface DualCameraConfig {
  layout: CameraLayout;
  primaryCamera: CameraType;
  secondaryCamera: CameraType;
  resolution: string;
  fps: number;
}

interface DualCameraManagerProps {
  config: DualCameraConfig;
  onCameraReady: (cameras: { primary: any; secondary?: any }) => void;
  onError: (error: string) => void;
}

const { width, height } = Dimensions.get('window');

const DualCameraManager: React.FC<DualCameraManagerProps> = ({
  config,
  onCameraReady,
  onError,
}) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isPrimaryReady, setIsPrimaryReady] = useState(false);
  const [isSecondaryReady, setIsSecondaryReady] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  
  const primaryCameraRef = useRef<any>(null);
  const secondaryCameraRef = useRef<any>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  useEffect(() => {
    if (isPrimaryReady && (config.layout === 'single' || isSecondaryReady)) {
      onCameraReady({
        primary: primaryCameraRef.current,
        secondary: config.layout !== 'single' ? secondaryCameraRef.current : undefined,
      });
    }
  }, [isPrimaryReady, isSecondaryReady, config.layout]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);
        
        const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === 'granted';
        const audioGranted = granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted';
        
        if (!cameraGranted || !audioGranted) {
          onError('Camera and microphone permissions are required');
          return;
        }
      } else {
        if (!cameraPermission?.granted) {
          const permission = await requestCameraPermission();
          if (!permission.granted) {
            onError('Camera permission is required');
            return;
          }
        }
      }
      
      setHasPermission(true);
    } catch (error) {
      onError('Failed to request permissions');
    }
  };

  const getLayoutStyles = () => {
    switch (config.layout) {
      case 'pip':
        return {
          primary: styles.primaryPiP,
          secondary: styles.secondaryPiP,
        };
      case 'split':
        return {
          primary: styles.primarySplit,
          secondary: styles.secondarySplit,
        };
      case 'overlay':
        return {
          primary: styles.primaryOverlay,
          secondary: styles.secondaryOverlay,
        };
      default:
        return {
          primary: styles.primarySingle,
          secondary: null,
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  if (!hasPermission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {/* Primary Camera */}
      <CameraView
        ref={primaryCameraRef}
        style={[styles.camera, layoutStyles.primary]}
        facing={config.primaryCamera}
        onCameraReady={() => setIsPrimaryReady(true)}
      />

      {/* Secondary Camera (if not single layout) */}
      {config.layout !== 'single' && layoutStyles.secondary && (
        <CameraView
          ref={secondaryCameraRef}
          style={[styles.camera, layoutStyles.secondary]}
          facing={config.secondaryCamera}
          onCameraReady={() => setIsSecondaryReady(true)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    position: 'absolute',
  },
  
  // Single Camera Layout
  primarySingle: {
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  
  // Picture-in-Picture Layout
  primaryPiP: {
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  secondaryPiP: {
    top: 20,
    right: 20,
    width: width * 0.25,
    height: height * 0.25,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ff88',
    zIndex: 10,
  },
  
  // Split Screen Layout
  primarySplit: {
    top: 0,
    left: 0,
    width: width * 0.5,
    height: height,
  },
  secondarySplit: {
    top: 0,
    right: 0,
    width: width * 0.5,
    height: height,
  },
  
  // Overlay Layout
  primaryOverlay: {
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  secondaryOverlay: {
    top: height * 0.6,
    left: 20,
    width: width * 0.35,
    height: height * 0.35,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ff88',
    opacity: 0.9,
    zIndex: 10,
  },
});

export default DualCameraManager;