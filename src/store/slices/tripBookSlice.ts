import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TripBook } from "@/types";

interface TripBookState {
    items: TripBook[];
    loading: boolean;
}

const initialState: TripBookState = {
    items: [],
    loading: true,
};

const tripBookSlice = createSlice({
    name: "tripBooks",
    initialState,
    reducers: {
        setTripBooks: (state, action: PayloadAction<TripBook[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addTripBook: (state, action: PayloadAction<TripBook>) => {
            state.items.push(action.payload);
        },
        updateTripBook: (state, action: PayloadAction<{ id: string; updates: Partial<TripBook> }>) => {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteTripBook: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((t) => t.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setTripBooks, addTripBook, updateTripBook, deleteTripBook, setLoading } = tripBookSlice.actions;
export default tripBookSlice.reducer;
