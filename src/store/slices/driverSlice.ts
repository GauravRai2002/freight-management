import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Driver } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface DriverState {
    items: Driver[];
    loading: boolean;
}

const initialState: DriverState = {
    items: [],
    loading: true,
};

const driverSlice = createSlice({
    name: "drivers",
    initialState,
    reducers: {
        loadDrivers: (state) => {
            state.items = getItems<Driver>(STORAGE_KEYS.DRIVERS);
            state.loading = false;
        },
        addDriver: (state, action: PayloadAction<Omit<Driver, "id" | "createdAt" | "updatedAt" | "debit" | "credit" | "closeBal">>) => {
            const now = new Date().toISOString();
            const driver: Driver = {
                ...action.payload,
                id: uuidv4(),
                debit: 0,
                credit: 0,
                closeBal: action.payload.openBal,
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(driver);
            setItems(STORAGE_KEYS.DRIVERS, state.items);
        },
        updateDriver: (state, action: PayloadAction<{ id: string; updates: Partial<Driver> }>) => {
            const index = state.items.findIndex((d) => d.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.DRIVERS, state.items);
            }
        },
        deleteDriver: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((d) => d.id !== action.payload);
            setItems(STORAGE_KEYS.DRIVERS, state.items);
        },
    },
});

export const { loadDrivers, addDriver, updateDriver, deleteDriver } = driverSlice.actions;
export default driverSlice.reducer;
