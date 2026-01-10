import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReturnTrip } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface ReturnTripState {
    items: ReturnTrip[];
    loading: boolean;
}

const initialState: ReturnTripState = {
    items: [],
    loading: true,
};

const returnTripSlice = createSlice({
    name: "returnTrips",
    initialState,
    reducers: {
        loadReturnTrips: (state) => {
            state.items = getItems<ReturnTrip>(STORAGE_KEYS.RETURN_TRIPS);
            state.loading = false;
        },
        addReturnTrip: (state, action: PayloadAction<Omit<ReturnTrip, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const returnTrip: ReturnTrip = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(returnTrip);
            setItems(STORAGE_KEYS.RETURN_TRIPS, state.items);
        },
        updateReturnTrip: (state, action: PayloadAction<{ id: string; updates: Partial<ReturnTrip> }>) => {
            const index = state.items.findIndex((r) => r.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.RETURN_TRIPS, state.items);
            }
        },
        deleteReturnTrip: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((r) => r.id !== action.payload);
            setItems(STORAGE_KEYS.RETURN_TRIPS, state.items);
        },
    },
});

export const { loadReturnTrips, addReturnTrip, updateReturnTrip, deleteReturnTrip } = returnTripSlice.actions;
export default returnTripSlice.reducer;
