"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBillingParties, addBillingParty, updateBillingParty, deleteBillingParty, setLoading } from "@/store/slices/billingPartySlice";
import { BillingParty } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useBillingParties() {
    const dispatch = useAppDispatch();
    const billingParties = useAppSelector((state) => state.billingParties.items);
    const loading = useAppSelector((state) => state.billingParties.loading);

    const fetchBillingParties = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<BillingParty[]>("/api/billing-parties");
            dispatch(setBillingParties(data));
        } catch (error) {
            console.error("Failed to fetch billing parties:", error);
            toast.error("Failed to load billing parties");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createBillingParty = useCallback(async (data: Omit<BillingParty, "id" | "createdAt" | "updatedAt" | "billAmtTrip" | "billAmtRT" | "receiveAmt" | "balanceAmt">) => {
        toast.loading("Creating billing party...");
        try {
            const party = await api.post<BillingParty>("/api/billing-parties", data);
            dispatch(addBillingParty(party));
            toast.success("Billing party created successfully");
            return party;
        } catch (error) {
            console.error("Failed to create billing party:", error);
            toast.error("Failed to create billing party");
            throw error;
        }
    }, [dispatch]);

    const editBillingParty = useCallback(async (id: string, updates: Partial<BillingParty>) => {
        toast.loading("Updating billing party...");
        try {
            const party = await api.put<BillingParty>(`/api/billing-parties/${id}`, updates);
            dispatch(updateBillingParty({ id, updates: party }));
            toast.success("Billing party updated successfully");
            return party;
        } catch (error) {
            console.error("Failed to update billing party:", error);
            toast.error("Failed to update billing party");
            throw error;
        }
    }, [dispatch]);

    const removeBillingParty = useCallback(async (id: string) => {
        toast.loading("Deleting billing party...");
        try {
            await api.delete(`/api/billing-parties/${id}`);
            dispatch(deleteBillingParty(id));
            toast.success("Billing party deleted successfully");
        } catch (error) {
            console.error("Failed to delete billing party:", error);
            toast.error("Failed to delete billing party");
            throw error;
        }
    }, [dispatch]);

    return {
        billingParties,
        loading,
        fetchBillingParties,
        createBillingParty,
        editBillingParty,
        removeBillingParty,
    };
}
