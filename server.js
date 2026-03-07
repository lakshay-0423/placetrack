require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const studentRoutes = require("./routes/students");
const companyRoutes = require("./routes/companies");
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/jobs");
const adminRoutes = require("./routes/admin");
const applicationsRoutes = require("./routes/applications");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const app = new express();

app.use(express.json());
app.use(logger);
app.use("/students", studentRoutes);
app.use("/companies", companyRoutes);
app.use("/jobs", jobRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/applications", applicationsRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(PORT, () =>
            console.log(`Server running on port ${PORT}`)
        );
    })
    .catch(err => console.log(err));