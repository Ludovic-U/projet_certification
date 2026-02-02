import express from "express";
import clientRoutes from "./routes/clientRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import financeurRoutes from './routes/financeurRoutes.js';
import configRoutes from './routes/configRoutes.js';
import meRoutes from "./routes/meRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import responseRoutes from "./routes/responseRoutes.js";
import typeRoutes from "./routes/typeRoutes.js";
import optionRoutes from "./routes/optionRoutes.js";
import mistralRoutes from "./routes/mistralRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";
import cookieParser from "cookie-parser";
import { authenticateUser } from "./middlewares/auth.js";

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
app.use('/api/config', authenticateUser, configRoutes);
app.use('/api/mistral', mistralRoutes); 
app.use('/api/todo', authenticateUser, todoRoutes);

export default app; // export the app instance

// start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
