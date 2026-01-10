"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadStockEntries, addStockEntry, deleteStockEntry } from "@/store/slices/stockEntrySlice";
import { loadStockItems, updateStockItem } from "@/store/slices/stockItemSlice";
import { StockEntry } from "@/types";
import { formatDate, toISODateString } from "@/lib/utils";
import { Plus, Trash2, PackageOpen, Search, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

export default function StockEntriesPage() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((state) => state.stockEntries);
    const { items: stockItems } = useAppSelector((state) => state.stockItems);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<StockEntry | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        date: toISODateString(new Date()),
        stockItemId: "",
        stockItemName: "",
        entryType: "IN" as "IN" | "OUT",
        quantity: 0,
        remark: "",
    });

    useEffect(() => {
        dispatch(loadStockEntries());
        dispatch(loadStockItems());
    }, [dispatch]);

    const filteredItems = items.filter((i) =>
        i.stockItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.entryType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleStockItemChange = (stockItemId: string) => {
        const item = stockItems.find((i) => i.id === stockItemId);
        setFormData({ ...formData, stockItemId, stockItemName: item?.name || "" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Add the stock entry
        dispatch(addStockEntry(formData));

        // Update the stock item quantities
        const stockItem = stockItems.find((i) => i.id === formData.stockItemId);
        if (stockItem) {
            if (formData.entryType === "IN") {
                dispatch(updateStockItem({
                    id: stockItem.id,
                    updates: {
                        stkIn: stockItem.stkIn + formData.quantity,
                        closeQty: stockItem.closeQty + formData.quantity,
                    },
                }));
            } else {
                dispatch(updateStockItem({
                    id: stockItem.id,
                    updates: {
                        stkOut: stockItem.stkOut + formData.quantity,
                        closeQty: stockItem.closeQty - formData.quantity,
                    },
                }));
            }
        }

        setIsDialogOpen(false);
        setFormData({ date: toISODateString(new Date()), stockItemId: "", stockItemName: "", entryType: "IN", quantity: 0, remark: "" });
    };

    const handleDelete = () => {
        if (deletingItem) {
            // Reverse the stock update
            const stockItem = stockItems.find((i) => i.id === deletingItem.stockItemId);
            if (stockItem) {
                if (deletingItem.entryType === "IN") {
                    dispatch(updateStockItem({
                        id: stockItem.id,
                        updates: {
                            stkIn: stockItem.stkIn - deletingItem.quantity,
                            closeQty: stockItem.closeQty - deletingItem.quantity,
                        },
                    }));
                } else {
                    dispatch(updateStockItem({
                        id: stockItem.id,
                        updates: {
                            stkOut: stockItem.stkOut - deletingItem.quantity,
                            closeQty: stockItem.closeQty + deletingItem.quantity,
                        },
                    }));
                }
            }
            dispatch(deleteStockEntry(deletingItem.id));
            setIsDeleteDialogOpen(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Stock Entries" description="Track stock movements and inventory">
                <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} entr{filteredItems.length !== 1 ? "ies" : "y"}</Badge>
                </div>

                {/* Stock Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {stockItems.map((item) => (
                        <Card key={item.id}>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
                                        <p className="text-2xl font-bold">{item.closeQty}</p>
                                    </div>
                                    <div className="text-right text-xs">
                                        <p className="text-green-600">+{item.stkIn} IN</p>
                                        <p className="text-red-600">-{item.stkOut} OUT</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No entries found</h3>
                                <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Stock Item</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Quantity</TableHead>
                                        <TableHead>Remark</TableHead>
                                        <TableHead className="w-16">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.slice().reverse().map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{formatDate(item.date)}</TableCell>
                                            <TableCell className="font-medium">{item.stockItemName}</TableCell>
                                            <TableCell>
                                                {item.entryType === "IN" ? (
                                                    <Badge variant="success" className="gap-1">
                                                        <ArrowUpCircle className="h-3 w-3" /> IN
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <ArrowDownCircle className="h-3 w-3" /> OUT
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${item.entryType === "IN" ? "text-green-600" : "text-red-600"}`}>
                                                {item.entryType === "IN" ? "+" : "-"}{item.quantity}
                                            </TableCell>
                                            <TableCell className="max-w-48 truncate">{item.remark || "-"}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" onClick={() => { setDeletingItem(item); setIsDeleteDialogOpen(true); }}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Stock Entry</DialogTitle>
                        <DialogDescription>Record stock IN or OUT movement</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                                <div className="grid gap-2">
                                    <Label>Entry Type</Label>
                                    <Select value={formData.entryType} onValueChange={(v) => setFormData({ ...formData, entryType: v as "IN" | "OUT" })}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="IN">Stock IN (+)</SelectItem>
                                            <SelectItem value="OUT">Stock OUT (-)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Stock Item</Label>
                                    <Select value={formData.stockItemId} onValueChange={handleStockItemChange}>
                                        <SelectTrigger><SelectValue placeholder="Select item" /></SelectTrigger>
                                        <SelectContent>
                                            {stockItems.map((i) => (
                                                <SelectItem key={i.id} value={i.id}>{i.name} (Current: {i.closeQty})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Quantity</Label><Input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} required min="1" /></div>
                            </div>
                            <div className="grid gap-2"><Label>Remark</Label><Input value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} placeholder="Optional notes" /></div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Add Entry</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Entry</DialogTitle><DialogDescription>This will reverse the stock quantity. Are you sure?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
