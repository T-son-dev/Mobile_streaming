/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/explore` | `/..\components\icons\` | `/..\components\icons\AudioIcon` | `/..\components\icons\CropIcon` | `/..\components\icons\FxIcon` | `/..\components\icons\GridIcon` | `/..\components\icons\ISOIcon` | `/..\components\icons\PlusMinusIcon` | `/..\components\icons\ReplayIcon` | `/..\components\icons\ResetIcon` | `/..\components\icons\RoundIcon` | `/..\components\icons\RunIcon` | `/..\components\icons\SettingIcon` | `/..\components\icons\TorchIcon` | `/..\components\icons\UserIcon` | `/..\components\icons\VideoIcon` | `/..\components\icons\WBIcon` | `/..\components\icons\ZoomIcon` | `/_sitemap` | `/explore` | `/home` | `/live-stream` | `/overlay` | `/relay` | `/settings`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
