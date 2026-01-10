"use client";

import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setStockItems, addStockItem, updateStockItem, deleteStockItem, setLoading } from "@/store/slices/stockItemSlice";
import { StockItem } from "@/types";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/toaster";
import { useAuthContext } from "./useAuthContext";

export function useStockItems() {
    const dispatch = useAppDispatch();
    const stockItems = useAppSelector((state) => state.stockItems.items);
    const loading = useAppSelector((state) => state.stockItems.loading);
    const { getAuthContext } = useAuthContext();

    const fetchStockItems = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const auth = await getAuthContext();
            const data = await api.get<StockItem[]>("/api/stock-items", auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(setStockItems(data));
        } catch (error) {
            console.error("Failed to fetch stock items:", error);
            toast.error("Failed to load stock items");
            dispatch(setLoading(false));
        }
    }, [dispatch, getAuthContext]);

    const createStockItem = useCallback(async (data: Omit<StockItem, "id" | "createdAt" | "updatedAt" | "stkIn" | "stkOut" | "closeQty">) => {
        toast.loading("Creating stock item...");
        try {
            const auth = await getAuthContext();
            const item = await api.post<StockItem>("/api/stock-items", data, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(addStockItem(item));
            toast.success("Stock item created successfully");
            return item;
        } catch (error) {
            console.error("Failed to create stock item:", error);
            toast.error("Failed to create stock item");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const editStockItem = useCallback(async (id: string, updates: Partial<StockItem>) => {
        toast.loading("Updating stock item...");
        try {
            const auth = await getAuthContext();
            const item = await api.put<StockItem>(`/api/stock-items/${id}`, updates, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(updateStockItem({ id, updates: item }));
            toast.success("Stock item updated successfully");
            return item;
        } catch (error) {
            console.error("Failed to update stock item:", error);
            toast.error("Failed to update stock item");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    const removeStockItem = useCallback(async (id: string) => {
        toast.loading("Deleting stock item...");
        try {
            const auth = await getAuthContext();
            await api.delete(`/api/stock-items/${id}`, auth ? { token: auth.token, orgId: auth.orgId } : undefined);
            dispatch(deleteStockItem(id));
            toast.success("Stock item deleted successfully");
        } catch (error) {
            console.error("Failed to delete stock item:", error);
            toast.error("Failed to delete stock item");
            throw error;
        }
    }, [dispatch, getAuthContext]);

    return {
        stockItems,
        loading,
        fetchStockItems,
        createStockItem,
        editStockItem,
        removeStockItem,
    };
}
