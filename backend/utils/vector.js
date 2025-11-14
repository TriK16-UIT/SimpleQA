function cosineSimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || !b.length) return -1;

    const length = Math.min(a.length, b.length);
    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < length; i += 1) {
        const valA = a[i];
        const valB = b[i];
        dot += valA * valB;
        magA += valA * valA;
        magB += valB * valB;
    }

    if (!magA || !magB) return -1;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

module.exports = {
    cosineSimilarity,
};