import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExpenseCategory } from "@/types";
import { getItems, setItems, STORAGE_KEYS } from "@/lib/localStorage";
import { v4 as uuidv4 } from "uuid";

interface ExpenseCategoryState {
    items: ExpenseCategory[];
    loading: boolean;
}

const initialState: ExpenseCategoryState = {
    items: [],
    loading: true,
};

const expenseCategorySlice = createSlice({
    name: "expenseCategories",
    initialState,
    reducers: {
        loadExpenseCategories: (state) => {
            state.items = getItems<ExpenseCategory>(STORAGE_KEYS.EXPENSE_CATEGORIES);
            state.loading = false;
        },
        addExpenseCategory: (state, action: PayloadAction<Omit<ExpenseCategory, "id" | "createdAt" | "updatedAt">>) => {
            const now = new Date().toISOString();
            const category: ExpenseCategory = {
                ...action.payload,
                id: uuidv4(),
                createdAt: now,
                updatedAt: now,
            };
            state.items.push(category);
            setItems(STORAGE_KEYS.EXPENSE_CATEGORIES, state.items);
        },
        updateExpenseCategory: (state, action: PayloadAction<{ id: string; updates: Partial<ExpenseCategory> }>) => {
            const index = state.items.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                    updatedAt: new Date().toISOString(),
                };
                setItems(STORAGE_KEYS.EXPENSE_CATEGORIES, state.items);
            }
        },
        deleteExpenseCategory: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((c) => c.id !== action.payload);
            setItems(STORAGE_KEYS.EXPENSE_CATEGORIES, state.items);
        },
    },
});

export const { loadExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } = expenseCategorySlice.actions;
export default expenseCategorySlice.reducer;
