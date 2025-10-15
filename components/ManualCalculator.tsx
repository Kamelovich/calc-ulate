import React, { useState, useMemo } from 'react';
import Card from './Card';
import { MIN_DURATION_MONTHS, MID_DURATION_MONTHS, MAX_DURATION_MONTHS } from '../constants';

const addMonths = (date: Date, months: number): Date => {
  const newDate = new Date(date);
  newDate.setMonth(newDate.getMonth() + months);
  return newDate;
};

const formatDate = (date: Date | null): string => {
  if (!date) return '-';
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const ManualCalculator: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');

  const promotionDates = useMemo(() => {
    if (!startDate) {
      return { min: null, mid: null, max: null };
    }
    const date = new Date(startDate);
    if (isNaN(date.getTime())) {
      return { min: null, mid: null, max: null };
    }

    return {
      min: addMonths(date, MIN_DURATION_MONTHS),
      mid: addMonths(date, MID_DURATION_MONTHS),
      max: addMonths(date, MAX_DURATION_MONTHS),
    };
  }, [startDate]);

  return (
    <Card title="حساب يدوي فوري">
      <div className="space-y-4">
        <div>
          <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">
            أدخل تاريخ الأقدمية في الدرجة:
          </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>

        {startDate && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center bg-gray-900/50 p-4 rounded-md">
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-cyan-400">الترقية الدنيا</p>
              <p className="text-lg font-bold">{formatDate(promotionDates.min)}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-green-400">الترقية المتوسطة</p>
              <p className="text-lg font-bold">{formatDate(promotionDates.mid)}</p>
            </div>
            <div className="p-3 bg-gray-700 rounded-lg">
              <p className="text-sm text-amber-400">الترقية القصوى</p>
              <p className="text-lg font-bold">{formatDate(promotionDates.max)}</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ManualCalculator;