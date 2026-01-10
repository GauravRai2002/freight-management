import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaymentMode } from "@/types";

interface PaymentModeState {
    items: PaymentMode[];
    loading: boolean;
}

const initialState: PaymentModeState = {
    items: [],
    loading: true,
};

const paymentModeSlice = createSlice({
    name: "paymentModes",
    initialState,
    reducers: {
        setPaymentModes: (state, action: PayloadAction<PaymentMode[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addPaymentMode: (state, action: PayloadAction<PaymentMode>) => {
            state.items.push(action.payload);
        },
        updatePaymentMode: (state, action: PayloadAction<{ id: string; updates: Partial<PaymentMode> }>) => {
            const index = state.items.findIndex((m) => m.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deletePaymentMode: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((m) => m.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setPaymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode, setLoading } = paymentModeSlice.actions;
export default paymentModeSlice.reducer;
