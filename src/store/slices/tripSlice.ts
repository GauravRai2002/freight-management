import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Trip } from "@/types";

interface TripState {
    items: Trip[];
    loading: boolean;
}

const initialState: TripState = {
    items: [],
    loading: true,
};

const tripSlice = createSlice({
    name: "trips",
    initialState,
    reducers: {
        setTrips: (state, action: PayloadAction<Trip[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addTrip: (state, action: PayloadAction<Trip>) => {
            state.items.push(action.payload);
        },
        updateTrip: (state, action: PayloadAction<{ id: string; updates: Partial<Trip> }>) => {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteTrip: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((t) => t.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setTrips, addTrip, updateTrip, deleteTrip, setLoading } = tripSlice.actions;
export default tripSlice.reducer;
