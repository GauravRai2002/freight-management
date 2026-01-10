import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DriverAdvance } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

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
        loadDriverAdvances: (state) => {
            state.items = getItems<DriverAdvance>(STORAGE_KEYS.DRIVER_ADVANCES);
            state.loading = false;
        },
        addDriverAdvance: (state, action: PayloadAction<Omit<DriverAdvance, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const advance: DriverAdvance = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(advance);
            setItems(STORAGE_KEYS.DRIVER_ADVANCES, state.items);
        },
        updateDriverAdvance: (state, action: PayloadAction<{ id: string; updates: Partial<DriverAdvance> }>) => {
            const index = state.items.findIndex((a) => a.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.DRIVER_ADVANCES, state.items);
            }
        },
        deleteDriverAdvance: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((a) => a.id !== action.payload);
            setItems(STORAGE_KEYS.DRIVER_ADVANCES, state.items);
        },
    },
});

export const { loadDriverAdvances, addDriverAdvance, updateDriverAdvance, deleteDriverAdvance } = driverAdvanceSlice.actions;
export default driverAdvanceSlice.reducer;
