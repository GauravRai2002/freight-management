/**
 * Import Configuration
 * Defines field mappings between Excel columns and Trip/Expense models
 */

// Excel column headers from PB sheet → Trip field mappings
// Supports multiple column name variations (PB sheet format + simple CSV format)
export const TRIP_FIELD_MAPPINGS: Record<string, { field: keyof TripImportData; type: 'string' | 'number' | 'date' | 'boolean' }> = {
    // Trip Number variations
    'Trip Number': { field: 'tripNo', type: 'number' },
    'tripNo': { field: 'tripNo', type: 'number' },
    'trip_no': { field: 'tripNo', type: 'number' },
    'TripNo': { field: 'tripNo', type: 'number' },
    // Date variations
    'Loading date': { field: 'date', type: 'date' },
    'date': { field: 'date', type: 'date' },
    'Date': { field: 'date', type: 'date' },
    // Vehicle variations
    'Vehicle number': { field: 'vehNo', type: 'string' },
    'vehNo': { field: 'vehNo', type: 'string' },
    'veh_no': { field: 'vehNo', type: 'string' },
    'VehNo': { field: 'vehNo', type: 'string' },
    'Vehicle': { field: 'vehNo', type: 'string' },
    // Plant name variations
    'PLANT NAME': { field: 'plantName', type: 'string' },
    'plantName': { field: 'plantName', type: 'string' },
    'plant_name': { field: 'plantName', type: 'string' },
    'Plant Name': { field: 'plantName', type: 'string' },
    // From/To variations
    'From': { field: 'fromLocation', type: 'string' },
    'from': { field: 'fromLocation', type: 'string' },
    'fromLocation': { field: 'fromLocation', type: 'string' },
    'To': { field: 'toLocation', type: 'string' },
    'to': { field: 'toLocation', type: 'string' },
    'toLocation': { field: 'toLocation', type: 'string' },
    // Car qty variations
    'Car QTY': { field: 'carQty', type: 'number' },
    'carQty': { field: 'carQty', type: 'number' },
    'car_qty': { field: 'carQty', type: 'number' },
    'Cars': { field: 'carQty', type: 'number' },
    // Invoice/fare variations
    'INVOICE AMOUNT2': { field: 'tripFare', type: 'number' },
    'tripFare': { field: 'tripFare', type: 'number' },
    'trip_fare': { field: 'tripFare', type: 'number' },
    'Invoice': { field: 'tripFare', type: 'number' },
    'Fare': { field: 'tripFare', type: 'number' },
    // Expense variations
    'Total Exp.': { field: 'tripExpense', type: 'number' },
    'tripExpense': { field: 'tripExpense', type: 'number' },
    'trip_expense': { field: 'tripExpense', type: 'number' },
    'Expense': { field: 'tripExpense', type: 'number' },
    // KM variations
    'LOAD K.M': { field: 'loadKm', type: 'number' },
    'loadKm': { field: 'loadKm', type: 'number' },
    'load_km': { field: 'loadKm', type: 'number' },
    'EMPTY K.M': { field: 'emptyKm', type: 'number' },
    'emptyKm': { field: 'emptyKm', type: 'number' },
    'empty_km': { field: 'emptyKm', type: 'number' },
    'Total k.m': { field: 'tripKm', type: 'number' },
    'tripKm': { field: 'tripKm', type: 'number' },
    'trip_km': { field: 'tripKm', type: 'number' },
    'KM': { field: 'tripKm', type: 'number' },
    // Profit variations
    'Profit/loss': { field: 'profitStatement', type: 'number' },
    'profitStatement': { field: 'profitStatement', type: 'number' },
    'profit_statement': { field: 'profitStatement', type: 'number' },
    'Profit': { field: 'profitStatement', type: 'number' },
    // Driver name variations (optional)
    'Driver Name': { field: 'driverName', type: 'string' },
    'driverName': { field: 'driverName', type: 'string' },
    'driver_name': { field: 'driverName', type: 'string' },
    'Driver': { field: 'driverName', type: 'string' },
    // Fuel expense variations (optional)
    'Fuel Expense': { field: 'fuelExpAmt', type: 'number' },
    'fuelExpAmt': { field: 'fuelExpAmt', type: 'number' },
    'fuel_exp_amt': { field: 'fuelExpAmt', type: 'number' },
    'Fuel Exp': { field: 'fuelExpAmt', type: 'number' },
    // Average variations (optional)
    'Average': { field: 'average', type: 'number' },
    'average': { field: 'average', type: 'number' },
    'Avg': { field: 'average', type: 'number' },
    // RT fare variations (optional)
    'RT Fare': { field: 'rtFare', type: 'number' },
    'rtFare': { field: 'rtFare', type: 'number' },
    'rt_fare': { field: 'rtFare', type: 'number' },
    'Return Fare': { field: 'rtFare', type: 'number' },
    // Start meter variations (optional)
    'Start Meter': { field: 'stMiter', type: 'number' },
    'stMiter': { field: 'stMiter', type: 'number' },
    'st_miter': { field: 'stMiter', type: 'number' },
    'Start KM': { field: 'stMiter', type: 'number' },
    // End meter variations (optional)
    'End Meter': { field: 'endMiter', type: 'number' },
    'endMiter': { field: 'endMiter', type: 'number' },
    'end_miter': { field: 'endMiter', type: 'number' },
    'End KM': { field: 'endMiter', type: 'number' },
    // Diesel rate variations (optional)
    'Diesel Rate': { field: 'dieselRate', type: 'number' },
    'dieselRate': { field: 'dieselRate', type: 'number' },
    'diesel_rate': { field: 'dieselRate', type: 'number' },
    // Liters variations (optional)
    'Liters': { field: 'ltr', type: 'number' },
    'ltr': { field: 'ltr', type: 'number' },
    'Ltrs': { field: 'ltr', type: 'number' },
    'Ltr': { field: 'ltr', type: 'number' },
    // Extra income variations (optional)
    'Extra Income': { field: 'exIncome', type: 'number' },
    'exIncome': { field: 'exIncome', type: 'number' },
    'ex_income': { field: 'exIncome', type: 'number' },
    // Driver balance variations (optional)
    'Driver Balance': { field: 'driverBal', type: 'number' },
    'driverBal': { field: 'driverBal', type: 'number' },
    'driver_bal': { field: 'driverBal', type: 'number' },
    // Lock status variations (optional)
    'Lock Status': { field: 'lockStatus', type: 'boolean' },
    'lockStatus': { field: 'lockStatus', type: 'boolean' },
    'lock_status': { field: 'lockStatus', type: 'boolean' },
    'Locked': { field: 'lockStatus', type: 'boolean' },
};

