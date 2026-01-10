import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockItem } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface StockItemState {
    items: StockItem[];
    loading: boolean;
}

const initialState: StockItemState = {
    items: [],
    loading: true,
};

const stockItemSlice = createSlice({
    name: "stockItems",
    initialState,
    reducers: {
        loadStockItems: (state) => {
            state.items = getItems<StockItem>(STORAGE_KEYS.STOCK_ITEMS);
            state.loading = false;
        },
        addStockItem: (state, action: PayloadAction<Omit<StockItem, "id" | "createdAt" | "updatedAt" | "stkIn" | "stkOut" | "closeQty">>) => {
            const now = new Date().toISOString();
            const item: StockItem = {
                ...action.payload,
                id: uuidv4(),
                stkIn: 0,
                stkOut: 0,
                closeQty: action.payload.openQty,
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(item);
            setItems(STORAGE_KEYS.STOCK_ITEMS, state.items);
        },
        updateStockItem: (state, action: PayloadAction<{ id: string; updates: Partial<StockItem> }>) => {
            const index = state.items.findIndex((i) => i.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.STOCK_ITEMS, state.items);
            }
        },
        deleteStockItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
            setItems(STORAGE_KEYS.STOCK_ITEMS, state.items);
        },
    },
});

export const { loadStockItems, addStockItem, updateStockItem, deleteStockItem } = stockItemSlice.actions;
export default stockItemSlice.reducer;
