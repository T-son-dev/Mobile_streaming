# Mobile Streaming App - Test Video Guide

## Quick Test Setup

### 1. Start the Development Server
```bash
npm start
```

### 2. Run on Your Device
- **Android**: Press `a` in terminal or scan QR with Expo Go app
- **iOS**: Press `i` in terminal or scan QR with Expo Go app
- **Web**: Press `w` (limited camera support)

### 3. Test Video Recording

1. **Open the app**
2. **Tap "Go Live"** button on home screen
3. **Allow all permissions** when prompted
4. **Select camera layout** (start with Single Back)
5. **Tap Record button** (red circle)
6. **Record for 10-30 seconds**
7. **Tap Stop** (square icon)
8. **Check your gallery** for the saved video

### 4. Test Different Features

#### Camera Layouts:
- Single Front (selfie mode)
- Single Back (main camera)
- Picture-in-Picture (both cameras)
- Split Screen (side by side)

#### Quality Settings:
- 480p (lowest, good for testing)
- 720p (balanced)
- 1080p (high quality)
- 4K (maximum quality)

#### Performance Features:
- Battery optimization (auto-adjusts quality)
- Network adaptation (for streaming)
- Memory monitoring (prevents crashes)

### 5. Troubleshooting

**Camera not working?**
- Ensure permissions are granted
- Restart the app
- Check if another app is using camera

**App crashes?**
- Lower the resolution to 480p or 720p
- Disable dual camera mode
- Check available storage space

**Can't see recorded video?**
- Check device gallery/photos app
- Look in "DCIM" or "Movies" folder
- Ensure storage permissions granted

### 6. Test Streaming (Optional)

If you want to test live streaming:

1. Set up a local RTMP server:
```bash
# Install Node Media Server
npm install -g node-media-server

# Create config file
mkdir nms && cd nms
```

2. Create `app.js`:
```javascript
const NodeMediaServer = require('node-media-server');

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  http: {
    port: 8000,
    allow_origin: '*'
  }
};

const nms = new NodeMediaServer(config);
nms.run();
```

3. Run the server:
```bash
node app.js
```

4. In the app, use:
- RTMP URL: `rtmp://localhost:1935/live/`
- Stream Key: `test`

5. View stream at: `http://localhost:8000/live/test.flv`

## Performance Tips

- Start with **720p** for best balance
- Use **Single Camera** mode for stability
- Enable **Battery Optimization** for longer sessions
- Monitor the **performance indicators**
- Close other apps for better performance

## Sample Test Scenarios

### Basic Test (5 min)
1. Record 30s video in each camera mode
2. Try different resolutions
3. Test camera switching

### Performance Test (10 min)
1. Record 2-minute video in 1080p
2. Switch layouts while recording
3. Monitor performance metrics
4. Check battery usage

### Streaming Test (15 min)
1. Set up local RTMP server
2. Stream for 5 minutes
3. Test network resilience (disconnect/reconnect WiFi)
4. Monitor stream quality adaptation

Happy Testing! 🎥