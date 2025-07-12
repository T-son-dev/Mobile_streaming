// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'video.fill': 'videocam',
  'mic.fill': 'mic',
  'bolt.fill': 'flash-on',
  'lock.fill': 'lock',
  'xmark': 'close',
  'text.alignleft': 'text-fields',
  'photo.fill': 'image',
  'globe': 'language',
  'play.rectangle.fill': 'ondemand-video',
  'plus': 'add',
  'trash': 'delete',
  'pencil': 'edit',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'play.tv': 'play-arrow',
  'person.2.square.stack': 'groups',
  'camera.fill': 'camera-alt',
  'gamecontroller.fill': 'sports-esports',
  'antenna.radiowaves.left.and.right': 'wifi',
  'rocket.fill': 'speed',
  'person.circle': 'account-circle',
  'person.fill': 'person',
  'gobackward': 'replay',
  'waveform': 'graphic-eq',
  'line.horizontal.3': 'menu',
  'play.fill': 'play-arrow',
  'magnifyingglass': 'search',
  'iphone': 'phone-iphone',
  'flashlight.on.fill': 'flashlight-on',
  'mic.slash.fill': 'mic-off',
  'gearshape.fill': 'settings',
  'camera.rotate': 'flip-camera-ios',
  'plus.magnifyingglass': 'zoom-in',
  'circle': 'radio-button-unchecked',
  'bolt': 'flash-on',
  'arrow.clockwise': 'refresh',
  'chevron.left': 'chevron-left',
} as const satisfies IconMapping;

export interface IconSymbolProps {
  name: IconSymbolName;
  size?: number;
  color?: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight,
}: IconSymbolProps) {
  const materialIconName = MAPPING[name];
  
  if (!materialIconName) {
    console.warn(`IconSymbol: No mapping found for "${name}"`);
    return null;
  }

  return (
    <MaterialIcons
      name={materialIconName}
      size={size}
      color={color}
      style={style}
    />
  );
}