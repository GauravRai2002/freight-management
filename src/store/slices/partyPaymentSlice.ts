import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PartyPayment } from "@/types";

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
        setPartyPayments: (state, action: PayloadAction<PartyPayment[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addPartyPayment: (state, action: PayloadAction<PartyPayment>) => {
            state.items.push(action.payload);
        },
        updatePartyPayment: (state, action: PayloadAction<{ id: string; updates: Partial<PartyPayment> }>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deletePartyPayment: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setPartyPayments, addPartyPayment, updatePartyPayment, deletePartyPayment, setLoading } = partyPaymentSlice.actions;
export default partyPaymentSlice.reducer;
