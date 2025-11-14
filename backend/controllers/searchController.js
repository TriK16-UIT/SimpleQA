require("dotenv").config();
const {
    keywordSearch,
    embeddingSearch,
    combinedSearch,
} = require("../services/bookSearchService");
const { generateAnswer } = require("../clients/llmClient");
const logger = require('../utils/logger');

const DEFAULT_K = parseInt(process.env.DEFAULT_K, 10) || 5;
const MAX_ALLOWED_K = parseInt(process.env.MAX_ALLOWED_K, 10) || 20;

exports.search = async (req, res, next) => {
    try {
        const startTime = Date.now();
        const { query, k = DEFAULT_K, method = "keyword" } = req.query;

        if (!query) {
            logger.warn('Missing query parameter', { query });
            return res.status(400).json({ error: "query parameter is required" });
        }

        const parsedK = parseInt(k, 10);
        const limit = Number.isNaN(parsedK) ? DEFAULT_K : Math.max(parsedK, 1);

        if (limit > MAX_ALLOWED_K) {
            logger.warn('k must be ' + MAX_ALLOWED_K + ' or less. Received ' + limit);
            return res.status(400).json({
                error: `k must be ${MAX_ALLOWED_K} or less. Received ${limit}.`,
            });
        }

        logger.info('Performing ' + method + ' search for query ' + query + ' with k = ' + limit);
        let resultGroups;

        if (method === "keyword") {
            resultGroups = [
                { method: "keyword", documents: await keywordSearch(query, limit) },
            ];
        } else if (method === "embedding") {
            resultGroups = [
                { method: "embedding", documents: await embeddingSearch(query, limit) },
            ];
        } else if (method === "all") {
            resultGroups = await combinedSearch(query, limit);
        } else {
            return res.status(400).json({
                error: "method must be one of: keyword, embedding, all",
            });
        }

        const results = await Promise.all(
            resultGroups.map(async (group) => ({
                ...group,
                llm_answer: group.documents.length
                    ? await generateAnswer(query, group.documents)
                    : "No documents found using this method.",
            }))
        );

        const endTime = Date.now();
        logger.info('Search completed in ' + (endTime - startTime) / 1000 + ' seconds');
        return res.json({
            query,
            k: limit,
            method,
            results,
        });
    } catch (error) {
        next(error);
    }
};