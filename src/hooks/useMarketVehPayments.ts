"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setMarketVehPayments, addMarketVehPayment, updateMarketVehPayment, deleteMarketVehPayment, setLoading } from "@/store/slices/marketVehPaymentSlice";
import { MarketVehPayment } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useMarketVehPayments() {
    const dispatch = useAppDispatch();
    const marketVehPayments = useAppSelector((state) => state.marketVehPayments.items);
    const loading = useAppSelector((state) => state.marketVehPayments.loading);
    const { getAuthContext } = useAuthContext();

    const fetchMarketVehPayments = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<MarketVehPayment[]>("/api/market-veh-payments", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setMarketVehPayments(data));
        } catch (error) {
            console.error("Failed to fetch market vehicle payments:", error);
            toast.error("Failed to load market vehicle payments");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createMarketVehPayment = useCallback(async (data: Omit<MarketVehPayment, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating market vehicle payment...");
        try {
            const auth = await getAuthContext();
            const payment = await api.post<MarketVehPayment>("/api/market-veh-payments", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addMarketVehPayment(payment));
            toast.success("Market vehicle payment created successfully");
            return payment;
        } catch (error) {
            console.error("Failed to create market vehicle payment:", error);
            toast.error("Failed to create market vehicle payment");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editMarketVehPayment = useCallback(async (id: string, updates: Partial<MarketVehPayment>) => {
        toast.loading("Updating market vehicle payment...");
        try {
            const auth = await getAuthContext();
            const payment = await api.put<MarketVehPayment>(`/api/market-veh-payments/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateMarketVehPayment({ id, updates: payment }));
            toast.success("Market vehicle payment updated successfully");
            return payment;
        } catch (error) {
            console.error("Failed to update market vehicle payment:", error);
            toast.error("Failed to update market vehicle payment");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeMarketVehPayment = useCallback(async (id: string) => {
        toast.loading("Deleting market vehicle payment...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/market-veh-payments/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteMarketVehPayment(id));
            toast.success("Market vehicle payment deleted successfully");
        } catch (error) {
            console.error("Failed to delete market vehicle payment:", error);
            toast.error("Failed to delete market vehicle payment");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        marketVehPayments,
        loading,
        fetchMarketVehPayments,
        createMarketVehPayment,
        editMarketVehPayment,
        removeMarketVehPayment,
    };
}
