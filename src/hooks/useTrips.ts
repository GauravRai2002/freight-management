"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTrips, addTrip, updateTrip, deleteTrip, setLoading } from "@/store/slices/tripSlice";
import { Trip } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useTrips() {
    const dispatch = useAppDispatch();
    const trips = useAppSelector((state) => state.trips.items);
    const loading = useAppSelector((state) => state.trips.loading);
    const { getAuthContext } = useAuthContext();

    const fetchTrips = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<Trip[]>("/api/trips", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setTrips(data));
        } catch (error) {
            console.error("Failed to fetch trips:", error);
            toast.error("Failed to load trips");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const getNextTripNo = useCallback(async (): Promise<string | null> => {
        try {
            const auth = await getAuthContext();
            const data = await api.get<{ nextTripNo: string }>("/api/trips/next-number", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            return data.nextTripNo;
        } catch (error) {
            console.error("Failed to get next trip number:", error);
            return null;  // User will enter manually
        }
    }, [getAuthContext]);

    const createTrip = useCallback(async (data: Omit<Trip, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating trip...");
        try {
            const auth = await getAuthContext();
            const trip = await api.post<Trip>("/api/trips", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addTrip(trip));
            toast.success("Trip created successfully");
            return trip;
        } catch (error) {
            console.error("Failed to create trip:", error);
            toast.error("Failed to create trip");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editTrip = useCallback(async (id: string, updates: Partial<Trip>) => {
        toast.loading("Updating trip...");
        try {
            const auth = await getAuthContext();
            const trip = await api.put<Trip>(`/api/trips/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateTrip({ id, updates: trip }));
            toast.success("Trip updated successfully");
            return trip;
        } catch (error) {
            console.error("Failed to update trip:", error);
            toast.error("Failed to update trip");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeTrip = useCallback(async (id: string) => {
        toast.loading("Deleting trip...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/trips/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteTrip(id));
            toast.success("Trip deleted successfully");
        } catch (error) {
            console.error("Failed to delete trip:", error);
            toast.error("Failed to delete trip");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        trips,
        loading,
        fetchTrips,
        getNextTripNo,
        createTrip,
        editTrip,
        removeTrip,
    };
}
