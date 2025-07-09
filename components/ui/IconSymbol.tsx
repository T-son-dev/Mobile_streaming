// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
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
  'chevron.left': 'chevron-left',
  'video.fill': 'videocam',
  'mic.fill': 'mic',
  'mic.slash.fill': 'mic-off',
  'bolt.fill': 'flash-on',
  'bolt.slash': 'flash-off',
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
  'gearshape.fill': 'settings',
  'flashlight.on.fill': 'flashlight-on',
  'flashlight.off.fill': 'flashlight-off',
  'camera.fill': 'camera-alt',
  'camera.rotate': 'camera-rotate',
  'plus.magnifyingglass': 'zoom-in',
  'magnifyingglass': 'search',
  'waveform': 'graphic-eq',
  'gobackward': 'replay',
  'person.circle': 'account-circle',
  'person.fill': 'person',
  'line.horizontal.3': 'menu',
  'arrow.clockwise': 'refresh',
  'iphone': 'smartphone',
  // Platform icons
  'play.tv': 'play-arrow',
  'person.2.square.stack': 'groups',
  'gamecontroller.fill': 'sports-esports',
  'antenna.radiowaves.left.and.right': 'wifi',
  'rocket.fill': 'speed',
} as IconMapping;


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
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
