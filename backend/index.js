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
const mindmapRoutes = require('./routes/mindmapRoutes');
const cookieParser = require("cookie-parser");
const { authenticateUser } = require("./middlewares/auth");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

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

app.use((req, res, next) => {
  // Skip rate limiting for health checks or certain paths
  if (req.path === '/health' || req.path === '/') {
    return next();
  }
  
  const clientIp = req.ip || req.connection.remoteAddress;
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
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
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
