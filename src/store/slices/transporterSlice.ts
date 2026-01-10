import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Transporter } from "@/types";

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
        setTransporters: (state, action: PayloadAction<Transporter[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addTransporter: (state, action: PayloadAction<Transporter>) => {
            state.items.push(action.payload);
        },
        updateTransporter: (state, action: PayloadAction<{ id: string; updates: Partial<Transporter> }>) => {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteTransporter: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((t) => t.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setTransporters, addTransporter, updateTransporter, deleteTransporter, setLoading } = transporterSlice.actions;
export default transporterSlice.reducer;
