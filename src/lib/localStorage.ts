/**
 * Generic localStorage service for CRUD operations
 */

export function getItems<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
}

export function setItems<T>(key: string, items: T[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(key, JSON.stringify(items));
}

export function addItem<T extends { id: string }>(key: string, item: T): T[] {
    const items = getItems<T>(key);
    items.push(item);
    setItems(key, items);
    return items;
}

export function updateItem<T extends { id: string }>(
    key: string,
    id: string,
    updates: Partial<T>
): T[] {
    const items = getItems<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
        items[index] = { ...items[index], ...updates };
        setItems(key, items);
    }
    return items;
}

export function deleteItem<T extends { id: string }>(
    key: string,
    id: string
): T[] {
    const items = getItems<T>(key).filter((item) => item.id !== id);
    setItems(key, items);
    return items;
}

export function getItemById<T extends { id: string }>(
    key: string,
    id: string
): T | undefined {
    const items = getItems<T>(key);
    return items.find((item) => item.id === id);
}

// Storage keys for all entities
export const STORAGE_KEYS = {
    VEHICLES: "vehicles",
    DRIVERS: "drivers",
    BILLING_PARTIES: "billingParties",
    TRANSPORTERS: "transporters",
    EXPENSE_CATEGORIES: "expenseCategories",
    PAYMENT_MODES: "paymentModes",
    STOCK_ITEMS: "stockItems",
    TRIPS: "trips",
    TRIP_BOOKS: "tripBooks",
    DRIVER_ADVANCES: "driverAdvances",
    EXPENSES: "expenses",
    RETURN_TRIPS: "returnTrips",
    PARTY_PAYMENTS: "partyPayments",
    MARKET_VEH_PAYMENTS: "marketVehPayments",
    STOCK_ENTRIES: "stockEntries",
} as const;
