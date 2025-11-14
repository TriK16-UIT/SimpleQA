import { memo, useMemo } from 'react';
import '../styles/MethodCard.css';

// Function to strip markdown and convert to plain text
const stripMarkdown = (markdown) => {
  if (!markdown) return '';

  return markdown
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove strikethrough
    .replace(/~~(.+?)~~/g, '$1')
    // Remove inline code
    .replace(/`(.+?)`/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove links but keep text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Remove images
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // Remove blockquotes
    .replace(/^\s*>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}$/gm, '')
    // Remove list markers
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// Memoize để tránh re-render khi method/answers không thay đổi
const MethodCard = memo(({ method, answers }) => {
  // Memoize answer items để tránh tạo lại khi không cần thiết
  const answerItems = useMemo(() => {
    return answers.map((answer, index) => {
      const plainText = stripMarkdown(answer);
      return (
        <div
          key={`${method}-${index}`}
          className="answer-item"
          style={{ '--index': index }}
        >
          <div className="answer-text">{plainText}</div>
        </div>
      );
    });
  }, [answers, method]);

  return (
    <div className="method-card">
      <h3 className="method-title">{method}</h3>
      <div className="answers-list">
        {answerItems}
      </div>
    </div>
  );
});

MethodCard.displayName = 'MethodCard';

export default MethodCard;
