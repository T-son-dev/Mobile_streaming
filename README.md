# Mobile Streaming App

A React Native mobile streaming application built with Expo Router.

## Features

- **Multi-platform streaming**: Support for YouTube, Facebook, Instagram, Twitch, RTMP, and SRT
- **Custom navigation**: File-based routing with Expo Router
- **Dark theme**: Custom dark theme with green accents
- **Modular screens**: Settings, Overlay management, and Replay functionality

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (optional, as we use npx)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platforms:
```bash
npm run android    # Android device/emulator
npm run ios        # iOS simulator
npm run web        # Web browser
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation
│   │   └── index.tsx      # Home screen (tab)
│   ├── _layout.tsx        # Root layout
│   ├── live-stream.tsx    # Live streaming screen
│   ├── settings.tsx       # Settings screen
│   ├── overlay.tsx        # Overlay management
│   └── relay.tsx          # Replay functionality
├── assets/                # Images, fonts, etc.
├── components/            # Reusable UI components
├── constants/             # App constants
└── hooks/                 # Custom React hooks
```

## Navigation

The app uses Expo Router for file-based navigation:
- **Home**: Main screen with platform selection
- **Live Stream**: Streaming interface (placeholder)
- **Settings**: App configuration (placeholder)
- **Overlay**: Overlay management (placeholder)
- **Relay**: Replay gallery (placeholder)

## Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run in web browser
- `npm run lint` - Run ESLint
- `npm test` - Run tests