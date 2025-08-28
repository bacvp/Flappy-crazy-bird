
import React from 'react';

interface CodeInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const CodeInput: React.FC<CodeInputProps> = ({ value, onChange }) => {
  return (
    <div className="w-full h-full flex-grow">
      <textarea
        value={value}
        onChange={onChange}
        placeholder="Paste your Python code here..."
        className="w-full h-full min-h-[400px] lg:min-h-[500px] p-4 bg-gray-800 border-2 border-gray-700 rounded-lg text-gray-200 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-shadow"
        spellCheck="false"
      />
    </div>
  );
};

export default CodeInput;
