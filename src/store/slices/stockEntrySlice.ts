import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockEntry } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface StockEntryState {
    items: StockEntry[];
    loading: boolean;
}

const initialState: StockEntryState = {
    items: [],
    loading: true,
};

const stockEntrySlice = createSlice({
    name: "stockEntries",
    initialState,
    reducers: {
        loadStockEntries: (state) => {
            state.items = getItems<StockEntry>(STORAGE_KEYS.STOCK_ENTRIES);
            state.loading = false;
        },
        addStockEntry: (state, action: PayloadAction<Omit<StockEntry, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const entry: StockEntry = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(entry);
            setItems(STORAGE_KEYS.STOCK_ENTRIES, state.items);
        },
        updateStockEntry: (state, action: PayloadAction<{ id: string; updates: Partial<StockEntry> }>) => {
            const index = state.items.findIndex((e) => e.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.STOCK_ENTRIES, state.items);
            }
        },
        deleteStockEntry: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((e) => e.id !== action.payload);
            setItems(STORAGE_KEYS.STOCK_ENTRIES, state.items);
        },
    },
});

export const { loadStockEntries, addStockEntry, updateStockEntry, deleteStockEntry } = stockEntrySlice.actions;
export default stockEntrySlice.reducer;
