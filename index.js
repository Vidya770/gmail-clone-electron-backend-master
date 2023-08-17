import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import accountRoutes from "./api/routes/account.js";
import emailRoutes from "./api/routes/email.js";

// initialize app
const app = express();
const origin = "*";

// middlewares
dotenv.config();
app.use(cors({ origin }));
app.use(express.json({ limit: "10mb", extended: false }));
app.use(express.urlencoded({ limit: "1mb", extended: false }));
app.use(morgan("common"));

// configure db

const MONGO_URI = process.env.MONGO_URI;
const DEPRECATED_FIX = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

// connect to db
mongoose
  .connect(MONGO_URI, DEPRECATED_FIX)
  .catch((error) => console.log("MongoDB connection error", error));

const db = mongoose.connection;
db.on("connected", () => console.log("MongoDB connected"));
db.on("disconnected", () => console.log(" MongoDB disconnected"));
db.on("error", (error) => console.log("MongoDB connection error", error));
// routes
app.get("/", (req, res, next) =>
  res.status(200).json("welcome to gmail-clone backend")
);
app.use("/account", accountRoutes);
app.use("/email", emailRoutes);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
