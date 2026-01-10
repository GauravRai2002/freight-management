"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTransporters, addTransporter, updateTransporter, deleteTransporter, setLoading } from "@/store/slices/transporterSlice";
import { Transporter } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useTransporters() {
    const dispatch = useAppDispatch();
    const transporters = useAppSelector((state) => state.transporters.items);
    const loading = useAppSelector((state) => state.transporters.loading);

    const fetchTransporters = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<Transporter[]>("/api/transporters");
            dispatch(setTransporters(data));
        } catch (error) {
            console.error("Failed to fetch transporters:", error);
            toast.error("Failed to load transporters");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createTransporter = useCallback(async (data: Omit<Transporter, "id" | "createdAt" | "updatedAt" | "totalTrip" | "profit" | "billAmt" | "paidAmt" | "closeBal">) => {
        toast.loading("Creating transporter...");
        try {
            const transporter = await api.post<Transporter>("/api/transporters", data);
            dispatch(addTransporter(transporter));
            toast.success("Transporter created successfully");
            return transporter;
        } catch (error) {
            console.error("Failed to create transporter:", error);
            toast.error("Failed to create transporter");
            throw error;
        }
    }, [dispatch]);

    const editTransporter = useCallback(async (id: string, updates: Partial<Transporter>) => {
        toast.loading("Updating transporter...");
        try {
            const transporter = await api.put<Transporter>(`/api/transporters/${id}`, updates);
            dispatch(updateTransporter({ id, updates: transporter }));
            toast.success("Transporter updated successfully");
            return transporter;
        } catch (error) {
            console.error("Failed to update transporter:", error);
            toast.error("Failed to update transporter");
            throw error;
        }
    }, [dispatch]);

    const removeTransporter = useCallback(async (id: string) => {
        toast.loading("Deleting transporter...");
        try {
            await api.delete(`/api/transporters/${id}`);
            dispatch(deleteTransporter(id));
            toast.success("Transporter deleted successfully");
        } catch (error) {
            console.error("Failed to delete transporter:", error);
            toast.error("Failed to delete transporter");
            throw error;
        }
    }, [dispatch]);

    return {
        transporters,
        loading,
        fetchTransporters,
        createTransporter,
        editTransporter,
        removeTransporter,
    };
}
