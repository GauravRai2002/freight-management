import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ReturnTrip } from "@/types";

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
        setReturnTrips: (state, action: PayloadAction<ReturnTrip[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addReturnTrip: (state, action: PayloadAction<ReturnTrip>) => {
            state.items.push(action.payload);
        },
        updateReturnTrip: (state, action: PayloadAction<{ id: string; updates: Partial<ReturnTrip> }>) => {
            const index = state.items.findIndex((r) => r.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteReturnTrip: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((r) => r.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setReturnTrips, addReturnTrip, updateReturnTrip, deleteReturnTrip, setLoading } = returnTripSlice.actions;
export default returnTripSlice.reducer;
