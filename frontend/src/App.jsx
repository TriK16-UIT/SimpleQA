import { useState, useCallback, useMemo, useRef, useEffect, lazy, Suspense } from 'react';
import Header from './components/Header';
import QueryInput from './components/QueryInput';
import LoadingSpinner from './components/LoadingSpinner';
import { useApiCache } from './hooks/useApiCache';
import { useLocalStorage } from './hooks/useLocalStorage';
import { searchQuery } from './utils/api';
import './styles/App.css';

// Lazy load ResultsGrid component
const ResultsGrid = lazy(() => import('./components/ResultsGrid'));

function App() {
  const [query, setQuery] = useState('');
  // Persist k value to localStorage
  const [k, setK] = useLocalStorage('simpleqa-k-value', 5);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API cache
  const cache = useApiCache();

  // AbortController để cancel requests
  const abortControllerRef = useRef(null);

  // Cleanup expired cache every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      cache.clearExpired();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [cache]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoize handleSearch với caching và abort support
  const handleSearch = useCallback(async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError('Please enter a question');
      return;
    }

    // Check cache first
    const cachedResult = cache.get(trimmedQuery, k);
    if (cachedResult) {
      setResults(cachedResult.data);
      setError(null);
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await searchQuery(trimmedQuery, k, abortControllerRef.current.signal);

      // Cache the result
      cache.set(trimmedQuery, k, data);

      setResults(data);
    } catch (err) {
      if (err.message !== 'Request was cancelled') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [query, k, cache]);

  // Memoize setQuery và setK để tránh re-render không cần thiết
  const handleQueryChange = useCallback((newQuery) => {
    setQuery(newQuery);
    setError(null); // Clear error khi user đang gõ
  }, []);

  const handleKChange = useCallback((newK) => {
    setK(newK);
  }, []);

  // Clear cache function
  const handleClearCache = useCallback(() => {
    cache.clear();
  }, [cache]);

  // Memoize error message component
  const errorMessage = useMemo(() => {
    if (!error) return null;
    return <div className="error-message">{error}</div>;
  }, [error]);

  // Memoize loading component với spinner
  const loadingComponent = useMemo(() => {
    if (!loading) return null;
    return <LoadingSpinner text="Searching..." />;
  }, [loading]);

  // Memoize results grid với lazy loading
  const resultsGrid = useMemo(() => {
    if (!results || loading) return null;
    return (
      <Suspense fallback={<LoadingSpinner text="Loading results..." />}>
        <ResultsGrid results={results} />
      </Suspense>
    );
  }, [results, loading]);

  return (
    <div className="app">
      <Header />
      <div className="container">
        <QueryInput
          query={query}
          setQuery={handleQueryChange}
          k={k}
          setK={handleKChange}
          onSearch={handleSearch}
          loading={loading}
        />

        {cache.cacheSize > 0 && (
          <div className="cache-info">
            <span>Cached queries: {cache.cacheSize}</span>
            <button onClick={handleClearCache} className="clear-cache-btn">
              Clear Cache
            </button>
          </div>
        )}

        {errorMessage}
        {loadingComponent}
        {resultsGrid}
      </div>
    </div>
  );
}

export default App;
