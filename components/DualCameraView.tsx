import { CameraType, CameraView } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraLayout, dualCameraManager, DualCameraState } from '../services/DualCameraManager';
import { useResponsive } from '../utils/responsive';

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
  const responsive = useResponsive();
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
    const responsiveStyles = createResponsiveStyles(responsive);
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
        style={responsiveStyles.fullCamera}
        facing={cameraType}
        flash={cameraDevice?.flashMode || 'off'}
        zoom={cameraDevice?.zoom || 1.0}
        onCameraReady={() => console.log(`${cameraType} camera ready`)}
        onMountError={(error: any) => console.error(`${cameraType} camera mount error:`, error)}
      />
    );
  };

  const renderPiPLayout = () => {
    const responsiveStyles = createResponsiveStyles(responsive);
    return (
      <View style={responsiveStyles.pipContainer}>
        {/* Main camera (back) */}
        <CameraView
          ref={backCameraRef}
          style={responsiveStyles.fullCamera}
          facing="back"
          flash={cameraState.backCamera?.flashMode || 'off'}
          zoom={cameraState.backCamera?.zoom || 1.0}
          onCameraReady={() => console.log('Back camera ready')}
          onMountError={(error: any) => console.error('Back camera mount error:', error)}
        />
        
        {/* Picture-in-picture camera (front) */}
        <View style={responsiveStyles.pipWindow}>
          <CameraView
            ref={frontCameraRef}
            style={responsiveStyles.pipCamera}
            facing="front"
            flash={cameraState.frontCamera?.flashMode || 'off'}
            zoom={cameraState.frontCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Front camera ready')}
            onMountError={(error: any) => console.error('Front camera mount error:', error)}
          />
        </View>

        {/* Layout switch button */}
        <TouchableOpacity 
          style={responsiveStyles.layoutSwitchButton} 
          onPress={() => onLayoutChange?.(CameraLayout.SPLIT)}
        >
          <View style={responsiveStyles.layoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderSplitLayout = () => {
    const responsiveStyles = createResponsiveStyles(responsive);
    return (
      <View style={responsiveStyles.splitContainer}>
        {/* Top camera (back) */}
        <View style={responsiveStyles.splitTop}>
          <CameraView
            ref={backCameraRef}
            style={responsiveStyles.splitCamera}
            facing="back"
            flash={cameraState.backCamera?.flashMode || 'off'}
            zoom={cameraState.backCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Back camera ready')}
            onMountError={(error: any) => console.error('Back camera mount error:', error)}
          />
        </View>

        {/* Divider */}
        <View style={responsiveStyles.splitDivider} />

        {/* Bottom camera (front) */}
        <View style={responsiveStyles.splitBottom}>
          <CameraView
            ref={frontCameraRef}
            style={responsiveStyles.splitCamera}
            facing="front"
            flash={cameraState.frontCamera?.flashMode || 'off'}
            zoom={cameraState.frontCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Front camera ready')}
            onMountError={(error: any) => console.error('Front camera mount error:', error)}
          />
        </View>

        {/* Layout switch button */}
        <TouchableOpacity 
          style={responsiveStyles.layoutSwitchButton} 
          onPress={() => onLayoutChange?.(CameraLayout.OVERLAY)}
        >
          <View style={responsiveStyles.layoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderOverlayLayout = () => {
    const responsiveStyles = createResponsiveStyles(responsive);
    return (
      <View style={responsiveStyles.overlayContainer}>
        {/* Background camera (back) */}
        <CameraView
          ref={backCameraRef}
          style={responsiveStyles.fullCamera}
          facing="back"
          flash={cameraState.backCamera?.flashMode || 'off'}
          zoom={cameraState.backCamera?.zoom || 1.0}
          onCameraReady={() => console.log('Back camera ready')}
          onMountError={(error: any) => console.error('Back camera mount error:', error)}
        />
        
        {/* Overlay camera (front) with transparency */}
        <View style={responsiveStyles.overlayFront}>
          <CameraView
            ref={frontCameraRef}
            style={responsiveStyles.overlayCamera}
            facing="front"
            flash={cameraState.frontCamera?.flashMode || 'off'}
            zoom={cameraState.frontCamera?.zoom || 1.0}
            onCameraReady={() => console.log('Front camera ready')}
            onMountError={(error: any) => console.error('Front camera mount error:', error)}
          />
        </View>

        {/* Layout switch button */}
        <TouchableOpacity 
          style={responsiveStyles.layoutSwitchButton} 
          onPress={() => onLayoutChange?.(CameraLayout.PIP)}
        >
          <View style={responsiveStyles.layoutIcon} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCameraContent = () => {
    const responsiveStyles = createResponsiveStyles(responsive);
    if (!isInitialized) {
      return <View style={responsiveStyles.placeholder} />;
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

  // Create responsive styles
  const responsiveStyles = createResponsiveStyles(responsive);

  return (
    <View style={[responsiveStyles.container, style]}>
      {renderCameraContent()}
      
      {/* Camera switch button for single camera layouts */}
      {(layout === 'single_front' || layout === 'single_back') && (
        <TouchableOpacity 
          style={responsiveStyles.cameraSwitchButton} 
          onPress={handleCameraSwitch}
        >
          <View style={responsiveStyles.switchIcon} />
        </TouchableOpacity>
      )}

      {/* Error indicator */}
      {cameraState.error && (
        <View style={responsiveStyles.errorOverlay}>
          <View style={responsiveStyles.errorIndicator} />
        </View>
      )}
    </View>
  );
};

const createResponsiveStyles = (responsive: ReturnType<typeof useResponsive>) => {
  const { screenWidth, screenHeight, buttonSize, safeAreaHorizontal, safeAreaVertical, orientation } = responsive;
  
  return StyleSheet.create({
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
    
    // PiP Layout Styles - Responsive
    pipContainer: {
      flex: 1,
      position: 'relative',
    },
    pipWindow: {
      position: 'absolute',
      top: 100, //safeAreaVertical * 2,
      right: 100, //safeAreaHorizontal,
      width: orientation === 'landscape' ? screenWidth * 0.25 : screenWidth * 0.3,
      height: orientation === 'landscape' ? screenHeight * 0.4 : screenHeight * 0.25,
      borderRadius: responsive.styles.cameraView.borderRadius,
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
      flexDirection: orientation === 'landscape' ? 'row' : 'column',
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
      width: orientation === 'landscape' ? 2 : '100%',
      height: orientation === 'landscape' ? '100%' : 2,
      backgroundColor: '#fff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 5,
    },
    
    // Overlay Layout Styles - Responsive
    overlayContainer: {
      flex: 1,
      position: 'relative',
    },
    overlayFront: {
      position: 'absolute',
      top: safeAreaVertical * 2,
      left: safeAreaHorizontal,
      width: orientation === 'landscape' ? screenWidth * 0.3 : screenWidth * 0.4,
      height: orientation === 'landscape' ? screenHeight * 0.5 : screenHeight * 0.3,
      borderRadius: responsive.styles.cameraView.borderRadius,
      overflow: 'hidden',
      opacity: 0.8,
      borderWidth: 2,
      borderColor: '#fff',
    },
    overlayCamera: {
      flex: 1,
    },
    
    // Control Buttons - Responsive
    layoutSwitchButton: {
      position: 'absolute',
      top: safeAreaVertical,
      left: safeAreaHorizontal,
      width: buttonSize.medium,
      height: buttonSize.medium,
      borderRadius: buttonSize.medium / 2,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    layoutIcon: {
      width: responsive.iconSize.medium,
      height: responsive.iconSize.medium,
      backgroundColor: '#fff',
      borderRadius: 2,
    },
    cameraSwitchButton: {
      position: 'absolute',
      bottom: orientation === 'landscape' ? safeAreaVertical * 2 : safeAreaVertical * 4,
      right: safeAreaHorizontal,
      width: buttonSize.large,
      height: buttonSize.large,
      borderRadius: buttonSize.large / 2,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    switchIcon: {
      width: responsive.iconSize.large,
      height: responsive.iconSize.large,
      backgroundColor: '#fff',
      borderRadius: responsive.iconSize.large / 2,
    },
    
    // Error States
    errorOverlay: {
      position: 'absolute',
      top: safeAreaVertical,
      right: safeAreaHorizontal,
      width: buttonSize.small,
      height: buttonSize.small,
    },
    errorIndicator: {
      width: buttonSize.small,
      height: buttonSize.small,
      borderRadius: buttonSize.small / 2,
      backgroundColor: '#ff4444',
    },
  });
};

export default DualCameraView;