// Excel column headers that map to Expense entries
export const EXPENSE_FIELD_MAPPINGS: Record<string, string> = {
    'Diesel': 'Diesel',
    'TOLL': 'TOLL',
    'Border': 'Border',
    'Mumbai cran': 'Crane',
    'Maintenes': 'Maintenance',
    'Pod': 'POD Charges',
    'Police/Gurd': 'Police/Guard',
    'Conductor': 'Conductor',
    'Parking': 'Parking',
    'OTHER': 'Other',
    'Ad Blue': 'Ad Blue',
};

// Default expense categories to seed
export const DEFAULT_EXPENSE_CATEGORIES = [
    { name: 'Diesel', mode: 'Fuel' as const },
    { name: 'TOLL', mode: 'Expenses' as const },
    { name: 'Border', mode: 'Expenses' as const },
    { name: 'Crane', mode: 'Expenses' as const },
    { name: 'Maintenance', mode: 'Expenses' as const },
    { name: 'POD Charges', mode: 'Expenses' as const },
    { name: 'Police/Guard', mode: 'Expenses' as const },
    { name: 'Conductor', mode: 'Expenses' as const },
    { name: 'Parking', mode: 'Expenses' as const },
    { name: 'Other', mode: 'Expenses' as const },
    { name: 'Ad Blue', mode: 'Expenses' as const },
];

