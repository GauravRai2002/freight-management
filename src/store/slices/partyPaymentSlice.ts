import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PartyPayment } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface PartyPaymentState {
    items: PartyPayment[];
    loading: boolean;
}

const initialState: PartyPaymentState = {
    items: [],
    loading: true,
};

const partyPaymentSlice = createSlice({
    name: "partyPayments",
    initialState,
    reducers: {
        loadPartyPayments: (state) => {
            state.items = getItems<PartyPayment>(STORAGE_KEYS.PARTY_PAYMENTS);
            state.loading = false;
        },
        addPartyPayment: (state, action: PayloadAction<Omit<PartyPayment, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const payment: PartyPayment = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(payment);
            setItems(STORAGE_KEYS.PARTY_PAYMENTS, state.items);
        },
        updatePartyPayment: (state, action: PayloadAction<{ id: string; updates: Partial<PartyPayment> }>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.PARTY_PAYMENTS, state.items);
            }
        },
        deletePartyPayment: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
            setItems(STORAGE_KEYS.PARTY_PAYMENTS, state.items);
        },
    },
});

export const { loadPartyPayments, addPartyPayment, updatePartyPayment, deletePartyPayment } = partyPaymentSlice.actions;
export default partyPaymentSlice.reducer;
