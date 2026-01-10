"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTrips, addTrip, updateTrip, deleteTrip, setLoading } from "@/store/slices/tripSlice";
import { Trip } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useTrips() {
    const dispatch = useAppDispatch();
    const trips = useAppSelector((state) => state.trips.items);
    const loading = useAppSelector((state) => state.trips.loading);
    const lastTripNo = useAppSelector((state) => state.trips.lastTripNo);

    const fetchTrips = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<Trip[]>("/api/trips");
            dispatch(setTrips(data));
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            toast.error("Failed to load trips");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const getNextTripNo = useCallback(async (): Promise<number> => {
        try {
            const data = await api.get<{ nextTripNo: number }>("/api/trips/next-number");
            return data.nextTripNo;
        } catch (error) {
            console.error("Failed to get next trip number:", error);
            return lastTripNo + 1;
        }
    }, [lastTripNo]);

    const createTrip = useCallback(async (data: Omit<Trip, "id" | "createdAt" | "updatedAt" | "tripNo">) => {
        toast.loading("Creating trip...");
        try {
            const trip = await api.post<Trip>("/api/trips", data);
            dispatch(addTrip(trip));
            toast.success("Trip created successfully");
            return trip;
        } catch (error) {
            console.error("Failed to create trip:", error);
            toast.error("Failed to create trip");
            throw error;
        }
    }, [dispatch]);

    const editTrip = useCallback(async (id: string, updates: Partial<Trip>) => {
        toast.loading("Updating trip...");
        try {
            const trip = await api.put<Trip>(`/api/trips/${id}`, updates);
            dispatch(updateTrip({ id, updates: trip }));
            toast.success("Trip updated successfully");
            return trip;
        } catch (error) {
            console.error("Failed to update trip:", error);
            toast.error("Failed to update trip");
            throw error;
        }
    }, [dispatch]);

    const removeTrip = useCallback(async (id: string) => {
        toast.loading("Deleting trip...");
        try {
            await api.delete(`/api/trips/${id}`);
            dispatch(deleteTrip(id));
            toast.success("Trip deleted successfully");
        } catch (error) {
            console.error("Failed to delete trip:", error);
            toast.error("Failed to delete trip");
            throw error;
        }
    }, [dispatch]);

    return {
        trips,
        loading,
        lastTripNo,
        fetchTrips,
        getNextTripNo,
        createTrip,
        editTrip,
        removeTrip,
    };
}
