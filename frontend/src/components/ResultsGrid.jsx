import { memo, useMemo } from 'react';
import MethodCard from './MethodCard';
import '../styles/ResultsGrid.css';

// Memoize để tránh re-render khi results không thay đổi
const ResultsGrid = memo(({ results }) => {
  // Memoize method cards để tránh tạo lại khi không cần thiết
  const methodCards = useMemo(() => {
    return results.map((result, index) => (
      <MethodCard
        key={`${result.method}-${index}`}
        method={result.method}
        answers={result.answers}
      />
    ));
  }, [results]);

  return (
    <div className="results-grid">
      {methodCards}
    </div>
  );
});

ResultsGrid.displayName = 'ResultsGrid';

export default ResultsGrid;
