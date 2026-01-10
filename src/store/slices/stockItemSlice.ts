import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StockItem } from "@/types";

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
        setStockItems: (state, action: PayloadAction<StockItem[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addStockItem: (state, action: PayloadAction<StockItem>) => {
            state.items.push(action.payload);
        },
        updateStockItem: (state, action: PayloadAction<{ id: string; updates: Partial<StockItem> }>) => {
            const index = state.items.findIndex((i) => i.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteStockItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setStockItems, addStockItem, updateStockItem, deleteStockItem, setLoading } = stockItemSlice.actions;
export default stockItemSlice.reducer;
