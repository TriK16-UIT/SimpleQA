require('dotenv').config();
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");

const Book = require("../models/Book");

async function seedBooks() {
    if (!process.env.DB_URL) {
        throw new Error("DB_URL is missing from environment variables");
    }
    if (!process.env.DATA_PATH) {
        throw new Error("DATA_PATH is missing from environment variables");
    }

    const dataPath = path.isAbsolute(process.env.DATA_PATH)
        ? process.env.DATA_PATH
        : path.join(__dirname, "..", process.env.DATA_PATH);

    console.log("Resolved data path:", dataPath);

    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Connected to MongoDB");

        await Book.deleteMany({});
        console.log("Existing book data wiped");

        const books = [];
        await new Promise((resolve, reject) => {
            const fileStream = fs.createReadStream(dataPath);
            const csvStream = fileStream.pipe(csv());

            fileStream.on("error", reject);
            csvStream
                .on("data", (row) => {
                    try {
                        const tagKeys = Object.keys(row)
                            .filter((key) => key.startsWith("tags["))
                            .sort(
                                (a, b) =>
                                    parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10)
                            );
                        const tags = tagKeys
                            .map((key) => row[key])
                            .filter((value) => value !== undefined && value !== "");

                        const embeddingKeys = Object.keys(row)
                            .filter((key) => key.startsWith("embedding["))
                            .sort(
                                (a, b) =>
                                    parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10)
                            );
                        const embedding = embeddingKeys
                            .map((key) => Number(row[key]))
                            .filter((value) => Number.isFinite(value));

                        books.push({
                            _id: row._id,
                            title: row.title,
                            author: row.author,
                            description: row.description,
                            genre: row.genre,
                            publishYear: row.publishYear ? Number(row.publishYear) : undefined,
                            tags,
                            embedding,
                            amr: row.amr || "",
                            createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
                        });
                    } catch (error) {
                        csvStream.destroy(error);
                    }
                })
                .on("end", resolve)
                .on("error", reject);
        });

    if (!books.length) {
        throw new Error("No rows were parsed from the CSV file");
    }

    await Book.insertMany(books, { ordered: false });
    console.log(`Inserted ${books.length} books`);
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

seedBooks();