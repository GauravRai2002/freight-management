"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setExpenses, addExpense, updateExpense, deleteExpense, setLoading } from "@/store/slices/expenseSlice";
import { Expense } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useExpenses() {
    const dispatch = useAppDispatch();
    const expenses = useAppSelector((state) => state.expenses.items);
    const loading = useAppSelector((state) => state.expenses.loading);
    const { getAuthContext } = useAuthContext();

    const fetchExpenses = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<Expense[]>("/api/expenses", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setExpenses(data));
        } catch (error) {
            console.error("Failed to fetch expenses:", error);
            toast.error("Failed to load expenses");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createExpense = useCallback(async (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating expense...");
        try {
            const auth = await getAuthContext();
            const expense = await api.post<Expense>("/api/expenses", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addExpense(expense));
            toast.success("Expense created successfully");
            return expense;
        } catch (error) {
            console.error("Failed to create expense:", error);
            toast.error("Failed to create expense");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
        toast.loading("Updating expense...");
        try {
            const auth = await getAuthContext();
            const expense = await api.put<Expense>(`/api/expenses/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateExpense({ id, updates: expense }));
            toast.success("Expense updated successfully");
            return expense;
        } catch (error) {
            console.error("Failed to update expense:", error);
            toast.error("Failed to update expense");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeExpense = useCallback(async (id: string) => {
        toast.loading("Deleting expense...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/expenses/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteExpense(id));
            toast.success("Expense deleted successfully");
        } catch (error) {
            console.error("Failed to delete expense:", error);
            toast.error("Failed to delete expense");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        expenses,
        loading,
        fetchExpenses,
        createExpense,
        editExpense,
        removeExpense,
    };
}
