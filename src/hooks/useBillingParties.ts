"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBillingParties, addBillingParty, updateBillingParty, deleteBillingParty, setLoading } from "@/store/slices/billingPartySlice";
import { BillingParty } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useBillingParties() {
    const dispatch = useAppDispatch();
    const billingParties = useAppSelector((state) => state.billingParties.items);
    const loading = useAppSelector((state) => state.billingParties.loading);
    const { getAuthContext } = useAuthContext();

    const fetchBillingParties = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<BillingParty[]>("/api/billing-parties", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setBillingParties(data));
        } catch (error) {
            console.error("Failed to fetch billing parties:", error);
            toast.error("Failed to load billing parties");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createBillingParty = useCallback(async (data: Omit<BillingParty, "id" | "createdAt" | "updatedAt" | "billAmtTrip" | "billAmtRT" | "receiveAmt" | "balanceAmt">) => {
        toast.loading("Creating billing party...");
        try {
            const auth = await getAuthContext();
            const party = await api.post<BillingParty>("/api/billing-parties", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addBillingParty(party));
            toast.success("Billing party created successfully");
            return party;
        } catch (error) {
            console.error("Failed to create billing party:", error);
            toast.error("Failed to create billing party");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editBillingParty = useCallback(async (id: string, updates: Partial<BillingParty>) => {
        toast.loading("Updating billing party...");
        try {
            const auth = await getAuthContext();
            const party = await api.put<BillingParty>(`/api/billing-parties/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateBillingParty({ id, updates: party }));
            toast.success("Billing party updated successfully");
            return party;
        } catch (error) {
            console.error("Failed to update billing party:", error);
            toast.error("Failed to update billing party");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeBillingParty = useCallback(async (id: string) => {
        toast.loading("Deleting billing party...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/billing-parties/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteBillingParty(id));
            toast.success("Billing party deleted successfully");
        } catch (error) {
            console.error("Failed to delete billing party:", error);
            toast.error("Failed to delete billing party");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        billingParties,
        loading,
        fetchBillingParties,
        createBillingParty,
        editBillingParty,
        removeBillingParty,
    };
}
