import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import path from 'path';
import contentManager from './content-manager.js';
import * as imageManager from './image-manager.js';
import multer from 'multer';

const app = express();
const PORT = 3030;
const WS_PORT = 3001;

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176', 'https://snapmenu.pages.dev'];

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  credentials: true,
  maxAge: 600 // Cache preflight requests for 10 minutes
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory with proper path handling
const publicPath = path.normalize(path.resolve(process.cwd(), 'public'));
const uploadsPath = path.join(publicPath, 'uploads', 'images').replace(/\\/g, '/');

// Ensure uploads directory exists
import fs from 'fs/promises';
try {
  await fs.access(uploadsPath);
  console.log('Uploads directory exists:', uploadsPath);
} catch {
  console.log('Creating uploads directory:', uploadsPath);
  await fs.mkdir(uploadsPath, { recursive: true });
}

// Serve static files
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads/images', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    console.log('Serving static file:', filePath);
    res.set('Cache-Control', 'no-cache');
  }
}));

// Log static file requests
app.use((req, res, next) => {
  if (req.url.startsWith('/uploads/images/')) {
    console.log(`[Static] ${req.method} ${req.url}`);
    console.log('Full path:', path.join(uploadsPath, path.basename(req.url)));
  }
  next();
});

const WEBSOCKET_TOKEN = 'snapmenu-secret-token';

// Create WebSocket server for real-time updates
const wss = new WebSocketServer({
  port: WS_PORT,
  verifyClient: (info, callback) => {
    const url = new URL(info.req.url, `ws://localhost:${WS_PORT}`);
    const token = url.searchParams.get('token');

    if (token === WEBSOCKET_TOKEN) {
      callback(true);
    } else {
      callback(false, 401, 'Unauthorized');
    }
  }
});

// Share WebSocket server instance with routes
app.locals.wss = wss;

wss.on('connection', (ws) => {
  console.log('Client connected to content updates');
  
  ws.on('close', () => {
    console.log('Client disconnected from content updates');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Log all requests with detailed information
app.use((req, res, next) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Incoming request:`, {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    path: req.path,
    params: req.params,
    query: req.query,
    headers: req.headers,
    body: req.method !== 'GET' ? req.body : undefined
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (body) {
    console.log(`[${requestId}] Response:`, {
      statusCode: res.statusCode,
      body: body
    });
    return originalSend.call(this, body);
  };

  next();
});

// Pre-flight OPTIONS handling
app.options('*', cors(corsOptions));

// Routes with better logging and path rewriting
app.use('/api/content', (req, res, next) => {
  // Strip /api/content prefix
  const originalUrl = req.url;
  req.url = req.url.replace(/^\/api\/content/, '') || '/';
  
  console.log('[Content Manager]', {
    method: req.method,
    originalUrl,
    newUrl: req.url,
    path: req.path,
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
}, contentManager);

app.use('/api/images', (req, res, next) => {
  // Strip /api/images prefix
  const originalUrl = req.url;
  req.url = req.url.replace(/^\/api\/images/, '') || '/';
  
  console.log('[Image Manager]', {
    method: req.method,
    originalUrl,
    newUrl: req.url,
    path: req.path
  });
  next();
}, imageManager.router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Handle specific error types
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: err.message,
      details: err.stack
    });
  }

  // Handle file system errors
  if (err.code && err.code.startsWith('E')) {
    return res.status(500).json({
      success: false,
      error: 'File system error: ' + err.message,
      details: err.stack
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format',
      details: err.message
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.message
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle 404s
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false, 
    error: 'Not Found',
    path: req.url
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Content management server running on port ${PORT}`);
  console.log(`WebSocket server running on port ${WS_PORT}`);
});

// Handle server errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
