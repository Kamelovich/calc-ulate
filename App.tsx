import React, { useState } from 'react';
import PromotionPage from './components/PromotionPage';
import ExperienceCalculator from './components/ExperienceCalculator';

type Page = 'promotion' | 'experience';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('promotion');

  const navButtonClasses = "px-4 py-2 rounded-md font-semibold transition-colors duration-300";
  const activeNavButtonClasses = "bg-cyan-600 text-white";
  const inactiveNavButtonClasses = "bg-gray-700 hover:bg-gray-600 text-gray-300";

  return (
    <div className="bg-gray-900 min-h-screen text-white p-4 sm:p-8 font-sans">
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-cyan-400">
            حاسبة الترقية والخبرة
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            أدوات لحساب تواريخ الترقية والخبرة المهنية بدقة
          </p>
        </header>

        <nav className="flex justify-center mb-8 gap-4">
            <button 
              onClick={() => setCurrentPage('promotion')}
              className={`${navButtonClasses} ${currentPage === 'promotion' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
              aria-current={currentPage === 'promotion' ? 'page' : undefined}
            >
              حاسبة الترقية
            </button>
            <button 
              onClick={() => setCurrentPage('experience')}
              className={`${navButtonClasses} ${currentPage === 'experience' ? activeNavButtonClasses : inactiveNavButtonClasses}`}
              aria-current={currentPage === 'experience' ? 'page' : undefined}
            >
              حاسبة الخبرة المهنية
            </button>
        </nav>

        <main>
          {currentPage === 'promotion' && <PromotionPage />}
          {currentPage === 'experience' && <ExperienceCalculator />}
        </main>
        
        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>
            تم التطوير بواسطة مهندس خبير في React و Gemini API.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;