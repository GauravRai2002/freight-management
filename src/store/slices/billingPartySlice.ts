import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BillingParty } from "@/types";

interface BillingPartyState {
    items: BillingParty[];
    loading: boolean;
}

const initialState: BillingPartyState = {
    items: [],
    loading: true,
};

const billingPartySlice = createSlice({
    name: "billingParties",
    initialState,
    reducers: {
        setBillingParties: (state, action: PayloadAction<BillingParty[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addBillingParty: (state, action: PayloadAction<BillingParty>) => {
            state.items.push(action.payload);
        },
        updateBillingParty: (state, action: PayloadAction<{ id: string; updates: Partial<BillingParty> }>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteBillingParty: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setBillingParties, addBillingParty, updateBillingParty, deleteBillingParty, setLoading } = billingPartySlice.actions;
export default billingPartySlice.reducer;
