import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { MarketVehPayment } from "@/types";

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
        setMarketVehPayments: (state, action: PayloadAction<MarketVehPayment[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addMarketVehPayment: (state, action: PayloadAction<MarketVehPayment>) => {
            state.items.push(action.payload);
        },
        updateMarketVehPayment: (state, action: PayloadAction<{ id: string; updates: Partial<MarketVehPayment> }>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteMarketVehPayment: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setMarketVehPayments, addMarketVehPayment, updateMarketVehPayment, deleteMarketVehPayment, setLoading } = marketVehPaymentSlice.actions;
export default marketVehPaymentSlice.reducer;
