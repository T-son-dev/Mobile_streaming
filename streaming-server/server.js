const NodeMediaServer = require('node-media-server');
const express = require('express');
const cors = require('cors');
const path = require('path');

// Express server for viewing streams
const app = express();
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Homepage with stream viewer
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Local Streaming Server</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: #1a1a1a;
          color: #fff;
        }
        h1 { color: #4CAF50; }
        .status { 
          background: #2a2a2a; 
          padding: 20px; 
          border-radius: 8px;
          margin: 20px 0;
        }
        .stream-info {
          background: #2a2a2a;
          padding: 15px;
          border-radius: 8px;
          margin: 10px 0;
        }
        .online { color: #4CAF50; }
        .offline { color: #f44336; }
        code {
          background: #333;
          padding: 2px 6px;
          border-radius: 3px;
        }
        #player {
          width: 100%;
          max-width: 800px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <h1>🎥 Local RTMP Streaming Server</h1>
      
      <div class="status">
        <h2>Server Status: <span class="online">● Online</span></h2>
        <p>RTMP Port: <code>1935</code></p>
        <p>HTTP Port: <code>8000</code></p>
        <p>Server Time: <span id="time"></span></p>
      </div>

      <div class="stream-info">
        <h3>📱 Mobile App Configuration:</h3>
        <p><strong>RTMP URL:</strong> <code id="rtmpUrl">rtmp://localhost:1935/live/</code></p>
        <p><strong>Stream Key:</strong> <code>test</code> (or any key you want)</p>
      </div>

      <div class="stream-info">
        <h3>🖥️ View Your Stream:</h3>
        <p><strong>HLS:</strong> <code id="hlsUrl">http://localhost:8000/live/test/index.m3u8</code></p>
        <p><strong>FLV:</strong> <code id="flvUrl">http://localhost:8000/live/test.flv</code></p>
        <p><strong>WebSocket FLV:</strong> <code id="wsUrl">ws://localhost:8000/live/test.flv</code></p>
      </div>

      <div class="stream-info">
        <h3>📺 Live Stream Player:</h3>
        <video id="player" controls></video>
        <p id="streamStatus">Waiting for stream...</p>
      </div>

      <div class="stream-info">
        <h3>🛠️ Test with OBS:</h3>
        <p><strong>Server:</strong> <code>rtmp://localhost:1935/live</code></p>
        <p><strong>Stream Key:</strong> <code>obs-test</code></p>
      </div>

      <div class="stream-info">
        <h3>📊 Active Streams:</h3>
        <div id="activeStreams">No active streams</div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/flv.js@1.6.2/dist/flv.min.js"></script>
      <script>
        // Update server time
        setInterval(() => {
          document.getElementById('time').textContent = new Date().toLocaleString();
        }, 1000);

        // Get local IP
        fetch('/api/info')
          .then(res => res.json())
          .then(data => {
            if (data.localIP) {
              document.getElementById('rtmpUrl').textContent = \`rtmp://\${data.localIP}:1935/live/\`;
              document.getElementById('hlsUrl').textContent = \`http://\${data.localIP}:8000/live/test/index.m3u8\`;
              document.getElementById('flvUrl').textContent = \`http://\${data.localIP}:8000/live/test.flv\`;
              document.getElementById('wsUrl').textContent = \`ws://\${data.localIP}:8000/live/test.flv\`;
            }
          });

        // FLV.js player
        if (flvjs.isSupported()) {
          const videoElement = document.getElementById('player');
          const flvPlayer = flvjs.createPlayer({
            type: 'flv',
            url: 'http://146.19.215.133:8000/live/test.flv',
            isLive: true,
            enableStashBuffer: false,
            stashInitialSize: 128,
          });
          flvPlayer.attachMediaElement(videoElement);
          
          let retryCount = 0;
          const maxRetries = 5;
          
          function tryLoad() {
            flvPlayer.load();
            flvPlayer.play().catch(e => {
              console.log('Waiting for stream...');
            });
          }
          
          flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
            console.log('Player error:', errorType, errorDetail);
            document.getElementById('streamStatus').textContent = 'No stream available. Start streaming from your app!';
            
            // Retry logic
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(tryLoad, 5000);
            }
          });
          
          flvPlayer.on(flvjs.Events.MEDIA_INFO, (mediaInfo) => {
            console.log('Media Info:', mediaInfo);
            document.getElementById('streamStatus').textContent = 
              \`Stream Active: \${mediaInfo.width}x\${mediaInfo.height} @ \${mediaInfo.fps}fps\`;
          });
          
          tryLoad();
        }

        // Check active streams periodically
        setInterval(() => {
          fetch('/api/streams')
            .then(res => res.json())
            .then(data => {
              const streamsDiv = document.getElementById('activeStreams');
              if (data.live && Object.keys(data.live).length > 0) {
                streamsDiv.innerHTML = Object.entries(data.live)
                  .map(([app, streams]) => 
                    Object.keys(streams).map(key => 
                      \`<p class="online">● \${app}/\${key}</p>\`
                    ).join('')
                  ).join('');
              } else {
                streamsDiv.innerHTML = '<p class="offline">No active streams</p>';
              }
            })
            .catch(e => console.error('Failed to fetch streams:', e));
        }, 2000);
      </script>
    </body>
    </html>
  `);
});

// API endpoints
app.get('/api/info', (req, res) => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let localIP = 'localhost';
  
  Object.keys(interfaces).forEach(name => {
    interfaces[name].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
      }
    });
  });
  
  res.json({ 
    localIP,
    rtmpPort: 1935,
    httpPort: 8000,
    status: 'online'
  });
});

