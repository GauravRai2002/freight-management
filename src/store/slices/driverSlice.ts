import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Driver } from "@/types";

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
        setDrivers: (state, action: PayloadAction<Driver[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addDriver: (state, action: PayloadAction<Driver>) => {
            state.items.push(action.payload);
        },
        updateDriver: (state, action: PayloadAction<{ id: string; updates: Partial<Driver> }>) => {
            const index = state.items.findIndex((d) => d.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteDriver: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((d) => d.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setDrivers, addDriver, updateDriver, deleteDriver, setLoading } = driverSlice.actions;
export default driverSlice.reducer;
