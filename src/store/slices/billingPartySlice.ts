import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { BillingParty } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

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
        loadBillingParties: (state) => {
            state.items = getItems<BillingParty>(STORAGE_KEYS.BILLING_PARTIES);
            state.loading = false;
        },
        addBillingParty: (state, action: PayloadAction<Omit<BillingParty, "id" | "createdAt" | "updatedAt" | "billAmtTrip" | "billAmtRT" | "receiveAmt" | "balanceAmt">>) => {
            const now = new Date().toISOString();
            const party: BillingParty = {
                ...action.payload,
                id: uuidv4(),
                billAmtTrip: 0,
                billAmtRT: 0,
                receiveAmt: 0,
                balanceAmt: action.payload.openBal,
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(party);
            setItems(STORAGE_KEYS.BILLING_PARTIES, state.items);
        },
        updateBillingParty: (state, action: PayloadAction<{ id: string; updates: Partial<BillingParty> }>) => {
            const index = state.items.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.BILLING_PARTIES, state.items);
            }
        },
        deleteBillingParty: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((p) => p.id !== action.payload);
            setItems(STORAGE_KEYS.BILLING_PARTIES, state.items);
        },
    },
});

export const { loadBillingParties, addBillingParty, updateBillingParty, deleteBillingParty } = billingPartySlice.actions;
export default billingPartySlice.reducer;
