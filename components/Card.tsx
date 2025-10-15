
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-cyan-500/20 hover:border-cyan-500/50">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-700 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );
};

export default Card;
