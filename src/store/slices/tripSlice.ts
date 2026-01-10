import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Trip } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface TripState {
    items: Trip[];
    loading: boolean;
    lastTripNo: number;
}

const initialState: TripState = {
    items: [],
    loading: true,
    lastTripNo: 0,
};

const tripSlice = createSlice({
    name: "trips",
    initialState,
    reducers: {
        loadTrips: (state) => {
            state.items = getItems<Trip>(STORAGE_KEYS.TRIPS);
            // Find the highest trip number
            state.lastTripNo = state.items.reduce((max, trip) => Math.max(max, trip.tripNo), 0);
            state.loading = false;
        },
        addTrip: (state, action: PayloadAction<Omit<Trip, "id" | "createdAt" | "updatedAt" | "tripNo">>) => {
            const now = new Date().toISOString();
            state.lastTripNo += 1;
            const trip: Trip = {
                ...action.payload,
                id: uuidv4(),
                tripNo: state.lastTripNo,
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(trip);
            setItems(STORAGE_KEYS.TRIPS, state.items);
        },
        updateTrip: (state, action: PayloadAction<{ id: string; updates: Partial<Trip> }>) => {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.TRIPS, state.items);
            }
        },
        deleteTrip: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((t) => t.id !== action.payload);
            setItems(STORAGE_KEYS.TRIPS, state.items);
        },
    },
});

export const { loadTrips, addTrip, updateTrip, deleteTrip } = tripSlice.actions;
export default tripSlice.reducer;
