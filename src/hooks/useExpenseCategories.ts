"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory, setLoading } from "@/store/slices/expenseCategorySlice";
import { ExpenseCategory } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useExpenseCategories() {
    const dispatch = useAppDispatch();
    const expenseCategories = useAppSelector((state) => state.expenseCategories.items);
    const loading = useAppSelector((state) => state.expenseCategories.loading);
    const { getAuthContext } = useAuthContext();

    const fetchExpenseCategories = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<ExpenseCategory[]>("/api/expense-categories", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setExpenseCategories(data));
        } catch (error) {
            console.error("Failed to fetch expense categories:", error);
            toast.error("Failed to load expense categories");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createExpenseCategory = useCallback(async (data: Omit<ExpenseCategory, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating expense category...");
        try {
            const auth = await getAuthContext();
            const category = await api.post<ExpenseCategory>("/api/expense-categories", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addExpenseCategory(category));
            toast.success("Expense category created successfully");
            return category;
        } catch (error) {
            console.error("Failed to create expense category:", error);
            toast.error("Failed to create expense category");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editExpenseCategory = useCallback(async (id: string, updates: Partial<ExpenseCategory>) => {
        toast.loading("Updating expense category...");
        try {
            const auth = await getAuthContext();
            const category = await api.put<ExpenseCategory>(`/api/expense-categories/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateExpenseCategory({ id, updates: category }));
            toast.success("Expense category updated successfully");
            return category;
        } catch (error) {
            console.error("Failed to update expense category:", error);
            toast.error("Failed to update expense category");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeExpenseCategory = useCallback(async (id: string) => {
        toast.loading("Deleting expense category...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/expense-categories/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteExpenseCategory(id));
            toast.success("Expense category deleted successfully");
        } catch (error) {
            console.error("Failed to delete expense category:", error);
            toast.error("Failed to delete expense category");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        expenseCategories,
        loading,
        fetchExpenseCategories,
        createExpenseCategory,
        editExpenseCategory,
        removeExpenseCategory,
    };
}
