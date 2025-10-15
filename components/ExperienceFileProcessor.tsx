import React, { useState, useCallback } from 'react';
import Card from './Card';
import { EmployeeData } from '../types';
import { calculateExperience, parseDateCellValue } from '../utils';
import { UploadIcon, DownloadIcon, SpinnerIcon } from './icons';

declare var XLSX: any;

const ExperienceFileProcessor: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processedData, setProcessedData] = useState<EmployeeData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');
    const [startDateCol, setStartDateCol] = useState<string>('');
    const [endDateCol, setEndDateCol] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setProcessedData(null);
            setError('');
        }
    };

    const processFile = useCallback(() => {
        if (!file) {
            setError('الرجاء تحديد ملف أولاً.');
            return;
        }
        const trimmedStartDateCol = startDateCol.trim();
        if (!trimmedStartDateCol) {
            setError('الرجاء إدخال اسم أو حرف عمود تاريخ البداية.');
            return;
        }
        const trimmedEndDateCol = endDateCol.trim();


        setIsLoading(true);
        setError('');
        setProcessedData(null);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                const sheetData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });

                if (sheetData.length < 2) throw new Error("الملف فارغ أو يحتوي على رأس فقط.");

                const header: string[] = sheetData[0].map(cell => String(cell || '').trim());
                const dataRows = sheetData.slice(1);

                let startIndex = header.findIndex(h => h.toLowerCase() === trimmedStartDateCol.toLowerCase());
                if (startIndex === -1 && /^[A-Z]{1,3}$/i.test(trimmedStartDateCol)) {
                    startIndex = XLSX.utils.decode_col(trimmedStartDateCol.toUpperCase());
                }

                if (startIndex === -1 || startIndex >= header.length) {
                    throw new Error(`لم يتم العثور على عمود باسم أو حرف '${trimmedStartDateCol}'.`);
                }

                let endIndex = -1;
                if (trimmedEndDateCol) {
                    endIndex = header.findIndex(h => h.toLowerCase() === trimmedEndDateCol.toLowerCase());
                    if (endIndex === -1 && /^[A-Z]{1,3}$/i.test(trimmedEndDateCol)) {
                        endIndex = XLSX.utils.decode_col(trimmedEndDateCol.toUpperCase());
                    }
                    if (endIndex === -1 || endIndex >= header.length) {
                        throw new Error(`لم يتم العثور على عمود باسم أو حرف '${trimmedEndDateCol}'.`);
                    }
                }

                const today = new Date();
                const newData = dataRows.map(rowArray => {
                    const row: EmployeeData = header.reduce((obj, key, index) => {
                        obj[key] = rowArray[index];
                        return obj;
                    }, {} as EmployeeData);

                    const startDateValue = rowArray[startIndex];
                    const endDateValue = endIndex !== -1 ? rowArray[endIndex] : today;
                    
                    const startDate = parseDateCellValue(startDateValue);
                    const endDate = parseDateCellValue(endDateValue);

                    if (startDate && endDate) {
                        const { years, months, days } = calculateExperience(startDate, endDate);
                        return {
                            ...row,
                            'السنوات': years,
                            'الأشهر': months,
                            'الأيام': days,
                        };
                    }
                    return {
                        ...row,
                        'السنوات': 'تاريخ غير صالح',
                        'الأشهر': 'تاريخ غير صالح',
                        'الأيام': 'تاريخ غير صالح',
                    };
                });
                
                setProcessedData(newData);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء معالجة الملف.');
            } finally {
                setIsLoading(false);
            }
        };
        reader.onerror = () => {
             setError('فشل في قراءة الملف.');
             setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
    }, [file, startDateCol, endDateCol]);
    
    const downloadFile = () => {
        if (!processedData) return;
        const newWorksheet = XLSX.utils.json_to_sheet(processedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "الخبرة المحسوبة");
        
        const originalName = fileName.substring(0, fileName.lastIndexOf('.'));
        XLSX.writeFile(newWorkbook, `${originalName}_الخبرة.xlsx`);
    };

    return (
        <Card title="حساب الخبرة من ملف إكسل">
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="start-date-col" className="block text-sm font-medium text-gray-300 mb-1">
                            اسم أو حرف عمود تاريخ البداية <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            id="start-date-col"
                            value={startDateCol}
                            onChange={(e) => setStartDateCol(e.target.value)}
                            className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="مثال: تاريخ التوظيف أو B"
                        />
                    </div>
                     <div>
                        <label htmlFor="end-date-col" className="block text-sm font-medium text-gray-300 mb-1">
                            اسم أو حرف عمود النهاية (اختياري)
                        </label>
                        <input
                            type="text"
                            id="end-date-col"
                            value={endDateCol}
                            onChange={(e) => setEndDateCol(e.target.value)}
                            className="w-full bg-gray-700 text-white border-gray-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="اتركه فارغًا للحساب حتى اليوم"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file-exp" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت الملف</p>
                            <p className="text-xs text-gray-500">XLSX, XLS</p>
                        </div>
                        <input id="dropzone-file-exp" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
                    </label>
                </div>

                {fileName && <p className="text-center text-gray-300">الملف المحدد: <span className="font-medium text-cyan-400">{fileName}</span></p>}

                <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={processFile} disabled={!file || isLoading} className="w-full flex justify-center items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300">
                        {isLoading ? <><SpinnerIcon /> جاري المعالجة...</> : <>معالجة الملف</>}
                    </button>
                    <button onClick={downloadFile} disabled={!processedData || isLoading} className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-all duration-300">
                        <DownloadIcon /> تحميل الملف المعالج
                    </button>
                </div>
                {error && <p className="text-red-400 text-center">{error}</p>}
                {processedData && <p className="text-green-400 text-center">تمت معالجة {processedData.length} سجل بنجاح. الملف جاهز للتحميل.</p>}
            </div>
        </Card>
    );
};

export default ExperienceFileProcessor;