"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPartyPayments, addPartyPayment, updatePartyPayment, deletePartyPayment, setLoading } from "@/store/slices/partyPaymentSlice";
import { PartyPayment } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function usePartyPayments() {
    const dispatch = useAppDispatch();
    const partyPayments = useAppSelector((state) => state.partyPayments.items);
    const loading = useAppSelector((state) => state.partyPayments.loading);
    const { getAuthContext } = useAuthContext();

    const fetchPartyPayments = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<PartyPayment[]>("/api/party-payments", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setPartyPayments(data));
        } catch (error) {
            console.error("Failed to fetch party payments:", error);
            toast.error("Failed to load party payments");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createPartyPayment = useCallback(async (data: Omit<PartyPayment, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating party payment...");
        try {
            const auth = await getAuthContext();
            const payment = await api.post<PartyPayment>("/api/party-payments", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addPartyPayment(payment));
            toast.success("Party payment created successfully");
            return payment;
        } catch (error) {
            console.error("Failed to create party payment:", error);
            toast.error("Failed to create party payment");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editPartyPayment = useCallback(async (id: string, updates: Partial<PartyPayment>) => {
        toast.loading("Updating party payment...");
        try {
            const auth = await getAuthContext();
            const payment = await api.put<PartyPayment>(`/api/party-payments/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updatePartyPayment({ id, updates: payment }));
            toast.success("Party payment updated successfully");
            return payment;
        } catch (error) {
            console.error("Failed to update party payment:", error);
            toast.error("Failed to update party payment");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removePartyPayment = useCallback(async (id: string) => {
        toast.loading("Deleting party payment...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/party-payments/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deletePartyPayment(id));
            toast.success("Party payment deleted successfully");
        } catch (error) {
            console.error("Failed to delete party payment:", error);
            toast.error("Failed to delete party payment");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        partyPayments,
        loading,
        fetchPartyPayments,
        createPartyPayment,
        editPartyPayment,
        removePartyPayment,
    };
}
