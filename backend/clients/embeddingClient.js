let cachedPipeline;

async function getEmbedder() {
    if (!cachedPipeline) {
        const { pipeline } = await import("@xenova/transformers");
        cachedPipeline = await pipeline(
            "feature-extraction",
            "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
        );
    }
    return cachedPipeline;
}

async function embedText(text) {
    const extractor = await getEmbedder();
    const output = await extractor(text, {
        pooling: "mean",
        normalize: true,
    });

    return Array.from(output.data);
}

module.exports = {
    embedText,
};