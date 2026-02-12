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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
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
