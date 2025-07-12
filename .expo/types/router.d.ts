/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/explore` | `/..\components\EffectsModal` | `/..\components\MicrophoneModal` | `/..\components\ReplayModal` | `/_sitemap` | `/explore` | `/home` | `/live-stream` | `/overlay` | `/relay` | `/settings`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
