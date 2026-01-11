/**
 * Import Service
 * Handles parsing of CSV/XLSX/XLS files and data transformation
 */

import * as XLSX from 'xlsx';
import {
    TRIP_FIELD_MAPPINGS,
    EXPENSE_FIELD_MAPPINGS,
    IGNORED_COLUMNS,
    OPTIONAL_TRIP_FIELDS,
    DEFAULT_TRIP_VALUES,
    TripImportData,
    parseExcelDate,
    isMarketTrip,
} from './importConfig';

export interface ParseResult {
    success: boolean;
    data: TripImportData[];
    headers: string[];
    extraFields: string[];
    missingFields: string[];
    fieldsUsingDefaults: string[];  // Optional fields not in file, will use defaults
    errors: string[];
    totalRows: number;
}

/**
 * Parse an uploaded file (CSV, XLSX, or XLS)
 */
export async function parseImportFile(file: File): Promise<ParseResult> {
    const errors: string[] = [];

    try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Always use the first sheet
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
            defval: '',
            raw: false, // Get formatted strings
        });

        if (jsonData.length === 0) {
            return {
                success: false,
                data: [],
                headers: [],
                extraFields: [],
                missingFields: [],
                fieldsUsingDefaults: [],
                errors: ['No data found in file'],
                totalRows: 0,
            };
        }

        // Get headers from first row
        const headers = Object.keys(jsonData[0]);

        // Detect extra and missing fields
        const knownFields = [
            ...Object.keys(TRIP_FIELD_MAPPINGS),
            ...Object.keys(EXPENSE_FIELD_MAPPINGS),
            ...IGNORED_COLUMNS,
        ];
        const extraFields = headers.filter(h => !knownFields.includes(h));

        // Find which target fields are actually mapped by the file's columns
        const mappedTargetFields = new Set<string>();
        for (const header of headers) {
            const mapping = TRIP_FIELD_MAPPINGS[header];
            if (mapping) {
                mappedTargetFields.add(mapping.field);
            }
        }

        // Required fields that must be present
        const requiredFields = ['tripNo', 'date', 'vehNo', 'from', 'to', 'tripFare'];
        const missingFields = requiredFields.filter(f => !mappedTargetFields.has(f));

        // Determine which optional fields are missing and will use defaults
        const optionalFieldNames = Object.keys(OPTIONAL_TRIP_FIELDS);
        const fieldsUsingDefaults = optionalFieldNames.filter(f => !mappedTargetFields.has(f));

        // Parse each row
        const data: TripImportData[] = [];
        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const rowErrors: string[] = [];

            // Skip empty rows
            const hasData = Object.values(row).some(v => v !== '' && v !== null && v !== undefined);
            if (!hasData) continue;

            // Parse trip fields - track which fields have been populated
            const tripData: Partial<TripImportData> = {
                tripNo: '',
                date: '',
                vehNo: '',
                plantName: '',
                fromLocation: '',
                toLocation: '',
                carQty: 0,
                tripFare: 0,
                tripExpense: 0,
                loadKm: 0,
                emptyKm: 0,
                tripKm: 0,
                profitStatement: 0,
                expenses: {},
                isValid: true,
                errors: [],
            };
            const populatedFields = new Set<string>();

            // Map trip fields - only set value if column exists in file
            for (const [excelCol, mapping] of Object.entries(TRIP_FIELD_MAPPINGS)) {
                const value = row[excelCol];
                if (value === undefined || value === '') {
                    continue;
                }

                // Mark this field as populated
                populatedFields.add(mapping.field);

                switch (mapping.type) {
                    case 'number':
                        if (mapping.field === 'tripNo') {
                            // Store tripNo as string to preserve format like "PB-2025/26-001"
                            (tripData as Record<string, unknown>)[mapping.field] = String(value).trim();
                        } else {
                            const num = parseFloat(String(value).replace(/,/g, ''));
                            (tripData as Record<string, unknown>)[mapping.field] = isNaN(num) ? 0 : num;
                        }
                        break;
                    case 'date':
                        (tripData as Record<string, unknown>)[mapping.field] = parseExcelDate(value as string | number);
                        break;
                    case 'string':
                        (tripData as Record<string, unknown>)[mapping.field] = String(value).trim();
                        break;
                    case 'boolean':
                        (tripData as Record<string, unknown>)[mapping.field] = Boolean(value);
                        break;
                }
            }

            // Validate required fields AFTER parsing all columns
            const requiredFieldNames: Record<string, string> = {
                tripNo: 'Trip Number',
                vehNo: 'Vehicle Number',
                fromLocation: 'From Location',
                toLocation: 'To Location',
            };
            for (const [field, displayName] of Object.entries(requiredFieldNames)) {
                if (!populatedFields.has(field)) {
                    // Only tripNo and vehNo are strictly required for now based on user feedback
                    if (field === 'tripNo' || field === 'vehNo') {
                        rowErrors.push(`Missing required field: ${displayName}`);
                    }
                }
            }

            // Map expense fields
            for (const [excelCol, categoryName] of Object.entries(EXPENSE_FIELD_MAPPINGS)) {
                const value = row[excelCol];
                if (value !== undefined && value !== '') {
                    const num = parseFloat(String(value).replace(/,/g, ''));
                    if (!isNaN(num) && num > 0) {
                        tripData.expenses![categoryName] = num;
                    }
                }
            }

            tripData.isValid = rowErrors.length === 0;
            tripData.errors = rowErrors;

            data.push(tripData as TripImportData);
        }

        return {
            success: true,
            data,
            headers,
            extraFields,
            missingFields,
            fieldsUsingDefaults,
            errors,
            totalRows: data.length,
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            headers: [],
            extraFields: [],
            missingFields: [],
            fieldsUsingDefaults: [],
            errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`],
            totalRows: 0,
        };
    }
}

/**
 * Convert imported data to API format for creating trips
 */
export function convertToTripPayload(importData: TripImportData) {
    return {
        tripNo: importData.tripNo,
        date: importData.date,
        vehNo: importData.vehNo,
        // Backend expects fromLocation/toLocation, not from/to
        fromLocation: importData.fromLocation,
        toLocation: importData.toLocation,
        tripKm: importData.tripKm,
        tripFare: importData.tripFare,
        totalTripFare: importData.tripFare, // Same as tripFare for imports
        tripExpense: importData.tripExpense,
        profitStatement: importData.profitStatement,
        plantName: importData.plantName,
        carQty: importData.carQty,
        loadKm: importData.loadKm,
        emptyKm: importData.emptyKm,
        isMarketTrip: isMarketTrip(importData.plantName),
        ...DEFAULT_TRIP_VALUES,
    };
}

/**
 * Convert expense data to API format for creating expenses
 */
export function convertToExpensePayloads(importData: TripImportData) {
    const expenses: Array<{
        tripNo: string;
        date: string;
        expenseType: string;
        amount: number;
        fromAccount: string;
        refVehNo: string;
        remark1: string;
        remark2: string;
        isNonTripExp: boolean;
    }> = [];

    for (const [categoryName, amount] of Object.entries(importData.expenses)) {
        if (amount > 0) {
            expenses.push({
                tripNo: importData.tripNo,
                date: importData.date,
                expenseType: categoryName,
                amount,
                fromAccount: '',
                refVehNo: importData.vehNo,
                remark1: `Imported from ${importData.plantName}`,
                remark2: '',
                isNonTripExp: false,
            });
        }
    }

    return expenses;
}
