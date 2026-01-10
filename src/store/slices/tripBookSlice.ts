import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TripBook } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

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
        loadTripBooks: (state) => {
            state.items = getItems<TripBook>(STORAGE_KEYS.TRIP_BOOKS);
            state.loading = false;
        },
        addTripBook: (state, action: PayloadAction<Omit<TripBook, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const tripBook: TripBook = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(tripBook);
            setItems(STORAGE_KEYS.TRIP_BOOKS, state.items);
        },
        updateTripBook: (state, action: PayloadAction<{ id: string; updates: Partial<TripBook> }>) => {
            const index = state.items.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.TRIP_BOOKS, state.items);
            }
        },
        deleteTripBook: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((t) => t.id !== action.payload);
            setItems(STORAGE_KEYS.TRIP_BOOKS, state.items);
        },
    },
});

export const { loadTripBooks, addTripBook, updateTripBook, deleteTripBook } = tripBookSlice.actions;
export default tripBookSlice.reducer;
