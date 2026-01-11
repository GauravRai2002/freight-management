/**
 * Bulk Import Service
 * Prepares and sends data to the bulk import API
 */

import { TripImportData, DEFAULT_EXPENSE_CATEGORIES, isMarketTrip, DEFAULT_TRIP_VALUES } from './importConfig';

// Bulk import request format
export interface BulkImportRequest {
    trips: BulkTripPayload[];
    expenses: BulkExpensePayload[];
    expenseCategories: Array<{ name: string; mode: 'Fuel' | 'Expenses' | 'General' }>;
    vehicles: Array<string>;
}

export interface BulkTripPayload {
    tripNo: string;  // String to preserve format like "PB-2025/26-001"
    date: string;
    vehNo: string;
    fromLocation: string;
    toLocation: string;
    tripKm: number;
    tripFare: number;
    totalTripFare: number;
    tripExpense: number;
    profitStatement: number;
    plantName: string;
    carQty: number;
    loadKm: number;
    emptyKm: number;
    isMarketTrip: boolean;
    driverName: string;
    fuelExpAmt: number;
    average: number;
    rtFare: number;
    stMiter: number;
    endMiter: number;
    dieselRate: number;
    ltr: number;
    exIncome: number;
    driverBal: number;
    lockStatus: boolean;
}

export interface BulkExpensePayload {
    tripNo: string;  // String to preserve format like "PB-2025/26-001"
    date: string;
    expenseType: string;
    amount: number;
    fromAccount: string;
    refVehNo: string;
    remark1: string;
    remark2: string;
    isNonTripExp: boolean;
}

export interface BulkImportResponse {
    success: boolean;
    data: {
        tripsCreated: number;
        tripsFailed: number;
        expensesCreated: number;
        expensesFailed: number;
        categoriesCreated: number;
        errors: Array<{
            type: 'trip' | 'expense' | 'category';
            index: number;
            tripNo?: string;
            message: string;
        }>;
    };
}

/**
 * Convert parsed import data to bulk API format
 */
export function prepareBulkImportPayload(importData: TripImportData[]): BulkImportRequest {
    const trips: BulkTripPayload[] = [];
    const expenses: BulkExpensePayload[] = [];
    const categoryNames = new Set<string>();
    const vehicles = new Set<string>();

    for (const row of importData) {
        if (!row.isValid) continue;

        // Add trip
        trips.push({
            tripNo: row.tripNo,
            date: row.date,
            vehNo: row.vehNo,
            fromLocation: row.fromLocation,
            toLocation: row.toLocation,
            tripKm: row.tripKm,
            tripFare: row.tripFare,
            totalTripFare: row.tripFare,
            tripExpense: row.tripExpense,
            profitStatement: row.profitStatement,
            plantName: row.plantName,
            carQty: row.carQty,
            loadKm: row.loadKm,
            emptyKm: row.emptyKm,
            isMarketTrip: isMarketTrip(row.plantName),
            driverName: DEFAULT_TRIP_VALUES.driverName,
            fuelExpAmt: DEFAULT_TRIP_VALUES.fuelExpAmt,
            average: DEFAULT_TRIP_VALUES.average,
            rtFare: DEFAULT_TRIP_VALUES.rtFare,
            stMiter: DEFAULT_TRIP_VALUES.stMiter,
            endMiter: DEFAULT_TRIP_VALUES.endMiter,
            dieselRate: DEFAULT_TRIP_VALUES.dieselRate,
            ltr: DEFAULT_TRIP_VALUES.ltr,
            exIncome: DEFAULT_TRIP_VALUES.exIncome,
            driverBal: DEFAULT_TRIP_VALUES.driverBal,
            lockStatus: DEFAULT_TRIP_VALUES.lockStatus,
        });

        // Add expenses for this trip
        for (const [categoryName, amount] of Object.entries(row.expenses)) {
            if (amount > 0) {
                categoryNames.add(categoryName);
                expenses.push({
                    tripNo: row.tripNo,
                    date: row.date,
                    expenseType: categoryName,
                    amount,
                    fromAccount: '',
                    refVehNo: row.vehNo,
                    remark1: `Imported from ${row.plantName}`,
                    remark2: '',
                    isNonTripExp: false,
                });
            }
        }

        vehicles.add(row.vehNo);
    }

    // Prepare expense categories
    const expenseCategories = Array.from(categoryNames).map(name => {
        const defaultCat = DEFAULT_EXPENSE_CATEGORIES.find(
            c => c.name.toLowerCase() === name.toLowerCase()
        );
        return {
            name,
            mode: (defaultCat?.mode || 'Expenses') as 'Fuel' | 'Expenses' | 'General',
        };
    });

    const _vehicles = Array.from(vehicles);

    return { trips, expenses, expenseCategories, vehicles: _vehicles };
}
