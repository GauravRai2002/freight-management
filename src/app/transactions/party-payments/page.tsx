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
import { usePartyPayments, useBillingParties, usePaymentModes } from "@/hooks";
import { PartyPayment } from "@/types";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { Plus, Pencil, Trash2, DollarSign, Search } from "lucide-react";

export default function PartyPaymentsPage() {
    const { partyPayments: items, loading, fetchPartyPayments, createPartyPayment, editPartyPayment, removePartyPayment } = usePartyPayments();
    const { billingParties: parties, fetchBillingParties } = useBillingParties();
    const { paymentModes, fetchPaymentModes } = usePaymentModes();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PartyPayment | null>(null);
    const [deletingItem, setDeletingItem] = useState<PartyPayment | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const defaultFormData = {
        tripNo: 0, date: toISODateString(new Date()), billingPartyId: "", billingPartyName: "",
        mode: "", receiveAmt: 0, shortageAmt: 0, deductionAmt: 0, lrNo: "",
        toBank: "", remark: "", runBal: 0,
    };
    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        fetchPartyPayments();
        fetchBillingParties();
        fetchPaymentModes();
    }, [fetchPartyPayments, fetchBillingParties, fetchPaymentModes]);

    const filteredItems = items.filter((i) =>
        i.billingPartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tripNo.toString().includes(searchQuery) ||
        i.lrNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePartyChange = (partyId: string) => {
        const party = parties.find((p) => p.id === partyId);
        setFormData({ ...formData, billingPartyId: partyId, billingPartyName: party?.name || "" });
    };

    const handleOpenDialog = (item?: PartyPayment) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                tripNo: item.tripNo, date: item.date.split("T")[0], billingPartyId: item.billingPartyId,
                billingPartyName: item.billingPartyName, mode: item.mode, receiveAmt: item.receiveAmt,
                shortageAmt: item.shortageAmt, deductionAmt: item.deductionAmt, lrNo: item.lrNo,
                toBank: item.toBank, remark: item.remark, runBal: item.runBal,
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
            if (editingItem) await editPartyPayment(editingItem.id, formData);
            else await createPartyPayment(formData);
            setIsDialogOpen(false);
            setEditingItem(null);
        } catch { }
    };

    const handleDelete = async () => {
        if (deletingItem) { try { await removePartyPayment(deletingItem.id); setIsDeleteDialogOpen(false); } catch { } }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    const totalReceived = filteredItems.reduce((sum, i) => sum + i.receiveAmt, 0);

    return (
        <div className="flex flex-col">
            <PageHeader title="Party Payments" description="Track payments received from billing parties">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Payment</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} payment{filteredItems.length !== 1 ? "s" : ""}</Badge>
                    <Badge variant="outline" className="text-green-600">Total: {formatCurrency(totalReceived)}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Payment</Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Trip #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Billing Party</TableHead>
                                        <TableHead>LR No</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead className="text-right">Received</TableHead>
                                        <TableHead className="text-right">Shortage</TableHead>
                                        <TableHead className="text-right">Deduction</TableHead>
                                        <TableHead>Bank</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.slice().reverse().map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.tripNo || "-"}</TableCell>
                                            <TableCell>{formatDate(item.date)}</TableCell>
                                            <TableCell className="font-medium">{item.billingPartyName}</TableCell>
                                            <TableCell>{item.lrNo || "-"}</TableCell>
                                            <TableCell><Badge variant="outline">{item.mode}</Badge></TableCell>
                                            <TableCell className="text-right text-green-600 font-medium">{formatCurrency(item.receiveAmt)}</TableCell>
                                            <TableCell className="text-right text-orange-600">{item.shortageAmt > 0 ? formatCurrency(item.shortageAmt) : "-"}</TableCell>
                                            <TableCell className="text-right text-red-600">{item.deductionAmt > 0 ? formatCurrency(item.deductionAmt) : "-"}</TableCell>
                                            <TableCell>{item.toBank || "-"}</TableCell>
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
                        <DialogTitle>{editingItem ? "Edit Payment" : "Add Party Payment"}</DialogTitle>
                        <DialogDescription>Record payment received from billing party</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2"><Label>Trip No</Label><Input type="number" value={formData.tripNo} onChange={(e) => setFormData({ ...formData, tripNo: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                                <div className="grid gap-2"><Label>LR Number</Label><Input value={formData.lrNo} onChange={(e) => setFormData({ ...formData, lrNo: e.target.value.toUpperCase() })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Billing Party</Label>
                                    <Select value={formData.billingPartyId} onValueChange={handlePartyChange}>
                                        <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                                        <SelectContent>{parties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Payment Mode</Label>
                                    <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                                        <SelectContent>{paymentModes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2"><Label>Received Amount</Label><Input type="number" value={formData.receiveAmt} onChange={(e) => setFormData({ ...formData, receiveAmt: Number(e.target.value) })} required /></div>
                                <div className="grid gap-2"><Label>Shortage</Label><Input type="number" value={formData.shortageAmt} onChange={(e) => setFormData({ ...formData, shortageAmt: Number(e.target.value) })} /></div>
                                <div className="grid gap-2"><Label>Deduction</Label><Input type="number" value={formData.deductionAmt} onChange={(e) => setFormData({ ...formData, deductionAmt: Number(e.target.value) })} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>To Bank</Label><Input value={formData.toBank} onChange={(e) => setFormData({ ...formData, toBank: e.target.value })} placeholder="Bank account name" /></div>
                                <div className="grid gap-2"><Label>Remark</Label><Input value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} /></div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingItem ? "Update" : "Add"} Payment</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Payment</DialogTitle><DialogDescription>Are you sure?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
