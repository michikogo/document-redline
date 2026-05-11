import express from "express";
import "./db";
import documentRoutes from "./routes/documents";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/documents", documentRoutes);
app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
