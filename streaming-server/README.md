# Local RTMP Streaming Server

A simple local RTMP server for testing the mobile streaming app.

## Quick Start

### 1. Install Dependencies
```bash
cd streaming-server
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access Web Interface
Open your browser to: http://localhost:3000

The web interface will show:
- Your local IP address for mobile connection
- Live stream player
- Server status
- Active streams

### 4. Configure Mobile App

In your mobile app, use these settings:
- **RTMP URL**: `rtmp://YOUR_COMPUTER_IP:1935/live/`
- **Stream Key**: `test`

Replace YOUR_COMPUTER_IP with the IP shown in the web interface.

## Features

- **RTMP Server** on port 1935
- **HTTP Server** on port 8000 for stream playback
- **Web Interface** on port 3000 with live preview
- **Multiple Formats**: HLS, DASH, HTTP-FLV, WebSocket-FLV
- **Real-time Monitoring** of active streams
- **Auto IP Detection** for easy mobile setup

## Viewing Your Stream

### Option 1: Web Interface (Recommended)
- Go to http://localhost:3000
- Stream player will auto-connect when you start streaming

### Option 2: VLC Player
- Open VLC
- Media → Open Network Stream
- Enter: `rtmp://localhost:1935/live/test`

### Option 3: Browser (HLS)
- After streaming starts, open:
- `http://localhost:8000/live/test/index.m3u8`

## Troubleshooting

### "Connection Refused" on Mobile
- Make sure your phone and computer are on the same WiFi network
- Check firewall settings - allow ports 1935, 8000, 3000
- Use the IP address shown in web interface, not "localhost"

### No Video in Player
- Stream needs to be active first
- Check console for any errors
- Try refreshing the page after starting stream

### FFmpeg Not Found
If you see FFmpeg errors, install it:
- Mac: `brew install ffmpeg`
- Ubuntu: `sudo apt install ffmpeg`
- Windows: Download from https://ffmpeg.org

## Testing Without Mobile

You can test with OBS Studio:
1. Settings → Stream
2. Service: Custom
3. Server: `rtmp://localhost:1935/live`
4. Stream Key: `obs-test`

## Server Logs

The server shows detailed logs for:
- Connection events
- Stream start/stop
- Active streams
- Any errors

## Stop the Server

Press `Ctrl+C` in the terminal to stop.