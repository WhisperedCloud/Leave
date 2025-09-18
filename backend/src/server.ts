import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import leaveRoutes from "./routes/leaves";
import errorHandler from "./middleware/errorHandler";
import roleLeaveRouter from "./models/RoleLeave"




const PORT = process.env.PORT || 4000;

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/dashboard", roleLeaveRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
