import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DriverAdvance } from "@/types";

interface DriverAdvanceState {
    items: DriverAdvance[];
    loading: boolean;
}

const initialState: DriverAdvanceState = {
    items: [],
    loading: true,
};

const driverAdvanceSlice = createSlice({
    name: "driverAdvances",
    initialState,
    reducers: {
        setDriverAdvances: (state, action: PayloadAction<DriverAdvance[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addDriverAdvance: (state, action: PayloadAction<DriverAdvance>) => {
            state.items.push(action.payload);
        },
        updateDriverAdvance: (state, action: PayloadAction<{ id: string; updates: Partial<DriverAdvance> }>) => {
            const index = state.items.findIndex((a) => a.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteDriverAdvance: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((a) => a.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setDriverAdvances, addDriverAdvance, updateDriverAdvance, deleteDriverAdvance, setLoading } = driverAdvanceSlice.actions;
export default driverAdvanceSlice.reducer;
