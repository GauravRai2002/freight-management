import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaymentMode } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

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
        loadPaymentModes: (state) => {
            state.items = getItems<PaymentMode>(STORAGE_KEYS.PAYMENT_MODES);
            // Initialize with default payment modes if empty
            if (state.items.length === 0) {
                const now = new Date().toISOString();
                state.items = [
                    { id: uuidv4(), name: "CASH", createdAt: now, updatedAt: now },
                    { id: uuidv4(), name: "ONLINE", createdAt: now, updatedAt: now },
                    { id: uuidv4(), name: "CHEQUE", createdAt: now, updatedAt: now },
                    { id: uuidv4(), name: "UPI", createdAt: now, updatedAt: now },
                ];
                setItems(STORAGE_KEYS.PAYMENT_MODES, state.items);
            }
            state.loading = false;
        },
        addPaymentMode: (state, action: PayloadAction<Omit<PaymentMode, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const mode: PaymentMode = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(mode);
            setItems(STORAGE_KEYS.PAYMENT_MODES, state.items);
        },
        updatePaymentMode: (state, action: PayloadAction<{ id: string; updates: Partial<PaymentMode> }>) => {
            const index = state.items.findIndex((m) => m.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.PAYMENT_MODES, state.items);
            }
        },
        deletePaymentMode: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((m) => m.id !== action.payload);
            setItems(STORAGE_KEYS.PAYMENT_MODES, state.items);
        },
    },
});

export const { loadPaymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode } = paymentModeSlice.actions;
export default paymentModeSlice.reducer;
