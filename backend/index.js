const express = require('express');
const { PrismaClient }= require('@prisma/client');
const clientRoutes = require('./routes/clientRoutes');
const meRoutes = require('./routes/meRoutes');
const userRoutes = require('./routes/userRoutes');
const cookieParser = require('cookie-parser')
const { authenticateUser } = require('./middlewares/auth');
const prisma = new PrismaClient();
const app = express();

//json 
app.use(express.json());
app.use(cookieParser());

//cors
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // TODO: change to front url
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

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
app.use('/api/user', userRoutes);
app.use('/api/client',authenticateUser, clientRoutes);
app.use('/api/me',authenticateUser,meRoutes);

//start server
const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
} );