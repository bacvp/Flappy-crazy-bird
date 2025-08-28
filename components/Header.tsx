
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">
        Python Pygame Code Reviewer AI
      </h1>
      <p className="mt-4 text-lg text-gray-300">
        Get instant, expert feedback on your game development code using the power of Gemini.
      </p>
    </header>
  );
};

export default Header;
