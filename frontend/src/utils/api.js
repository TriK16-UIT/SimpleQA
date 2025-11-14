// API utilities with AbortController support

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function searchQuery(query, k, signal) {
  // TODO: Replace with your actual API endpoint
  // Example: const apiUrl = `http://localhost:8000/api/search?query=${encodeURIComponent(query)}&k=${k}`;
  const apiUrl = `/api/search?query=${encodeURIComponent(query)}&k=${k}&method=all`;

  try {
    const response = await fetch(apiUrl, { signal });

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status);
    }

    const data = await response.json();

    // Transform backend response to frontend format
    // Backend format: { query, k, method, results: [{method, documents, llm_answer}] }
    // Frontend format: [{ method, answers: [...] }]
    if (data.results && Array.isArray(data.results)) {
      return data.results.map(result => {
        // Only extract LLM answer
        const answers = [];

        // Add LLM answer if exists
        if (result.llm_answer) {
          answers.push(result.llm_answer);
        }

        // Capitalize method name
        const methodName = result.method.charAt(0).toUpperCase() + result.method.slice(1);

        return {
          method: methodName === 'Keyword' ? 'Keyword' :
                  methodName === 'Embedding' ? 'Embedding' :
                  methodName === 'Amr_semantic' ? 'AMR Semantic' :
                  methodName,
          answers: answers
        };
      });
    }

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request was cancelled');
    }
    throw error;
  }
}
