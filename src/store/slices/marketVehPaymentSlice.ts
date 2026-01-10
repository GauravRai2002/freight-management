import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketVehPayment } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface MarketVehPaymentState {
    items: MarketVehPayment[];
    loading: boolean;
}

const initialState: MarketVehPaymentState = {
    items: [],
    loading: true,
};

const marketVehPaymentSlice = createSlice({
    name: "marketVehPayments",
    initialState,
    reducers: {
        loadMarketVehPayments: (state) => {
            state.items = getItems<MarketVehPayment>(STORAGE_KEYS.MARKET_VEH_PAYMENTS);
            state.loading = false;
        },
        addMarketVehPayment: (state, action: PayloadAction<Omit<MarketVehPayment, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const payment: MarketVehPayment = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(payment);
            setItems(STORAGE_KEYS.MARKET_VEH_PAYMENTS, state.items);
        },
        updateMarketVehPayment: (state, action: PayloadAction<{ id: string; updates: Partial<MarketVehPayment> }>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.MARKET_VEH_PAYMENTS, state.items);
            }
        },
        deleteMarketVehPayment: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
            setItems(STORAGE_KEYS.MARKET_VEH_PAYMENTS, state.items);
        },
    },
});

export const { loadMarketVehPayments, addMarketVehPayment, updateMarketVehPayment, deleteMarketVehPayment } = marketVehPaymentSlice.actions;
export default marketVehPaymentSlice.reducer;
