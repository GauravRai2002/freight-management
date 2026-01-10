import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transporter } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface TransporterState {
    items: Transporter[];
    loading: boolean;
}

const initialState: TransporterState = {
    items: [],
    loading: true,
};

const transporterSlice = createSlice({
    name: "transporters",
    initialState,
    reducers: {
        loadTransporters: (state) => {
            state.items = getItems<Transporter>(STORAGE_KEYS.TRANSPORTERS);
            state.loading = false;
        },
        addTransporter: (state, action: PayloadAction<Omit<Transporter, "id" | "createdAt" | "updatedAt" | "totalTrip" | "profit" | "billAmt" | "paidAmt" | "closeBal">>) => {
            const now = new Date().toISOString();
            const transporter: Transporter = {
                ...action.payload,
                id: uuidv4(),
                totalTrip: 0,
                profit: 0,
                billAmt: 0,
                paidAmt: 0,
                closeBal: action.payload.openBal,
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(transporter);
            setItems(STORAGE_KEYS.TRANSPORTERS, state.items);
        },
        updateTransporter: (state, action: PayloadAction<{ id: string; updates: Partial<Transporter> }>) => {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.TRANSPORTERS, state.items);
            }
        },
        deleteTransporter: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((t) => t.id !== action.payload);
            setItems(STORAGE_KEYS.TRANSPORTERS, state.items);
        },
    },
});

export const { loadTransporters, addTransporter, updateTransporter, deleteTransporter } = transporterSlice.actions;
export default transporterSlice.reducer;
