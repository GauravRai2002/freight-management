import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Vehicle } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

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
        loadVehicles: (state) => {
            state.items = getItems<Vehicle>(STORAGE_KEYS.VEHICLES);
            state.loading = false;
        },
        addVehicle: (state, action: PayloadAction<Omit<Vehicle, "id" | "createdAt" | "updatedAt" | "totalTrip" | "netProfit">>) => {
            const now = new Date().toISOString();
            const vehicle: Vehicle = {
                ...action.payload,
                id: uuidv4(),
                totalTrip: 0,
                netProfit: 0,
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(vehicle);
            setItems(STORAGE_KEYS.VEHICLES, state.items);
        },
        updateVehicle: (state, action: PayloadAction<{ id: string; updates: Partial<Vehicle> }>) => {
            const index = state.items.findIndex((v) => v.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.VEHICLES, state.items);
            }
        },
        deleteVehicle: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((v) => v.id !== action.payload);
            setItems(STORAGE_KEYS.VEHICLES, state.items);
        },
    },
});

export const { loadVehicles, addVehicle, updateVehicle, deleteVehicle } = vehicleSlice.actions;
export default vehicleSlice.reducer;
