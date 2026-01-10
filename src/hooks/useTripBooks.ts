"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTripBooks, addTripBook, updateTripBook, deleteTripBook, setLoading } from "@/store/slices/tripBookSlice";
import { TripBook } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useTripBooks() {
    const dispatch = useAppDispatch();
    const tripBooks = useAppSelector((state) => state.tripBooks.items);
    const loading = useAppSelector((state) => state.tripBooks.loading);
    const { getAuthContext } = useAuthContext();

    const fetchTripBooks = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<TripBook[]>("/api/trip-books", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setTripBooks(data));
        } catch (error) {
            console.error("Failed to fetch trip books:", error);
            toast.error("Failed to load trip books");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createTripBook = useCallback(async (data: Omit<TripBook, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating trip book...");
        try {
            const auth = await getAuthContext();
            const tripBook = await api.post<TripBook>("/api/trip-books", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addTripBook(tripBook));
            toast.success("Trip book created successfully");
            return tripBook;
        } catch (error) {
            console.error("Failed to create trip book:", error);
            toast.error("Failed to create trip book");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editTripBook = useCallback(async (id: string, updates: Partial<TripBook>) => {
        toast.loading("Updating trip book...");
        try {
            const auth = await getAuthContext();
            const tripBook = await api.put<TripBook>(`/api/trip-books/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateTripBook({ id, updates: tripBook }));
            toast.success("Trip book updated successfully");
            return tripBook;
        } catch (error) {
            console.error("Failed to update trip book:", error);
            toast.error("Failed to update trip book");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeTripBook = useCallback(async (id: string) => {
        toast.loading("Deleting trip book...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/trip-books/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteTripBook(id));
            toast.success("Trip book deleted successfully");
        } catch (error) {
            console.error("Failed to delete trip book:", error);
            toast.error("Failed to delete trip book");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        tripBooks,
        loading,
        fetchTripBooks,
        createTripBook,
        editTripBook,
        removeTripBook,
    };
}
