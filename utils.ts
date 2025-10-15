export const parseDateCellValue = (value: any): Date | null => {
    if (!value) return null;

    // Case 1: Already a valid Date object from sheetjs
    if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
    }
    
    // Case 2: A number (Excel serial date)
    if (typeof value === 'number' && value > 1) {
        const utcMilliseconds = (value - 25569) * 24 * 60 * 60 * 1000;
        const date = new Date(utcMilliseconds);
        if (!isNaN(date.getTime())) return date;
    }

    // Case 3: A string that needs parsing
    if (typeof value !== 'string') return null;
    const dateString = value.trim();
    if (dateString === '') return null;

    // ISO 8601 format: YYYY-MM-DD
    if (/^\d{4}-\d{1,2}-\d{1,2}/.test(dateString)) {
        const parts = dateString.split('-').map(p => parseInt(p, 10));
        const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
        if (!isNaN(date.getTime())) return date;
    }

    // Common format: DD/MM/YYYY or DD-MM-YYYY
    const parts = dateString.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
    if (parts) {
        const day = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10);
        let year = parseInt(parts[3], 10);

        if (year < 100) {
            year += (year > 50 ? 1900 : 2000);
        }
        
        if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1000) {
            const date = new Date(Date.UTC(year, month - 1, day));
            if (!isNaN(date.getTime())) return date;
        }
    }

    return null; // Failed to parse
};


export const calculateExperience = (startDate: Date, endDate: Date): { years: number, months: number, days: number } => {
    if (startDate > endDate) {
        return { years: 0, months: 0, days: 0 };
    }

    let years = endDate.getUTCFullYear() - startDate.getUTCFullYear();
    let months = endDate.getUTCMonth() - startDate.getUTCMonth();
    let days = endDate.getUTCDate() - startDate.getUTCDate();

    if (days < 0) {
        months--;
        // Get the last day of the previous month in UTC
        const lastDayOfPrevMonth = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 0)).getUTCDate();
        days += lastDayOfPrevMonth;
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    return { years, months, days };
};


export const addMonthsUTC = (date: Date, months: number): Date => {
  const newDate = new Date(date.getTime());
  newDate.setUTCMonth(newDate.getUTCMonth() + months);
  return newDate;
};
    
export const formatDateForExcel = (date: Date): string => {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
};

export const getISODate = (date: Date): string => {
    return date.toISOString().split('T')[0];
};