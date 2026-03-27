import app from "./app";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
    process.exit(1);
  }
};

startServer();