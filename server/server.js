require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const studentRoutes = require("./routes/students");
const companyRoutes = require("./routes/companies");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const adminRoutes = require("./routes/admin");
const applicationsRoutes = require("./routes/applications");
const reportRoutes = require("./routes/reports");
const errorHandler = require("./middleware/errorHandler");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

app.set("io", io);

// EJS view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

io.on("connection", (socket) => {
  console.log("Client connected via Socket.IO:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/admin", reportRoutes);
app.use("/api/applications", applicationsRoutes);

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        httpServer.listen(PORT, () =>
            console.log(`Server running on port ${PORT}`)
        );
    })
    .catch(err => console.log(err));  