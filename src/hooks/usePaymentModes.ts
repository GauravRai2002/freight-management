"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPaymentModes, addPaymentMode, updatePaymentMode, deletePaymentMode, setLoading } from "@/store/slices/paymentModeSlice";
import { PaymentMode } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function usePaymentModes() {
    const dispatch = useAppDispatch();
    const paymentModes = useAppSelector((state) => state.paymentModes.items);
    const loading = useAppSelector((state) => state.paymentModes.loading);
    const { getAuthContext } = useAuthContext();

    const fetchPaymentModes = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<PaymentMode[]>("/api/payment-modes", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setPaymentModes(data));
        } catch (error) {
            console.error("Failed to fetch payment modes:", error);
            toast.error("Failed to load payment modes");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createPaymentMode = useCallback(async (data: Omit<PaymentMode, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating payment mode...");
        try {
            const auth = await getAuthContext();
            const mode = await api.post<PaymentMode>("/api/payment-modes", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addPaymentMode(mode));
            toast.success("Payment mode created successfully");
            return mode;
        } catch (error) {
            console.error("Failed to create payment mode:", error);
            toast.error("Failed to create payment mode");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editPaymentMode = useCallback(async (id: string, updates: Partial<PaymentMode>) => {
        toast.loading("Updating payment mode...");
        try {
            const auth = await getAuthContext();
            const mode = await api.put<PaymentMode>(`/api/payment-modes/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updatePaymentMode({ id, updates: mode }));
            toast.success("Payment mode updated successfully");
            return mode;
        } catch (error) {
            console.error("Failed to update payment mode:", error);
            toast.error("Failed to update payment mode");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removePaymentMode = useCallback(async (id: string) => {
        toast.loading("Deleting payment mode...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/payment-modes/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deletePaymentMode(id));
            toast.success("Payment mode deleted successfully");
        } catch (error) {
            console.error("Failed to delete payment mode:", error);
            toast.error("Failed to delete payment mode");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        paymentModes,
        loading,
        fetchPaymentModes,
        createPaymentMode,
        editPaymentMode,
        removePaymentMode,
    };
}
