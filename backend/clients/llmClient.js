const OpenAI = require("openai");
const logger = require('../utils/logger');

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY missing — add it to .env");
}

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const DEFAULT_SYSTEM_PROMPT =
    process.env.OPENAI_SYSTEM_PROMPT ||
    `You are a friendly and knowledgeable bookstore staff member. 
    Use ONLY the provided documents to answer the user’s question, and reply in the same language as the query.
    
    When the user asks about books, authors, genres, or recommendations, respond like a real bookstore worker:
    - Give helpful suggestions based on the documents  
    - Use natural conversational phrasing (e.g., “Here are some books you may like…”)
    - If multiple books match, list them clearly
    - If the documents do not contain the needed information, politely say you cannot find an exact answer.
    
    Do NOT add information that is not in the provided documents.
    `;

async function generateAnswer(userQuery, docs) {
    logger.info('Generating answer for query ' + userQuery + ' from ' + docs.length + ' documents');
    const startTime = Date.now();
    const context = docs
        .map(
            (doc, idx) =>
                `Document ${idx + 1}\nTitle: ${doc.title}\nAuthor: ${doc.author}\nDescription: ${doc.content}`
        )
        .join("\n\n");

    const prompt = `
        Question: ${userQuery}

        Documents:
        ${context || "(no documents)"}
    `.trim();

    const completion = await client.responses.create({
        model: DEFAULT_MODEL,
        input: [
            { role: "system", content: DEFAULT_SYSTEM_PROMPT },
            { role: "user", content: prompt },
        ],
    });
    const endTime = Date.now();
    logger.info("Answer generated successfully, took seconds: " + (endTime - startTime) / 1000 + "...");
    return completion.output?.[0]?.content?.[0]?.text || "";
}

module.exports = {
    generateAnswer,
};