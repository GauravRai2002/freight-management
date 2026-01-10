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
import { usePaymentModes } from "@/hooks";
import { PaymentMode } from "@/types";
import { Plus, Pencil, Trash2, CreditCard, Search } from "lucide-react";

export default function PaymentModesPage() {
    const { paymentModes: items, loading, fetchPaymentModes, createPaymentMode, editPaymentMode, removePaymentMode } = usePaymentModes();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PaymentMode | null>(null);
    const [deletingItem, setDeletingItem] = useState<PaymentMode | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [formData, setFormData] = useState({ name: "" });

    useEffect(() => { fetchPaymentModes(); }, [fetchPaymentModes]);

    const filteredItems = items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleOpenDialog = (item?: PaymentMode) => {
        if (item) { setEditingItem(item); setFormData({ name: item.name }); }
        else { setEditingItem(null); setFormData({ name: "" }); }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) await editPaymentMode(editingItem.id, formData);
            else await createPaymentMode(formData);
            setIsDialogOpen(false);
        } catch { }
    };

    const handleDelete = async () => {
        if (deletingItem) { try { await removePaymentMode(deletingItem.id); setIsDeleteDialogOpen(false); } catch { } }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Payment Modes" description="Manage payment methods">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Mode</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} mode{filteredItems.length !== 1 ? "s" : ""}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No payment modes found</h3>
                                <p className="text-muted-foreground text-sm mb-4">{searchQuery ? "Try a different search" : "Add your first payment mode"}</p>
                                {!searchQuery && <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Mode</Button>}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader><TableRow><TableHead className="w-12">#</TableHead><TableHead>Payment Mode</TableHead><TableHead className="w-24 text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
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
                    <DialogHeader><DialogTitle>{editingItem ? "Edit" : "Add"} Payment Mode</DialogTitle><DialogDescription>{editingItem ? "Update" : "Enter"} the payment mode name</DialogDescription></DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Mode Name</Label>
                                <Input id="name" placeholder="e.g., UPI" value={formData.name} onChange={(e) => setFormData({ name: e.target.value.toUpperCase() })} required />
                            </div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit">{editingItem ? "Update" : "Add"}</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Payment Mode</DialogTitle><DialogDescription>Are you sure you want to delete <strong>{deletingItem?.name}</strong>?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
