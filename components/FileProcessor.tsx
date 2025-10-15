import React, { useState, useCallback } from 'react';
import Card from './Card';
import { EmployeeData } from '../types';
import { 
    MIN_DURATION_MONTHS, 
    MID_DURATION_MONTHS, 
    MAX_DURATION_MONTHS,
    DATE_COLUMN_HEURISTIC,
    MIN_PROMOTION_COL,
    MID_PROMOTION_COL,
    MAX_PROMOTION_COL
} from '../constants';
import { UploadIcon, DownloadIcon, SpinnerIcon } from './icons';
import { parseDateCellValue, addMonthsUTC, formatDateForExcel } from '../utils';

// xlsx is loaded from CDN in index.html
declare var XLSX: any;

const FileProcessor: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [processedData, setProcessedData] = useState<EmployeeData[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [fileName, setFileName] = useState<string>('');

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
        if (!file) return;

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
                const jsonData: EmployeeData[] = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    throw new Error("الملف فارغ أو لا يمكن قراءته.");
                }

                const dateColumn = Object.keys(jsonData[0]).find(key => key.includes(DATE_COLUMN_HEURISTIC));

                if (!dateColumn) {
                    throw new Error(`لم يتم العثور على عمود يحتوي على كلمة '${DATE_COLUMN_HEURISTIC}'.`);
                }

                const newData = jsonData.map(row => {
                    const dateValue = row[dateColumn];
                    const startDate = parseDateCellValue(dateValue);
                    
                    if (startDate) {
                        return {
                            ...row,
                            [MIN_PROMOTION_COL]: formatDateForExcel(addMonthsUTC(startDate, MIN_DURATION_MONTHS)),
                            [MID_PROMOTION_COL]: formatDateForExcel(addMonthsUTC(startDate, MID_DURATION_MONTHS)),
                            [MAX_PROMOTION_COL]: formatDateForExcel(addMonthsUTC(startDate, MAX_DURATION_MONTHS)),
                        };
                    }
                    return {
                        ...row,
                        [MIN_PROMOTION_COL]: 'تاريخ غير صالح',
                        [MID_PROMOTION_COL]: 'تاريخ غير صالح',
                        [MAX_PROMOTION_COL]: 'تاريخ غير صالح',
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
    }, [file]);
    
    const downloadFile = () => {
        if (!processedData) return;
        const newWorksheet = XLSX.utils.json_to_sheet(processedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "البيانات المعالجة");
        
        const originalName = fileName.substring(0, fileName.lastIndexOf('.'));
        XLSX.writeFile(newWorkbook, `${originalName}_معالج.xlsx`);
    };

    return (
        <Card title="معالجة ملف إكسل">
            <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/50 hover:bg-gray-700 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">انقر للرفع</span> أو اسحب وأفلت الملف</p>
                            <p className="text-xs text-gray-500">XLSX, XLS</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} />
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

export default FileProcessor;