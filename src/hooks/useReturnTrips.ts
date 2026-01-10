"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setReturnTrips, addReturnTrip, updateReturnTrip, deleteReturnTrip, setLoading } from "@/store/slices/returnTripSlice";
import { ReturnTrip } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useReturnTrips() {
    const dispatch = useAppDispatch();
    const returnTrips = useAppSelector((state) => state.returnTrips.items);
    const loading = useAppSelector((state) => state.returnTrips.loading);

    const fetchReturnTrips = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<ReturnTrip[]>("/api/return-trips");
            dispatch(setReturnTrips(data));
        } catch (error) {
            console.error("Failed to fetch return trips:", error);
            toast.error("Failed to load return trips");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createReturnTrip = useCallback(async (data: Omit<ReturnTrip, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating return trip...");
        try {
            const returnTrip = await api.post<ReturnTrip>("/api/return-trips", data);
            dispatch(addReturnTrip(returnTrip));
            toast.success("Return trip created successfully");
            return returnTrip;
        } catch (error) {
            console.error("Failed to create return trip:", error);
            toast.error("Failed to create return trip");
            throw error;
        }
    }, [dispatch]);

    const editReturnTrip = useCallback(async (id: string, updates: Partial<ReturnTrip>) => {
        toast.loading("Updating return trip...");
        try {
            const returnTrip = await api.put<ReturnTrip>(`/api/return-trips/${id}`, updates);
            dispatch(updateReturnTrip({ id, updates: returnTrip }));
            toast.success("Return trip updated successfully");
            return returnTrip;
        } catch (error) {
            console.error("Failed to update return trip:", error);
            toast.error("Failed to update return trip");
            throw error;
        }
    }, [dispatch]);

    const removeReturnTrip = useCallback(async (id: string) => {
        toast.loading("Deleting return trip...");
        try {
            await api.delete(`/api/return-trips/${id}`);
            dispatch(deleteReturnTrip(id));
            toast.success("Return trip deleted successfully");
        } catch (error) {
            console.error("Failed to delete return trip:", error);
            toast.error("Failed to delete return trip");
            throw error;
        }
    }, [dispatch]);

    return {
        returnTrips,
        loading,
        fetchReturnTrips,
        createReturnTrip,
        editReturnTrip,
        removeReturnTrip,
    };
}
