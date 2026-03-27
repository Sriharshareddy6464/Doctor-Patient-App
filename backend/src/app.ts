import express, { Application, Request, Response } from "express";
import cors from "cors";


const app: Application = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Health Check
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});


app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});


export default app;