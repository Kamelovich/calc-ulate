import React from 'react';
import ManualExperienceCalculator from './ManualExperienceCalculator';
import ExperienceFileProcessor from './ExperienceFileProcessor';

const ExperienceCalculator: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
      <ManualExperienceCalculator />
      <ExperienceFileProcessor />
    </div>
  );
};

export default ExperienceCalculator;