const express = require("express");
const clientRoutes = require("./routes/clientRoutes");
const projectRoutes = require("./routes/projectRoutes");
const financeurRoutes = require('./routes/financeurRoutes');
const meRoutes = require("./routes/meRoutes");
const userRoutes = require("./routes/userRoutes");
const questionRoutes = require("./routes/questionRoutes");
const responseRoutes = require("./routes/responseRoutes");
const typeRoutes = require("./routes/typeRoutes");
const optionRoutes = require("./routes/optionRoutes");
const cookieParser = require("cookie-parser");
const { authenticateUser } = require("./middlewares/auth");
const app = express();

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

module.exports = app; // export the app instance

// start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