app.get('/api/streams', (req, res) => {
  const streams = getActiveStreams();
  console.log('📊 API Request - Active streams:', JSON.stringify(streams));
  res.json(streams);
});

// Debug endpoint to check all sessions
app.get('/api/debug', (req, res) => {
  try {
    let sessions = {};
    let method = 'unknown';
    
    if (typeof nms.getStreams === 'function') {
      sessions = nms.getStreams();
      method = 'getStreams()';
    } else if (nms.nodeStreams) {
      sessions = nms.nodeStreams;
      method = 'nodeStreams';
    } else if (nms.sessions) {
      sessions = nms.sessions;
      method = 'sessions';
    }
    
    console.log(`🔍 Debug - Sessions via ${method}:`, sessions);
    
    res.json({
      method: method,
      sessions: sessions,
      sessionCount: Object.keys(sessions).length,
      serverStatus: 'running'
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.json({
      error: error.message,
      serverStatus: 'error'
    });
  }
});

// Test stream endpoint for mobile app
app.post('/api/test-stream', (req, res) => {
  const { action, streamKey, config } = req.body;
  
  console.log(`📱 Mobile app ${action} stream:`, streamKey);
  console.log('Config:', config);
  
  // Simulate stream activity
  if (action === 'start') {
    console.log('🎬 Test stream started from mobile app');
    res.json({ 
      success: true, 
      message: 'Stream started successfully',
      streamUrl: `http://localhost:8000/live/${streamKey}.flv`
    });
  } else if (action === 'stop') {
    console.log('🛑 Test stream stopped from mobile app');
    res.json({ 
      success: true, 
      message: 'Stream stopped successfully' 
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Invalid action' 
    });
  }
});

// Node Media Server Configuration
const config = {
  logType: 3, // 0-None, 1-Error, 2-Normal, 3-Debug
  
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60
  },
  
  http: {
    port: 8000,
    mediaroot: './media',
    allow_origin: '*'
  },
  
  // trans: {
  //   ffmpeg: '/usr/local/bin/ffmpeg',
  //   tasks: [
  //     {
  //       app: 'live',
  //       hls: true,
  //       hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
  //       hlsKeep: false,
  //       dash: true,
  //       dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
  //       dashKeep: false
  //     }
  //   ]
  // }
};

const nms = new NodeMediaServer(config);

// Event handlers
nms.on('preConnect', (id, args) => {
  console.log('[NodeEvent on preConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('postConnect', (id, args) => {
  console.log('[NodeEvent on postConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('doneConnect', (id, args) => {
  console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});

nms.on('prePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log('🎥 REAL Video Stream Started:', StreamPath);
  console.log('📹 Stream URL: http://146.19.215.133:8000/live' + StreamPath + '.flv');
  console.log('📹 Viewer URL: http://146.19.215.133:3000');
  console.log('🔄 If you don\'t see video, try refreshing the browser page');
});

nms.on('postPublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePublish', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  console.log('📴 Stream Ended:', StreamPath);
});

nms.on('prePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on prePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('postPlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on postPlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

nms.on('donePlay', (id, StreamPath, args) => {
  console.log('[NodeEvent on donePlay]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
});

// Get active streams
function getActiveStreams() {
  try {
    // For newer versions of node-media-server, try different methods
    let sessions = {};
    
    if (typeof nms.getStreams === 'function') {
      sessions = nms.getStreams();
    } else if (nms.nodeStreams) {
      sessions = nms.nodeStreams;
    } else if (nms.sessions) {
      sessions = nms.sessions;
    } else {
      console.log('⚠️  Could not access stream sessions');
      return { live: {} };
    }
    
    const streams = { live: {} };
    
    for (let [app, appStreams] of Object.entries(sessions)) {
      if (appStreams && appStreams.size > 0) {
        streams[app] = {};
        for (let [streamPath, stream] of appStreams) {
          streams[app][streamPath] = {
            publisher: stream.publisher,
            players: stream.players ? stream.players.size : 0,
            startTime: stream.startTime
          };
        }
      }
    }
    
    return streams;
  } catch (error) {
    console.error('Error getting active streams:', error.message);
    return { live: {} };
  }
}

// Start servers
nms.run();

app.listen(3000, () => {
  console.log('\n========================================');
  console.log('🚀 Local Streaming Server Started!');
  console.log('========================================');
  console.log('📺 Web Interface: http://localhost:3000');
  console.log('📡 RTMP Server: rtmp://localhost:1935/live/');
  console.log('🔑 Stream Key: test (or any key)');
  console.log('========================================\n');
  
  console.log('📱 Mobile App Configuration:');
  console.log('   RTMP URL: rtmp://YOUR_IP:1935/live/');
  console.log('   Stream Key: test');
  console.log('\nReplace YOUR_IP with your computer\'s IP address');
  console.log('(Check http://localhost:3000 for auto-detected IP)\n');
});