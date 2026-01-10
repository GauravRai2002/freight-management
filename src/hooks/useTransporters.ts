"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTransporters, addTransporter, updateTransporter, deleteTransporter, setLoading } from "@/store/slices/transporterSlice";
import { Transporter } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useTransporters() {
    const dispatch = useAppDispatch();
    const transporters = useAppSelector((state) => state.transporters.items);
    const loading = useAppSelector((state) => state.transporters.loading);
    const { getAuthContext } = useAuthContext();

    const fetchTransporters = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<Transporter[]>("/api/transporters", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setTransporters(data));
        } catch (error) {
            console.error("Failed to fetch transporters:", error);
            toast.error("Failed to load transporters");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createTransporter = useCallback(async (data: Omit<Transporter, "id" | "createdAt" | "updatedAt" | "totalTrip" | "profit" | "billAmt" | "paidAmt" | "closeBal">) => {
        toast.loading("Creating transporter...");
        try {
            const auth = await getAuthContext();
            const transporter = await api.post<Transporter>("/api/transporters", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addTransporter(transporter));
            toast.success("Transporter created successfully");
            return transporter;
        } catch (error) {
            console.error("Failed to create transporter:", error);
            toast.error("Failed to create transporter");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editTransporter = useCallback(async (id: string, updates: Partial<Transporter>) => {
        toast.loading("Updating transporter...");
        try {
            const auth = await getAuthContext();
            const transporter = await api.put<Transporter>(`/api/transporters/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateTransporter({ id, updates: transporter }));
            toast.success("Transporter updated successfully");
            return transporter;
        } catch (error) {
            console.error("Failed to update transporter:", error);
            toast.error("Failed to update transporter");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeTransporter = useCallback(async (id: string) => {
        toast.loading("Deleting transporter...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/transporters/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteTransporter(id));
            toast.success("Transporter deleted successfully");
        } catch (error) {
            console.error("Failed to delete transporter:", error);
            toast.error("Failed to delete transporter");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        transporters,
        loading,
        fetchTransporters,
        createTransporter,
        editTransporter,
        removeTransporter,
    };
}
