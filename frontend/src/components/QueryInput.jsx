import { memo, useCallback, useMemo } from 'react';
import '../styles/QueryInput.css';

// Memoize để tránh re-render khi props không thay đổi
const QueryInput = memo(({ query, setQuery, k, setK, onSearch, loading }) => {
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !loading) {
      onSearch();
    }
  }, [loading, onSearch]);

  const handleQueryChange = useCallback((e) => {
    setQuery(e.target.value);
  }, [setQuery]);

  const handleKChange = useCallback((e) => {
    setK(Number(e.target.value));
  }, [setK]);

  // Memoize options array để tránh tạo lại mỗi lần render
  const kOptions = useMemo(() => {
    return [3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
      <option key={value} value={value}>
        {value}
      </option>
    ));
  }, []);

  return (
    <div className="query-input-container">
      <div className="search-box">
        <input
          type="text"
          className="search-input"
          placeholder="Ask me anything..."
          value={query}
          onChange={handleQueryChange}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button
          className="search-button-inside"
          onClick={onSearch}
          disabled={loading}
          aria-label="Search"
        >
          <span className="search-icon">→</span>
        </button>
      </div>

      <div className="k-selector">
        <label htmlFor="k-value">📈 Results:</label>
        <select
          id="k-value"
          value={k}
          onChange={handleKChange}
          disabled={loading}
        >
          {kOptions}
        </select>
      </div>
    </div>
  );
});

QueryInput.displayName = 'QueryInput';

export default QueryInput;
