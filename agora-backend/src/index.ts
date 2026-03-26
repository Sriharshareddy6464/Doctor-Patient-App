import express from "express";
import cors from "cors";
import "./config/env";
import tokenRoutes from "./routes/token";


const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/get-token", tokenRoutes);

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0" , () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});