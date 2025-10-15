import React, { useState, useMemo } from 'react';
import Card from './Card';
import { getISODate, calculateExperience } from '../utils';

const ManualExperienceCalculator: React.FC = () => {
    const today = useMemo(() => new Date(), []);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>(getISODate(today));
    
    const experience = useMemo(() => {
        if (!startDate || !endDate) {
            return null;
        }
        // Use UTC to avoid timezone issues when converting from string
        const start = new Date(startDate + 'T00:00:00Z');
        const end = new Date(endDate + 'T00:00:00Z');

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return null;
        }
        
        return calculateExperience(start, end);

    }, [startDate, endDate]);

    return (
        <Card title="حساب يدوي للخبرة">
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="exp-start-date" className="block text-sm font-medium text-gray-300 mb-1">
                            تاريخ البداية:
                        </label>
                        <input
                            type="date"
                            id="exp-start-date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                            max={endDate}
                        />
                    </div>
                    <div>
                        <label htmlFor="exp-end-date" className="block text-sm font-medium text-gray-300 mb-1">
                            تاريخ النهاية (أو اليوم):
                        </label>
                        <input
                            type="date"
                            id="exp-end-date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                        />
                    </div>
                </div>

                {experience && (
                    <div className="text-center bg-gray-900/50 p-6 rounded-md">
                        <h3 className="text-lg text-gray-300 mb-4">الخبرة المحسوبة</h3>
                        <div className="grid grid-cols-3 gap-4">
                             <div className="p-3 bg-gray-700 rounded-lg">
                                <p className="text-3xl font-bold text-cyan-400">{experience.years}</p>
                                <p className="text-sm text-gray-400">سنوات</p>
                            </div>
                             <div className="p-3 bg-gray-700 rounded-lg">
                                <p className="text-3xl font-bold text-cyan-400">{experience.months}</p>
                                <p className="text-sm text-gray-400">أشهر</p>
                            </div>
                             <div className="p-3 bg-gray-700 rounded-lg">
                                <p className="text-3xl font-bold text-cyan-400">{experience.days}</p>
                                <p className="text-sm text-gray-400">أيام</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default ManualExperienceCalculator;