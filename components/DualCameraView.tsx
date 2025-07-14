import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { dualCameraManager, CameraLayout, DualCameraState } from '../services/DualCameraManager';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DualCameraViewProps {
  layout: CameraLayout;
  onLayoutChange?: (layout: CameraLayout) => void;
  onCameraSwitch?: () => void;
  style?: any;
}

const DualCameraView: React.FC<DualCameraViewProps> = ({
  layout,
  onLayoutChange,
  onCameraSwitch,
  style
}) => {
  const frontCameraRef = useRef<CameraView>(null);
  const backCameraRef = useRef<CameraView>(null);
  const [cameraState, setCameraState] = useState<DualCameraState>(() => {
    const state = dualCameraManager.getState();
    // Ensure cameras are properly initialized
    if (!state.frontCamera || !state.backCamera) {
      return {
        frontCamera: {
          id: 'front',
          type: 'front' as CameraType,
          isActive: false,
          ref: null,
          zoom: 1.0,
          flashMode: 'off' as any
        },
        backCamera: {
          id: 'back',
          type: 'back' as CameraType,
          isActive: false,
          ref: null,
          zoom: 1.0,
          flashMode: 'off' as any
        },
        layout: CameraLayout.SINGLE_BACK,
        resolution: 'MEDIUM' as any,
        isRecording: false,
        isInitialized: false,
        error: null
      };
    }
    return state;
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = dualCameraManager.subscribe((state) => {
      // Ensure state has proper camera objects before setting
      if (state && state.frontCamera && state.backCamera) {
        setCameraState(state);
      }
    });

    initializeCameras();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isInitialized && layout !== cameraState.layout) {
      dualCameraManager.setCameraLayout(layout);
    }
  }, [layout, isInitialized, cameraState.layout]);

  const initializeCameras = async () => {
    try {
      const success = await dualCameraManager.initialize();
      if (success) {
        setIsInitialized(true);
      } else {
        Alert.alert('Error', 'Failed to initialize cameras');
      }
    } catch (error) {
      console.error('Camera initialization error:', error);
      Alert.alert('Error', 'Camera initialization failed');
    }
  };

  const handleCameraSwitch = () => {
    dualCameraManager.switchCamera();
    onCameraSwitch?.();
  };

  const renderSingleCamera = (cameraType: CameraType) => {
    const isActive = cameraType === 'front' 
      ? cameraState.frontCamera?.isActive 
      : cameraState.backCamera?.isActive;

    if (!isActive) return null;

    const cameraRef = cameraType === 'front' ? frontCameraRef : backCameraRef;
    const cameraDevice = cameraType === 'front' 
      ? cameraState.frontCamera 
      : cameraState.backCamera;

    return (
      <CameraView
        ref={cameraRef}
        style={styles.fullCamera}
        facing={cameraType}
        flash={cameraDevice?.flashMode || 'off'}
        zoom={cameraDevice?.zoom || 1.0}
        onCameraReady={() => console.log(`${cameraType} camera ready`)}
        onMountError={(error: any) => console.error(`${cameraType} camera mount error:`, error)}
      />
    );
  };

  const renderPiPLayout = () => {
    return (
      <View style={styles.pipContainer}>
        {/* Main camera (back) */}
        <CameraView
          ref={backCameraRef}
          style={styles.fullCamera}
          facing="back"
          flash={cameraState.backCamera?.flashMode || 'off'}
          zoom={cameraState.backCamera?.zoom || 1.0}
          onCameraReady={() => console.log('Back camera ready')}
          onMountError={(error: any) => console.error('Back camera mount error:', error)}
        />
        
        {/* Picture-in-picture camera (front) */}
        <View style={styles.pipWindow}>
          <CameraView
            ref={frontCameraRef}
            style={styles.pipCamera}
            facing="front"
            flash={cameraState.frontCamera?.flashMode || 'off'}
            zoom={cameraState.frontCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Front camera ready')}
            onMountError={(error: any) => console.error('Front camera mount error:', error)}
          />
        </View>

        {/* Layout switch button */}
        <TouchableOpacity 
          style={styles.layoutSwitchButton} 
          onPress={() => onLayoutChange?.(CameraLayout.SPLIT)}
        >
          <View style={styles.layoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSplitLayout = () => {
    return (
      <View style={styles.splitContainer}>
        {/* Top camera (back) */}
        <View style={styles.splitTop}>
          <CameraView
            ref={backCameraRef}
            style={styles.splitCamera}
            facing="back"
            flash={cameraState.backCamera?.flashMode || 'off'}
            zoom={cameraState.backCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Back camera ready')}
            onMountError={(error: any) => console.error('Back camera mount error:', error)}
          />
        </View>

        {/* Divider */}
        <View style={styles.splitDivider} />

        {/* Bottom camera (front) */}
        <View style={styles.splitBottom}>
          <CameraView
            ref={frontCameraRef}
            style={styles.splitCamera}
            facing="front"
            flash={cameraState.frontCamera?.flashMode || 'off'}
            zoom={cameraState.frontCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Front camera ready')}
            onMountError={(error: any) => console.error('Front camera mount error:', error)}
          />
        </View>

        {/* Layout switch button */}
        <TouchableOpacity 
          style={styles.layoutSwitchButton} 
          onPress={() => onLayoutChange?.(CameraLayout.OVERLAY)}
        >
          <View style={styles.layoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderOverlayLayout = () => {
    return (
      <View style={styles.overlayContainer}>
        {/* Background camera (back) */}
        <CameraView
          ref={backCameraRef}
          style={styles.fullCamera}
          facing="back"
          flash={cameraState.backCamera?.flashMode || 'off'}
          zoom={cameraState.backCamera?.zoom || 1.0}
          onCameraReady={() => console.log('Back camera ready')}
          onMountError={(error: any) => console.error('Back camera mount error:', error)}
        />
        
        {/* Overlay camera (front) with transparency */}
        <View style={styles.overlayFront}>
          <CameraView
            ref={frontCameraRef}
            style={styles.overlayCamera}
            facing="front"
            flash={cameraState.frontCamera?.flashMode || 'off'}
            zoom={cameraState.frontCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Front camera ready')}
            onMountError={(error: any) => console.error('Front camera mount error:', error)}
          />
        </View>

        {/* Layout switch button */}
        <TouchableOpacity 
          style={styles.layoutSwitchButton} 
          onPress={() => onLayoutChange?.(CameraLayout.PIP)}
        >
          <View style={styles.layoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCameraContent = () => {
    if (!isInitialized) {
      return <View style={styles.placeholder} />;
    }

    switch (layout) {
      case CameraLayout.SINGLE_FRONT:
        return renderSingleCamera('front');
      case CameraLayout.SINGLE_BACK:
        return renderSingleCamera('back');
      case CameraLayout.PIP:
        return renderPiPLayout();
      case CameraLayout.SPLIT:
        return renderSplitLayout();
      case CameraLayout.OVERLAY:
        return renderOverlayLayout();
      default:
        return renderSingleCamera('back');
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderCameraContent()}
      
      {/* Camera switch button for single camera layouts */}
      {(layout === 'single_front' || layout === 'single_back') && (
        <TouchableOpacity 
          style={styles.cameraSwitchButton} 
          onPress={handleCameraSwitch}
        >
          <View style={styles.switchIcon} />
        </TouchableOpacity>
      )}

      {/* Error indicator */}
      {cameraState.error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorIndicator} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#333',
  },
  fullCamera: {
    flex: 1,
  },
  
  // PiP Layout Styles
  pipContainer: {
    flex: 1,
    position: 'relative',
  },
  pipWindow: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 120,
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  pipCamera: {
    flex: 1,
  },
  
  // Split Layout Styles
  splitContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  splitTop: {
    flex: 1,
  },
  splitBottom: {
    flex: 1,
  },
  splitCamera: {
    flex: 1,
  },
  splitDivider: {
    height: 2,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // Overlay Layout Styles
  overlayContainer: {
    flex: 1,
    position: 'relative',
  },
  overlayFront: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: screenWidth * 0.4,
    height: screenHeight * 0.3,
    borderRadius: 12,
    overflow: 'hidden',
    opacity: 0.8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  overlayCamera: {
    flex: 1,
  },
  
  // Control Buttons
  layoutSwitchButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  layoutIcon: {
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  cameraSwitchButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  switchIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  
  // Error States
  errorOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
  },
  errorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
  },
});

export default DualCameraView;