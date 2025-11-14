import { memo, useMemo } from 'react';
import '../styles/ApiUrlDisplay.css';

// Component để hiển thị API URL sẽ được gọi
const ApiUrlDisplay = memo(({ query, k }) => {
  const apiUrl = useMemo(() => {
    const baseUrl = window.location.origin;
    const endpoint = `/api/search?query=${encodeURIComponent(query)}&k=${k}`;
    return baseUrl + endpoint;
  }, [query, k]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiUrl);
    alert('API URL copied to clipboard!');
  };

  if (!query.trim()) return null;

  return (
    <div className="api-url-display">
      <div className="api-url-header">
        <span className="api-url-label">API Endpoint:</span>
        <button className="copy-btn" onClick={copyToClipboard} title="Copy URL">
          📋
        </button>
      </div>
      <code className="api-url-code">{apiUrl}</code>
    </div>
  );
});

ApiUrlDisplay.displayName = 'ApiUrlDisplay';

export default ApiUrlDisplay;
