require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const searchRoutes = require("./routes/searchRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "SimpleQA backend is up" });
});

app.use("/", searchRoutes);

async function initServer() {
    if (!process.env.DB_URL) {
        console.error("DB_URL is missing from environment variables");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server", error);
        process.exit(1);
    }
}

initServer();