// Columns to ignore (calculated or not needed)
export const IGNORED_COLUMNS = [
    'S.No',
    'MONTH',
    'EXP PER K.M',
    'PROFIT PER K.M',
    'Column1',
];

// Type for imported trip data (before API submission)
export interface TripImportData {
    tripNo: string;  // Changed to string to preserve format like "PB-2025/26-001"
    date: string;
    vehNo: string;
    plantName: string;
    fromLocation: string;
    toLocation: string;
    carQty: number;
    tripFare: number;
    tripExpense: number;
    loadKm: number;
    emptyKm: number;
    tripKm: number;
    profitStatement: number;
    // Optional fields (will use defaults if not provided)
    driverName?: string;
    fuelExpAmt?: number;
    average?: number;
    rtFare?: number;
    stMiter?: number;
    endMiter?: number;
    dieselRate?: number;
    ltr?: number;
    exIncome?: number;
    driverBal?: number;
    lockStatus?: boolean;
    // Expense amounts (not stored on Trip, will create Expense entries)
    expenses: Record<string, number>;
    // Validation
    isValid: boolean;
    errors: string[];
}

// Optional fields with their display names and default values
export const OPTIONAL_TRIP_FIELDS: Record<string, { displayName: string; defaultValue: string | number | boolean }> = {
    driverName: { displayName: 'Driver Name', defaultValue: '' },
    fuelExpAmt: { displayName: 'Fuel Expense', defaultValue: 0 },
    average: { displayName: 'Average', defaultValue: 0 },
    rtFare: { displayName: 'RT Fare', defaultValue: 0 },
    stMiter: { displayName: 'Start Meter', defaultValue: 0 },
    endMiter: { displayName: 'End Meter', defaultValue: 0 },
    dieselRate: { displayName: 'Diesel Rate', defaultValue: 0 },
    ltr: { displayName: 'Liters', defaultValue: 0 },
    exIncome: { displayName: 'Extra Income', defaultValue: 0 },
    driverBal: { displayName: 'Driver Balance', defaultValue: 0 },
    lockStatus: { displayName: 'Lock Status', defaultValue: false },
};

// Default values for fields not in import
export const DEFAULT_TRIP_VALUES = {
    driverName: '',
    fuelExpAmt: 0,
    average: 0,
    rtFare: 0,
    stMiter: 0,
    endMiter: 0,
    dieselRate: 0,
    ltr: 0,
    exIncome: 0,
    driverBal: 0,
    lockStatus: false,
};

// Helper to check if a plant name indicates a market trip
export function isMarketTrip(plantName: string): boolean {
    return plantName?.toUpperCase().includes('MARKET') ?? false;
}

// Helper to parse Excel date serial number to ISO date string
export function parseExcelDate(value: number | string): string {
    if (typeof value === 'number') {
        // Excel date serial number (days since 1900-01-01, with Excel's leap year bug)
        const excelEpoch = new Date(1899, 11, 30);
        const date = new Date(excelEpoch.getTime() + value * 24 * 60 * 60 * 1000);
        return date.toISOString().split('T')[0];
    }
    if (typeof value === 'string') {
        // Try to parse as date string
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
        // Try DD.MM.YYYY format
        const parts = value.split('.');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
    }
    return new Date().toISOString().split('T')[0];
}

// Helper to extract trip number from format like "PB-2025/26-001" or just "1001"
export function parseTripNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    const str = String(value).trim();

    // If it's just a plain number, return it
    const plainNum = parseInt(str);
    if (!isNaN(plainNum) && str === String(plainNum)) {
        return plainNum;
    }

    // For format like "PB-2025/26-001", extract the last segment after the last dash
    // This gets "001" which becomes 1
    const lastDashMatch = str.match(/-(\d+)$/);
    if (lastDashMatch) {
        return parseInt(lastDashMatch[1], 10);
    }

    // Fallback: extract any trailing digits
    const trailingMatch = str.match(/(\d+)$/);
    if (trailingMatch) {
        return parseInt(trailingMatch[1], 10);
    }

    return 0;
}
