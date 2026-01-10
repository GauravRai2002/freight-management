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
import { useExpenses, useExpenseCategories, usePaymentModes, useVehicles } from "@/hooks";
import { Expense } from "@/types";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { Plus, Trash2, FileText, Search } from "lucide-react";

export default function ExpenseBookPage() {
    const { expenses: items, loading, fetchExpenses, createExpense, removeExpense } = useExpenses();
    const { expenseCategories: categories, fetchExpenseCategories } = useExpenseCategories();
    const { paymentModes, fetchPaymentModes } = usePaymentModes();
    const { vehicles, fetchVehicles } = useVehicles();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState<Expense | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        tripNo: 0, date: toISODateString(new Date()), expenseType: "", amount: 0,
        fromAccount: "", refVehNo: "", remark1: "", remark2: "", isNonTripExp: false,
    });

    useEffect(() => {
        fetchExpenses();
        fetchExpenseCategories();
        fetchPaymentModes();
        fetchVehicles();
    }, [fetchExpenses, fetchExpenseCategories, fetchPaymentModes, fetchVehicles]);

    const filteredItems = items.filter((i) =>
        i.expenseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tripNo.toString().includes(searchQuery)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createExpense(formData);
            setIsDialogOpen(false);
            setFormData({ tripNo: 0, date: toISODateString(new Date()), expenseType: "", amount: 0, fromAccount: "", refVehNo: "", remark1: "", remark2: "", isNonTripExp: false });
        } catch { }
    };

    const handleDelete = async () => {
        if (deletingItem) { try { await removeExpense(deletingItem.id); setIsDeleteDialogOpen(false); } catch { } }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    const totalExpenses = filteredItems.reduce((sum, e) => sum + e.amount, 0);

    return (
        <div className="flex flex-col">
            <PageHeader title="Expense Book" description="Track all expenses">
                <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} expense{filteredItems.length !== 1 ? "s" : ""}</Badge>
                    <Badge variant="outline">Total: {formatCurrency(totalExpenses)}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No expenses found</h3>
                                <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Add Expense</Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Trip #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Expense Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead>Remark</TableHead>
                                        <TableHead className="w-16">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.slice().reverse().map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.tripNo || <Badge variant="secondary">Non-Trip</Badge>}</TableCell>
                                            <TableCell>{formatDate(item.date)}</TableCell>
                                            <TableCell className="font-medium">{item.expenseType}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(item.amount)}</TableCell>
                                            <TableCell>{item.fromAccount}</TableCell>
                                            <TableCell>{item.refVehNo || "-"}</TableCell>
                                            <TableCell className="max-w-32 truncate">{item.remark1}</TableCell>
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
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Add Expense</DialogTitle><DialogDescription>Record a new expense entry</DialogDescription></DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2"><Label>Trip No (0 for non-trip)</Label><Input type="number" value={formData.tripNo} onChange={(e) => setFormData({ ...formData, tripNo: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                                <div className="grid gap-2">
                                    <Label>Expense Type</Label>
                                    <Select value={formData.expenseType} onValueChange={(v) => setFormData({ ...formData, expenseType: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2"><Label>Amount</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })} required /></div>
                                <div className="grid gap-2">
                                    <Label>From Account</Label>
                                    <Select value={formData.fromAccount} onValueChange={(v) => setFormData({ ...formData, fromAccount: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{paymentModes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Ref Vehicle</Label>
                                    <Select value={formData.refVehNo} onValueChange={(v) => setFormData({ ...formData, refVehNo: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={v.vehNo}>{v.vehNo}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2"><Label>Remark</Label><Input value={formData.remark1} onChange={(e) => setFormData({ ...formData, remark1: e.target.value })} /></div>
                        </div>
                        <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button><Button type="submit">Add Expense</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Expense</DialogTitle><DialogDescription>Are you sure?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
