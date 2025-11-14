import { memo } from 'react';
import '../styles/Header.css';

// Sử dụng memo vì Header không bao giờ thay đổi
const Header = memo(() => {
  return (
    <header className="header">
      <h1>SimpleQA</h1>
      <p>Question Answering System</p>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
