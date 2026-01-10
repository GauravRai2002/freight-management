"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTripBooks, addTripBook, updateTripBook, deleteTripBook, setLoading } from "@/store/slices/tripBookSlice";
import { TripBook } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";

export function useTripBooks() {
    const dispatch = useAppDispatch();
    const tripBooks = useAppSelector((state) => state.tripBooks.items);
    const loading = useAppSelector((state) => state.tripBooks.loading);

    const fetchTripBooks = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const data = await api.get<TripBook[]>("/api/trip-books");
            dispatch(setTripBooks(data));
        } catch (error) {
            console.error("Failed to fetch trip books:", error);
            toast.error("Failed to load trip books");
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    const createTripBook = useCallback(async (data: Omit<TripBook, "id" | "createdAt" | "updatedAt">) => {
        toast.loading("Creating trip book...");
        try {
            const tripBook = await api.post<TripBook>("/api/trip-books", data);
            dispatch(addTripBook(tripBook));
            toast.success("Trip book created successfully");
            return tripBook;
        } catch (error) {
            console.error("Failed to create trip book:", error);
            toast.error("Failed to create trip book");
            throw error;
        }
    }, [dispatch]);

    const editTripBook = useCallback(async (id: string, updates: Partial<TripBook>) => {
        toast.loading("Updating trip book...");
        try {
            const tripBook = await api.put<TripBook>(`/api/trip-books/${id}`, updates);
            dispatch(updateTripBook({ id, updates: tripBook }));
            toast.success("Trip book updated successfully");
            return tripBook;
        } catch (error) {
            console.error("Failed to update trip book:", error);
            toast.error("Failed to update trip book");
            throw error;
        }
    }, [dispatch]);

    const removeTripBook = useCallback(async (id: string) => {
        toast.loading("Deleting trip book...");
        try {
            await api.delete(`/api/trip-books/${id}`);
            dispatch(deleteTripBook(id));
            toast.success("Trip book deleted successfully");
        } catch (error) {
            console.error("Failed to delete trip book:", error);
            toast.error("Failed to delete trip book");
            throw error;
        }
    }, [dispatch]);

    return {
        tripBooks,
        loading,
        fetchTripBooks,
        createTripBook,
        editTripBook,
        removeTripBook,
    };
}
