import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Expense } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

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
        loadExpenses: (state) => {
            state.items = getItems<Expense>(STORAGE_KEYS.EXPENSES);
            state.loading = false;
        },
        addExpense: (state, action: PayloadAction<Omit<Expense, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const expense: Expense = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(expense);
            setItems(STORAGE_KEYS.EXPENSES, state.items);
        },
        updateExpense: (state, action: PayloadAction<{ id: string; updates: Partial<Expense> }>) => {
            const index = state.items.findIndex((e) => e.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.EXPENSES, state.items);
            }
        },
        deleteExpense: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((e) => e.id !== action.payload);
            setItems(STORAGE_KEYS.EXPENSES, state.items);
        },
    },
});

export const { loadExpenses, addExpense, updateExpense, deleteExpense } = expenseSlice.actions;
export default expenseSlice.reducer;
