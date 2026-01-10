"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setPartyPayments, addPartyPayment, updatePartyPayment, deletePartyPayment, setLoading } from "@/store/slices/partyPaymentSlice";
import { PartyPayment } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function usePartyPayments() {
    const dispatch = useAppDispatch();
    const partyPayments = useAppSelector((state) => state.partyPayments.items);
    const loading = useAppSelector((state) => state.partyPayments.loading);

    const fetchPartyPayments = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<PartyPayment[]>("/api/party-payments");
            dispatch(setPartyPayments(data));
        } catch (error) {
            console.error("Failed to fetch party payments:", error);
            toast.error("Failed to load party payments");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createPartyPayment = useCallback(async (data: Omit<PartyPayment, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating party payment...");
        try {
            const payment = await api.post<PartyPayment>("/api/party-payments", data);
            dispatch(addPartyPayment(payment));
            toast.success("Party payment created successfully");
            return payment;
        } catch (error) {
            console.error("Failed to create party payment:", error);
            toast.error("Failed to create party payment");
            throw error;
        }
    }, [dispatch]);

    const editPartyPayment = useCallback(async (id: string, updates: Partial<PartyPayment>) => {
        toast.loading("Updating party payment...");
        try {
            const payment = await api.put<PartyPayment>(`/api/party-payments/${id}`, updates);
            dispatch(updatePartyPayment({ id, updates: payment }));
            toast.success("Party payment updated successfully");
            return payment;
        } catch (error) {
            console.error("Failed to update party payment:", error);
            toast.error("Failed to update party payment");
            throw error;
        }
    }, [dispatch]);

    const removePartyPayment = useCallback(async (id: string) => {
        toast.loading("Deleting party payment...");
        try {
            await api.delete(`/api/party-payments/${id}`);
            dispatch(deletePartyPayment(id));
            toast.success("Party payment deleted successfully");
        } catch (error) {
            console.error("Failed to delete party payment:", error);
            toast.error("Failed to delete party payment");
            throw error;
        }
    }, [dispatch]);

    return {
        partyPayments,
        loading,
        fetchPartyPayments,
        createPartyPayment,
        editPartyPayment,
        removePartyPayment,
    };
}
