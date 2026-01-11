// =====================
// Master Data Types
// =====================

export interface Vehicle {
    id: string;
    vehNo: string;
    vehType: string;
    totalTrip: number;
    netProfit: number;
    createdAt: string;
    updatedAt: string;
}

export interface Driver {
    id: string;
    name: string;
    contactNo: string;
    drCr: "Dr" | "Cr" | "";
    openBal: number;
    remark: string;
    debit: number;
    credit: number;
    closeBal: number;
    createdAt: string;
    updatedAt: string;
}

export interface BillingParty {
    id: string;
    name: string;
    contactNo: string;
    drCr: "Dr" | "Cr" | "";
    openBal: number;
    remark: string;
    billAmtTrip: number;
    billAmtRT: number;
    receiveAmt: number;
    balanceAmt: number;
    createdAt: string;
    updatedAt: string;
}

export interface Transporter {
    id: string;
    vehNo: string;
    name: string;
    drCr: "Dr" | "Cr" | "";
    openBal: number;
    remark: string;
    totalTrip: number;
    profit: number;
    billAmt: number;
    paidAmt: number;
    closeBal: number;
    createdAt: string;
    updatedAt: string;
}

export interface ExpenseCategory {
    id: string;
    name: string;
    mode: "General" | "Expenses" | "Fuel";
    createdAt: string;
    updatedAt: string;
}

export interface PaymentMode {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export interface StockItem {
    id: string;
    name: string;
    openQty: number;
    stkIn: number;
    stkOut: number;
    closeQty: number;
    createdAt: string;
    updatedAt: string;
}

// =====================
// Transaction Types
// =====================

export interface Trip {
    id: string;
    tripNo: string;
    date: string;
    vehNo: string;
    driverName: string;
    fromLocation: string;
    toLocation: string;
    tripKm: number;
    fuelExpAmt: number;
    average: number;
    tripFare: number;
    rtFare: number;
    totalTripFare: number;
    tripExpense: number;
    profitStatement: number;
    stMiter: number;
    endMiter: number;
    dieselRate: number;
    ltr: number;
    isMarketTrip: boolean;
    exIncome: number;
    driverBal: number;
    lockStatus: boolean;
    // New fields for import
    plantName: string;      // Plant/Party name (e.g., "MARKET", "TOYOTA")
    carQty: number;         // Number of cars/units transported
    loadKm: number;         // KM traveled when loaded
    emptyKm: number;        // KM traveled when empty
    createdAt: string;
    updatedAt: string;
}

export interface TripBook {
    id: string;
    tripNo: string;
    date: string;
    lrNo: string;
    billingPartyId: string;
    billingPartyName: string;
    freightMode: "FIX" | "PE Ton" | "PE KG";
    tripAmount: number;
    advanceAmt: number;
    shortageAmt: number;
    deductionAmt: number;
    holdingAmt: number;
    receivedAmt: number;
    pendingAmt: number;
    transporterId: string;
    transporterName: string;
    marketVehNo: string;
    marketFreight: number;
    marketAdvance: number;
    marketBalance: number;
    lWeight: number;
    uWeight: number;
    remark: string;
    netProfit: number;
    createdAt: string;
    updatedAt: string;
}

export interface DriverAdvance {
    id: string;
    tripNo: string;
    date: string;
    driverName: string;
    mode: string;
    fromAccount: string;
    debit: number;
    credit: number;
    fuelLtr: number;
    remark: string;
    runBal: number;
    createdAt: string;
    updatedAt: string;
}

export interface Expense {
    id: string;
    tripNo: string;
    date: string;
    expenseType: string;
    amount: number;
    fromAccount: string;
    refVehNo: string;
    remark1: string;
    remark2: string;
    isNonTripExp: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ReturnTrip {
    id: string;
    tripNo: string;
    date: string;
    billingPartyId: string;
    billingPartyName: string;
    lrNo: string;
    rtFreight: number;
    advanceAmt: number;
    shortageAmt: number;
    deductionAmt: number;
    holdingAmt: number;
    receivedAmt: number;
    pendingAmt: number;
    mode: string;
    toBank: string;
    remark: string;
    createdAt: string;
    updatedAt: string;
}

export interface PartyPayment {
    id: string;
    tripNo: string;
    date: string;
    billingPartyId: string;
    billingPartyName: string;
    mode: string;
    receiveAmt: number;
    shortageAmt: number;
    deductionAmt: number;
    lrNo: string;
    toBank: string;
    remark: string;
    runBal: number;
    createdAt: string;
    updatedAt: string;
}

export interface MarketVehPayment {
    id: string;
    tripNo: string;
    date: string;
    transporterId: string;
    transporterName: string;
    marketVehNo: string;
    mode: string;
    paidAmt: number;
    lrNo: string;
    fromBank: string;
    remark: string;
    runBal: number;
    createdAt: string;
    updatedAt: string;
}

export interface StockEntry {
    id: string;
    date: string;
    stockItemId: string;
    stockItemName: string;
    entryType: "IN" | "OUT";
    quantity: number;
    remark: string;
    createdAt: string;
    updatedAt: string;
}

// =====================
// Form Types (for creating/updating)
// =====================

export type VehicleFormData = Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "totalTrip" | "netProfit">;
export type DriverFormData = Omit<Driver, "id" | "createdAt" | "updatedAt" | "debit" | "credit" | "closeBal">;
export type BillingPartyFormData = Omit<BillingParty, "id" | "createdAt" | "updatedAt" | "billAmtTrip" | "billAmtRT" | "receiveAmt" | "balanceAmt">;
export type TransporterFormData = Omit<Transporter, "id" | "createdAt" | "updatedAt" | "totalTrip" | "profit" | "billAmt" | "paidAmt" | "closeBal">;
export type ExpenseCategoryFormData = Omit<ExpenseCategory, "id" | "createdAt" | "updatedAt">;
export type PaymentModeFormData = Omit<PaymentMode, "id" | "createdAt" | "updatedAt">;
export type StockItemFormData = Omit<StockItem, "id" | "createdAt" | "updatedAt" | "stkIn" | "stkOut" | "closeQty">;
