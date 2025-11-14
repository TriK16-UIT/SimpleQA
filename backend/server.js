require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const searchRoutes = require("./routes/searchRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

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