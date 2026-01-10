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
import { useDriverAdvances, useDrivers, usePaymentModes } from "@/hooks";
import { DriverAdvance } from "@/types";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { Plus, Pencil, Trash2, Wallet, Search } from "lucide-react";

export default function DriverAdvancePage() {
    const { driverAdvances: items, loading, fetchDriverAdvances, createDriverAdvance, editDriverAdvance, removeDriverAdvance } = useDriverAdvances();
    const { drivers, fetchDrivers } = useDrivers();
    const { paymentModes, fetchPaymentModes } = usePaymentModes();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<DriverAdvance | null>(null);
    const [deletingItem, setDeletingItem] = useState<DriverAdvance | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const defaultFormData = {
        tripNo: 0, date: toISODateString(new Date()), driverName: "", mode: "", fromAccount: "",
        debit: 0, credit: 0, fuelLtr: 0, remark: "", runBal: 0,
    };
    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        fetchDriverAdvances();
        fetchDrivers();
        fetchPaymentModes();
    }, [fetchDriverAdvances, fetchDrivers, fetchPaymentModes]);

    const filteredItems = items.filter((i) =>
        i.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tripNo.toString().includes(searchQuery)
    );

    const handleOpenDialog = (item?: DriverAdvance) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                tripNo: item.tripNo, date: item.date.split("T")[0], driverName: item.driverName,
                mode: item.mode, fromAccount: item.fromAccount, debit: item.debit, credit: item.credit,
                fuelLtr: item.fuelLtr, remark: item.remark, runBal: item.runBal,
            });
        } else {
            setEditingItem(null);
            setFormData(defaultFormData);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) await editDriverAdvance(editingItem.id, formData);
            else await createDriverAdvance(formData);
            setIsDialogOpen(false);
        } catch { }
    };

    const handleDelete = async () => {
        if (deletingItem) { try { await removeDriverAdvance(deletingItem.id); setIsDeleteDialogOpen(false); } catch { } }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Driver Advance" description="Manage driver advance payments">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} entr{filteredItems.length !== 1 ? "ies" : "y"}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No entries found</h3>
                                <p className="text-muted-foreground text-sm mb-4">{searchQuery ? "Try a different search" : "Add your first driver advance entry"}</p>
                                {!searchQuery && <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Trip #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Driver</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead className="text-right">Fuel Ltr</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.slice().reverse().map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.tripNo || "-"}</TableCell>
                                            <TableCell>{formatDate(item.date)}</TableCell>
                                            <TableCell className="font-medium">{item.driverName}</TableCell>
                                            <TableCell><Badge variant="outline">{item.mode}</Badge></TableCell>
                                            <TableCell className="text-right text-red-600">{item.debit > 0 ? formatCurrency(item.debit) : "-"}</TableCell>
                                            <TableCell className="text-right text-green-600">{item.credit > 0 ? formatCurrency(item.credit) : "-"}</TableCell>
                                            <TableCell className="text-right">{item.fuelLtr || "-"}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.runBal)}</TableCell>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Entry" : "Add Driver Advance"}</DialogTitle>
                        <DialogDescription>Record driver advance payment or receipt</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2"><Label>Trip No</Label><Input type="number" value={formData.tripNo} onChange={(e) => setFormData({ ...formData, tripNo: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                                <div className="grid gap-2">
                                    <Label>Driver</Label>
                                    <Select value={formData.driverName} onValueChange={(v) => setFormData({ ...formData, driverName: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{drivers.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Payment Mode</Label>
                                    <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{paymentModes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>From Account</Label><Input value={formData.fromAccount} onChange={(e) => setFormData({ ...formData, fromAccount: e.target.value })} /></div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <div className="grid gap-2"><Label>Debit (Pay)</Label><Input type="number" value={formData.debit} onChange={(e) => setFormData({ ...formData, debit: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Credit (Rec)</Label><Input type="number" value={formData.credit} onChange={(e) => setFormData({ ...formData, credit: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Fuel Ltr</Label><Input type="number" step="0.01" value={formData.fuelLtr} onChange={(e) => setFormData({ ...formData, fuelLtr: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Running Bal</Label><Input type="number" value={formData.runBal} onChange={(e) => setFormData({ ...formData, runBal: Number(e.target.value) })} /></div>
                            </div>
                            <div className="grid gap-2"><Label>Remark</Label><Input value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} /></div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Entry</DialogTitle><DialogDescription>Are you sure?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
