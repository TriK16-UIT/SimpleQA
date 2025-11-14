import { memo } from 'react';
import '../styles/Loading.css';

// Advanced loading spinner component
const LoadingSpinner = memo(({ text = 'Searching...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <div className="loading-text">{text}</div>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
