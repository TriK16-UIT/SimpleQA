const Book = require("../models/Book");
const { cosineSimilarity } = require("../utils/vector");
const { embedText } = require("../clients/embeddingClient");
const logger = require('../utils/logger');

const buildDocPayload = (doc, score = null) => ({
    id: doc._id,
    title: doc.title,
    author: doc.author,
    content: doc.description ?? "",
    score,
});

async function keywordSearch(query, limit) {
    logger.info('Running keyword search', { query, limit });
    const docs = await Book.find(
        { $text: { $search: query } },
        {
            score: { $meta: "textScore" },
            title: 1,
            author: 1,
            description: 1,
        }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(limit)
        .lean();
    logger.info(
        'Received ' + (docs.length > limit ? limit : docs.length) + ' documents from keyword search'
    );
    return docs.map((doc) => buildDocPayload(doc, doc.score ?? null));
}

async function embeddingSearch(query, limit) {
    logger.info('Running embedding search', { query, limit });
    const queryEmbedding = await embedText(query);

    const candidates = await Book.find({
        embedding: { $exists: true, $type: "array" },
    })
        .select("_id title author description embedding")
        .lean();
    logger.info(
        'Received ' + (candidates.length > limit ? limit : candidates.length) + ' documents from embedding search'
    );
    return candidates
        .map((doc) => ({
            document: doc,
            score: cosineSimilarity(queryEmbedding, doc.embedding),
        }))
        .filter(({ score }) => Number.isFinite(score))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ document, score }) => buildDocPayload(document, score));
}

async function combinedSearch(query, limit) {
    const [keywordDocs, embeddingDocs] = await Promise.all([
        keywordSearch(query, limit),
        embeddingSearch(query, limit),
    ]);

    return [
        { method: "keyword", documents: keywordDocs },
        { method: "embedding", documents: embeddingDocs },
    ];
}

module.exports = {
    keywordSearch,
    embeddingSearch,
    combinedSearch,
};