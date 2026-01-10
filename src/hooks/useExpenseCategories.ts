"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, setLoading } from "@/store/slices/expenseCategorySlice";
import { ExpenseCategory } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useExpenseCategories() {
    const dispatch = useAppDispatch();
    const expenseCategories = useAppSelector((state) => state.expenseCategories.items);
    const loading = useAppSelector((state) => state.expenseCategories.loading);

    const fetchExpenseCategories = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<ExpenseCategory[]>("/api/expense-categories");
            dispatch(setExpenseCategories(data));
        } catch (error) {
            console.error("Failed to fetch expense categories:", error);
            toast.error("Failed to load expense categories");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createExpenseCategory = useCallback(async (data: Omit<ExpenseCategory, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating expense category...");
        try {
            const category = await api.post<ExpenseCategory>("/api/expense-categories", data);
            dispatch(addExpenseCategory(category));
            toast.success("Expense category created successfully");
            return category;
        } catch (error) {
            console.error("Failed to create expense category:", error);
            toast.error("Failed to create expense category");
            throw error;
        }
    }, [dispatch]);

    const editExpenseCategory = useCallback(async (id: string, updates: Partial<ExpenseCategory>) => {
        toast.loading("Updating expense category...");
        try {
            const category = await api.put<ExpenseCategory>(`/api/expense-categories/${id}`, updates);
            dispatch(updateExpenseCategory({ id, updates: category }));
            toast.success("Expense category updated successfully");
            return category;
        } catch (error) {
            console.error("Failed to update expense category:", error);
            toast.error("Failed to update expense category");
            throw error;
        }
    }, [dispatch]);

    const removeExpenseCategory = useCallback(async (id: string) => {
        toast.loading("Deleting expense category...");
        try {
            await api.delete(`/api/expense-categories/${id}`);
            dispatch(deleteExpenseCategory(id));
            toast.success("Expense category deleted successfully");
        } catch (error) {
            console.error("Failed to delete expense category:", error);
            toast.error("Failed to delete expense category");
            throw error;
        }
    }, [dispatch]);

    return {
        expenseCategories,
        loading,
        fetchExpenseCategories,
        createExpenseCategory,
        editExpenseCategory,
        removeExpenseCategory,
    };
}
