import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Expense } from "@/types";

interface ExpenseState {
    items: Expense[];
    loading: boolean;
}

const initialState: ExpenseState = {
    items: [],
    loading: true,
};

const expenseSlice = createSlice({
    name: "expenses",
    initialState,
    reducers: {
        setExpenses: (state, action: PayloadAction<Expense[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addExpense: (state, action: PayloadAction<Expense>) => {
            state.items.push(action.payload);
        },
        updateExpense: (state, action: PayloadAction<{ id: string; updates: Partial<Expense> }>) => {
            const index = state.items.findIndex((e) => e.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteExpense: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((e) => e.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setExpenses, addExpense, updateExpense, deleteExpense, setLoading } = expenseSlice.actions;
export default expenseSlice.reducer;
