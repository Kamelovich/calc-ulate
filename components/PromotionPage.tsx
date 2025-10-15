import React from 'react';
import ManualCalculator from './ManualCalculator';
import FileProcessor from './FileProcessor';

const PromotionPage: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
      <ManualCalculator />
      <FileProcessor />
    </div>
  );
};

export default PromotionPage;