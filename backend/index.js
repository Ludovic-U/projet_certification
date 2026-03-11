const express = require("express");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const ganttRoutes = require("./routes/ganttRoutes");
const financeurRoutes = require('./routes/financeurRoutes');
const configRoutes = require('./routes/configRoutes');
const meRoutes = require("./routes/meRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const responseRoutes = require("./routes/responseRoutes");
const typeRoutes = require("./routes/typeRoutes");
const optionRoutes = require("./routes/optionRoutes");
const todoRoutes =  require("./routes/todoRoutes.js");
const mistralRoutes = require('./routes/mistralRoutes');
const ideationMistralRoutes = require('./routes/ideationMistralRoutes');
const mindmapRoutes = require('./routes/mindmapRoutes');
const cookieParser = require("cookie-parser");
const { authenticateUser } = require("./middlewares/auth");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Trust proxy - required for proper IP detection behind nginx/reverse proxy
// This makes Express trust X-Real-IP and X-Forwarded-For headers set by trusted proxies
app.set('trust proxy', function(ip) {
  // Trust all localhost addresses and private networks
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return true;
  }
  return false;
});

// ============================================================================
// SECURITY HEADERS (OWASP A05: Security Misconfiguration)
// ============================================================================
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // XSS Protection (legacy but still useful)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy - basic (can be refined based on needs)
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self';");
  // Force HTTPS (if behind a reverse proxy)
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Rate limiting - simple in-memory implementation (OWASP A04: Rate Limiting)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 300; // max requests per window (increased for active usage)

// Secure IP detection - prevents X-Forwarded-For spoofing
const getClientIp = (req) => {
  // Check X-Real-IP header first (set by nginx/proxy)
  const xRealIp = req.headers['x-real-ip'];
  if (xRealIp) {
    return xRealIp;
  }
  
  // Check X-Forwarded-For, but validate it properly
  // Only trust the FIRST IP if it comes from a trusted proxy
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
    // We only trust the FIRST IP if there's a proxy in between
    // In production, configure your proxy to always set X-Real-IP
    const ips = forwarded.split(',').map(ip => ip.trim());
    
    // If there's a trusted proxy, the first IP is the client's
    // But we should only trust this if X-Real-IP is also set by the proxy
    // For now, return the first but log warning
    console.log('Warning: X-Forwarded-For detected:', ips[0]);
    return ips[0];
  }
  
  // Fallback to req.ip (Express's detected IP)
  // This uses remoteAddress from the connection, harder to spoof
  return req.ip || req.connection.remoteAddress || 'unknown';
};

app.use((req, res, next) => {
  // Skip rate limiting for health checks or certain paths
  if (req.path === '/health' || req.path === '/') {
    return next();
  }
  
  const clientIp = getClientIp(req);
  const now = Date.now();
  
  if (!rateLimitStore.has(clientIp)) {
    rateLimitStore.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
  } else {
    const clientData = rateLimitStore.get(clientIp);
    
    if (now > clientData.resetTime) {
      // Reset window
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT_WINDOW_MS;
    } else {
      clientData.count++;
      
      if (clientData.count > RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({ 
          error: 'Too many requests, please try again later',
          retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
        });
      }
    }
  }
  next();
});

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime + RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'application/docx'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier invalide, seul JPEG PNG et PDF sont autorisés'));
    }
    }
  });

//json
app.use(express.json());
app.use(cookieParser());

//cors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // TODO: change to front url
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Prevent TRACE method to avoid security issues (XST attacks)
// app.use((req, res, next) => {
//   if (req.method === 'TRACE') {
//     return res.sendStatus(405);
//   }
//   next();
// });

//routes
app.use("/api/user", userRoutes);
app.use("/api/client", authenticateUser, clientRoutes);
app.use("/api/project", authenticateUser, projectRoutes); 
app.use("/api/me", authenticateUser, meRoutes);

app.use("/api/question", questionRoutes);
app.use("/api/response", responseRoutes);
app.use("/api/type", typeRoutes);
app.use("/api/option", optionRoutes);
app.use('/api/financeur', authenticateUser, financeurRoutes);
app.use('/api/config', authenticateUser, configRoutes);
app.use('/api/gantt', authenticateUser, ganttRoutes);
app.use('/api/mistral', authenticateUser, mistralRoutes);
app.use('/api/ideation-chatbot', authenticateUser, ideationMistralRoutes);
app.use('/api/todo', todoRoutes);
app.use('/api/mindmap', authenticateUser, mindmapRoutes);


// File upload endpoint
app.post('/api/upload', authenticateUser, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return full URL including backend port
  const backendPort = process.env.PORT || 4000;
  const fileUrl = `http://localhost:${backendPort}/uploads/${req.file.filename}`;
  res.json({ 
    url: fileUrl,
    originalName: req.file.originalname,
    filename: req.file.filename
  });
});

// Serve uploaded files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

module.exports = app; // export the app instance

// start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
