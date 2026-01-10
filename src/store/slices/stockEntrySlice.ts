import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockEntry } from "@/types";

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
        setStockEntries: (state, action: PayloadAction<StockEntry[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addStockEntry: (state, action: PayloadAction<StockEntry>) => {
            state.items.push(action.payload);
        },
        updateStockEntry: (state, action: PayloadAction<{ id: string; updates: Partial<StockEntry> }>) => {
            const index = state.items.findIndex((e) => e.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteStockEntry: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((e) => e.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setStockEntries, addStockEntry, updateStockEntry, deleteStockEntry, setLoading } = stockEntrySlice.actions;
export default stockEntrySlice.reducer;
