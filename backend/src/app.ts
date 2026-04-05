import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import apiRoutes from "./routes";
import { env } from "./config/env";

const app: Application = express();

// CORS — allow only the configured frontend origin
const allowedOrigins = env.FRONTEND_URL.split(",").map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests (no origin header) and whitelisted origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS: origin not allowed"));
      }
    },
    credentials: true,
  })
);

// Body parsing — cap at 10 KB to prevent payload-flooding attacks
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// Health Check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// API Routes
app.use("/api", apiRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler — catches errors thrown by route handlers and middleware.
// Must have 4 parameters so Express recognises it as an error handler.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // Structured errors thrown intentionally from services
  if (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    "message" in err
  ) {
    const structured = err as { status: number; message: string };
    return res
      .status(structured.status)
      .json({ success: false, message: structured.message });
  }

  // CORS rejection
  if (err instanceof Error && err.message.startsWith("CORS:")) {
    return res.status(403).json({ success: false, message: err.message });
  }

  // Unexpected errors — log and return 500
  console.error("[Unhandled Error]", err);
  return res
    .status(500)
    .json({ success: false, message: "Internal server error" });
});

export default app;