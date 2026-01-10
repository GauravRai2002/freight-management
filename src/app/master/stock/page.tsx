"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadStockItems, addStockItem, updateStockItem, deleteStockItem } from "@/store/slices/stockItemSlice";
import { StockItem } from "@/types";
import { Plus, Pencil, Trash2, Package, Search } from "lucide-react";

export default function StockItemsPage() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((state) => state.stockItems);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<StockItem | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({ name: "", openQty: 0 });

    useEffect(() => { dispatch(loadStockItems()); }, [dispatch]);

    const filteredItems = items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleOpenDialog = (item?: StockItem) => {
        if (item) { setEditingItem(item); setFormData({ name: item.name, openQty: item.openQty }); }
        else { setEditingItem(null); setFormData({ name: "", openQty: 0 }); }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) dispatch(updateStockItem({ id: editingItem.id, updates: formData }));
        else dispatch(addStockItem(formData));
        setIsDialogOpen(false);
    };

    const handleDelete = () => {
        if (deletingItem) { dispatch(deleteStockItem(deletingItem.id)); setIsDeleteDialogOpen(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Stock Items" description="Manage inventory items">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Item</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No stock items found</h3>
                                <p className="text-muted-foreground text-sm mb-4">{searchQuery ? "Try a different search" : "Add your first stock item"}</p>
                                {!searchQuery && <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Item</Button>}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader><TableRow><TableHead className="w-12">#</TableHead><TableHead>Item Name</TableHead><TableHead className="text-right">Opening Qty</TableHead><TableHead className="text-right">Stock In</TableHead><TableHead className="text-right">Stock Out</TableHead><TableHead className="text-right">Closing Qty</TableHead><TableHead className="w-24 text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className="text-right">{item.openQty}</TableCell>
                                            <TableCell className="text-right text-green-600">+{item.stkIn}</TableCell>
                                            <TableCell className="text-right text-red-600">-{item.stkOut}</TableCell>
                                            <TableCell className="text-right font-medium">{item.closeQty}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}><Pencil className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" onClick={() => { setDeletingItem(item); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                </div>
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
                    <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Stock Item</DialogTitle><DialogDescription>{editingItem ? "Update" : "Enter"} the stock item details</DialogDescription></DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label htmlFor="name">Item Name</Label><Input id="name" placeholder="e.g., Diesel" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
                            <div className="grid gap-2"><Label htmlFor="openQty">Opening Quantity</Label><Input id="openQty" type="number" value={formData.openQty} onChange={(e) => setFormData({ ...formData, openQty: Number(e.target.value) })} /></div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit">{editingItem ? "Update" : "Add"}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Stock Item</DialogTitle><DialogDescription>Are you sure you want to delete <strong>{deletingItem?.name}</strong>?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
