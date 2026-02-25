# Backend Architecture Documentation

## Overview

The F2S backend is built using Express.js and follows a layered architecture pattern:

```
Request → Routes → Controllers → Services → Database (Prisma)
```

## Directory Structure

```
backend/
├── controllers/           # Request handlers
│   ├── clientController.js
│   ├── configController.js
│   ├── financeurController.js
│   ├── ganttController.js
│   ├── meController.js
│   ├── mindmapController.js
│   ├── mistralController.js
│   ├── optionController.js
│   ├── projectController.js
│   ├── questionController.js
│   ├── responseController.js
│   ├── todoController.js
│   ├── typeController.js
│   ├── userController.js
│   └── helpers/
│       └── asyncErrorHandler.js
├── services/             # Business logic
│   ├── clientService.js
│   ├── financeurService.js
│   ├── ganttService.js
│   ├── mindmapService.js
│   ├── mistralService.js
│   ├── optionService.js
│   ├── projectService.js
│   ├── questionService.js
│   ├── responseService.js
│   ├── roleService.js
│   ├── sessionService.js
│   ├── todoService.js
│   ├── typeService.js
│   ├── userService.js
│   └── helper/
│       └── pagination.js
├── routes/               # API route definitions
│   ├── clientRoutes.js
│   ├── configRoutes.js
│   ├── financeurRoutes.js
│   ├── ganttRoutes.js
│   ├── meRoutes.js
│   ├── mindmapRoutes.js
│   ├── mistralRoutes.js
│   ├── optionRoutes.js
│   ├── projectRoutes.js
│   ├── questionRoutes.js
│   ├── responseRoutes.js
│   ├── todoRoutes.js
│   ├── typeRoutes.js
│   └── userRoutes.js
├── middlewares/          # Express middleware
│   ├── auth.js          # JWT authentication
│   ├── isAdmin.js       # Admin role check
│   └── validateId.js    # ID validation
├── prisma/              # Database
│   ├── schema.prisma    # Database schema
│   ├── seed.js          # Database seeder
│   └── migrations/     # Database migrations
├── utils/               # Utility functions
│   ├── cleanup.js
│   ├── hash.js
│   ├── hashedPassword.js
│   ├── jwt.js
│   ├── mailer.js
│   └── roles.js
└── index.js             # Server entry point
```

## Controller Layer

Controllers handle incoming HTTP requests, validate input, and call appropriate services. They also format responses.

### Example Controller Structure

```javascript
// controllers/userController.js
const userService = require('../services/userService');
const { asyncErrorHandler } = require('./helpers/asyncErrorHandler');

// GET /api/user/:id
exports.getUser = asyncErrorHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});
```

## Service Layer

Services contain the core business logic. They interact with the database through Prisma and implement complex operations.

### Example Service Structure

```javascript
// services/userService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { userId: parseInt(id) },
    include: { roles: true }
  });
};
```

## Middleware

### Authentication Middleware (`middlewares/auth.js`)

Validates JWT tokens from cookies and attaches the user to the request object.

```javascript
const jwt = require('../utils/jwt');

exports.authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

## API Routes

Routes define the API endpoints and connect them to controllers.

### Route Registration Pattern

```javascript
// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticateUser } = require('../middlewares/auth');

// All routes require authentication
router.use(authenticateUser);

router.get('/get', projectController.getProjects);
router.get('/getById/:id', projectController.getProjectById);
router.post('/create', projectController.createProject);
router.patch('/update/:id', projectController.updateProject);
router.delete('/delete/:id', projectController.deleteProject);

module.exports = router;
```

## Database Access (Prisma)

### Client Initialization

```javascript
// prisma/prismaClient.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
```

### Common Prisma Operations

```javascript
// Find with relations
const user = await prisma.user.findUnique({
  where: { userId: id },
  include: {
    roles: { include: { role: true } },
    clientUserRoles: { include: { client: true } }
  }
});

// Create with nested relations
const project = await prisma.project.create({
  data: {
    projectName: 'New Project',
    client: { connect: { clientId: clientId } },
    manager: { connect: { userId: managerId } },
    // ...
  }
});

// Update with transactions
const result = await prisma.$transaction([
  prisma.task.update({ where: { id: taskId }, data: { progress: 100 } }),
  prisma.subAction.update({ where: { id: subActionId }, data: { progress: 50 } })
]);
```

## Error Handling

### Async Error Handler

```javascript
// controllers/helpers/asyncErrorHandler.js
const asyncErrorHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncErrorHandler;
```

### Global Error Handler (in index.js)

```javascript
// After all routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

## File Uploads

The backend uses Multer for handling file uploads:

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
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
```

## Testing

The backend includes Jest tests:

- **Unit Tests**: Test individual services
- **Integration Tests**: Test API endpoints with a test database
- **User Flow Tests**: Test complete user journeys

Run tests:
```bash
npm run test:all        # Run all tests
npm run test:controllers # Run controller tests
npm run test:services   # Run service tests
```

## Environment Configuration

Required environment variables:

```env
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/f2s_db"
PORT=4000

# For authentication
JWT_SECRET=your-secret-key

# For email (password reset)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password

# For AI features
MISTRAL_API_KEY=your-mistral-api-key
```

## Adding New Features

### 1. Define Database Schema

Add model to `prisma/schema.prisma`:

```prisma
model NewFeature {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
}
```

Run migration:
```bash
npx prisma migrate dev --name add_new_feature
```

### 2. Create Service

Create `services/newFeatureService.js`:

```javascript
const prisma = require('../prisma/prismaClient');

exports.getAll = async () => {
  return await prisma.newFeature.findMany();
};
```

### 3. Create Controller

Create `controllers/newFeatureController.js`:

```javascript
const newFeatureService = require('../services/newFeatureService');
const { asyncErrorHandler } = require('./helpers/asyncErrorHandler');

exports.getAll = asyncErrorHandler(async (req, res) => {
  const features = await newFeatureService.getAll();
  res.json(features);
});
```

### 4. Create Routes

Create `routes/newFeatureRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const newFeatureController = require('../controllers/newFeatureController');
const { authenticateUser } = require('../middlewares/auth');

router.use(authenticateUser);

router.get('/', newFeatureController.getAll);
// Add more routes...

module.exports = router;
```

### 5. Register Routes

Add to `index.js`:

```javascript
const newFeatureRoutes = require('./routes/newFeatureRoutes');
app.use('/api/newfeature', newFeatureRoutes);
```
