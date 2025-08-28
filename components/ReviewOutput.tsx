
import React from 'react';

interface ReviewOutputProps {
  review: string;
  isLoading: boolean;
  error: string | null;
}

const ReviewOutput: React.FC<ReviewOutputProps> = ({ review, isLoading, error }) => {
  const formatReview = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-bold mt-6 mb-2 text-green-400">{line.substring(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-bold mt-8 mb-3 text-green-300">{line.substring(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold mt-10 mb-4 text-green-200">{line.substring(2)}</h1>;
        }
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          return <li key={index} className="ml-6 list-disc">{line.substring(line.indexOf(' ') + 1)}</li>;
        }
        if (line.includes('`') && !line.startsWith('```')) {
            const parts = line.split(/(`[^`]+`)/g);
            return <p key={index} className="my-2">{parts.map((part, i) => part.startsWith('`') ? <code key={i} className="bg-gray-700 text-cyan-300 rounded px-1 py-0.5 text-sm">{part.slice(1, -1)}</code> : part)}</p>;
        }
        if (line.startsWith('```')) {
            return null; // For simplicity, we'll just show text content. Pre-formatted code blocks can be complex.
        }
        return <p key={index} className="my-2">{line}</p>;
      })
      .filter(Boolean);
  };
  
  return (
    <div className="w-full h-full min-h-[400px] lg:min-h-[500px] p-6 bg-gray-800 border-2 border-gray-700 rounded-lg overflow-y-auto prose prose-invert prose-sm max-w-none">
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <svg className="animate-spin h-10 w-10 text-cyan-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="font-semibold text-lg">AI is reviewing your code...</p>
          <p className="text-sm">This may take a moment.</p>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-full text-red-400">
          <div className="text-center">
            <h3 className="font-bold text-lg">An Error Occurred</h3>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      )}
      {!isLoading && !error && !review && (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Your code review will appear here.</p>
        </div>
      )}
      {review && <div className="text-gray-300 leading-relaxed">{formatReview(review)}</div>}
    </div>
  );
};

export default ReviewOutput;
