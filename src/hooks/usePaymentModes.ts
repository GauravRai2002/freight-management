"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode, setLoading } from "@/store/slices/paymentModeSlice";
import { PaymentMode } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function usePaymentModes() {
    const dispatch = useAppDispatch();
    const paymentModes = useAppSelector((state) => state.paymentModes.items);
    const loading = useAppSelector((state) => state.paymentModes.loading);

    const fetchPaymentModes = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<PaymentMode[]>("/api/payment-modes");
            dispatch(setPaymentModes(data));
        } catch (error) {
            console.error("Failed to fetch payment modes:", error);
            toast.error("Failed to load payment modes");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createPaymentMode = useCallback(async (data: Omit<PaymentMode, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating payment mode...");
        try {
            const mode = await api.post<PaymentMode>("/api/payment-modes", data);
            dispatch(addPaymentMode(mode));
            toast.success("Payment mode created successfully");
            return mode;
        } catch (error) {
            console.error("Failed to create payment mode:", error);
            toast.error("Failed to create payment mode");
            throw error;
        }
    }, [dispatch]);

    const editPaymentMode = useCallback(async (id: string, updates: Partial<PaymentMode>) => {
        toast.loading("Updating payment mode...");
        try {
            const mode = await api.put<PaymentMode>(`/api/payment-modes/${id}`, updates);
            dispatch(updatePaymentMode({ id, updates: mode }));
            toast.success("Payment mode updated successfully");
            return mode;
        } catch (error) {
            console.error("Failed to update payment mode:", error);
            toast.error("Failed to update payment mode");
            throw error;
        }
    }, [dispatch]);

    const removePaymentMode = useCallback(async (id: string) => {
        toast.loading("Deleting payment mode...");
        try {
            await api.delete(`/api/payment-modes/${id}`);
            dispatch(deletePaymentMode(id));
            toast.success("Payment mode deleted successfully");
        } catch (error) {
            console.error("Failed to delete payment mode:", error);
            toast.error("Failed to delete payment mode");
            throw error;
        }
    }, [dispatch]);

    return {
        paymentModes,
        loading,
        fetchPaymentModes,
        createPaymentMode,
        editPaymentMode,
        removePaymentMode,
    };
}
