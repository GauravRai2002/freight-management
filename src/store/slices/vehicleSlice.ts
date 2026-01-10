import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vehicle } from "@/types";

interface VehicleState {
    items: Vehicle[];
    loading: boolean;
}

const initialState: VehicleState = {
    items: [],
    loading: true,
};

const vehicleSlice = createSlice({
    name: "vehicles",
    initialState,
    reducers: {
        setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addVehicle: (state, action: PayloadAction<Vehicle>) => {
            state.items.push(action.payload);
        },
        updateVehicle: (state, action: PayloadAction<{ id: string; updates: Partial<Vehicle> }>) => {
            const index = state.items.findIndex((v) => v.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteVehicle: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((v) => v.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setVehicles, addVehicle, updateVehicle, deleteVehicle, setLoading } = vehicleSlice.actions;
export default vehicleSlice.reducer;
