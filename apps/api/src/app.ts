import "dotenv/config.js";
import express, { Request, Response, Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRouter from "./routers/auth-router.js";
import userRouter from "./routers/user-router.js";

const app: Application = express();
const PORT: number = 8000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/auth", authRouter);

app.get("/api/v1/health", async (req: Request, res: Response) => {
  res.status(200).json({ message: "API running" });
});

app.listen(PORT, () => {
  console.info(`Server is running on http://localhost:${PORT}`);
});
