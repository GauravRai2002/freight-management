import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ExpenseCategory } from "@/types";

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
        setExpenseCategories: (state, action: PayloadAction<ExpenseCategory[]>) => {
            state.items = action.payload;
            state.loading = false;
        },
        addExpenseCategory: (state, action: PayloadAction<ExpenseCategory>) => {
            state.items.push(action.payload);
        },
        updateExpenseCategory: (state, action: PayloadAction<{ id: string; updates: Partial<ExpenseCategory> }>) => {
            const index = state.items.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = {
                    ...state.items[index],
                    ...action.payload.updates,
                };
            }
        },
        deleteExpenseCategory: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((c) => c.id !== action.payload);
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, setLoading } = expenseCategorySlice.actions;
export default expenseCategorySlice.reducer;
