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
import { loadMarketVehPayments, addMarketVehPayment, updateMarketVehPayment, deleteMarketVehPayment } from "@/store/slices/marketVehPaymentSlice";
import { loadTransporters } from "@/store/slices/transporterSlice";
import { loadPaymentModes } from "@/store/slices/paymentModeSlice";
import { MarketVehPayment } from "@/types";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { Plus, Pencil, Trash2, Truck, Search } from "lucide-react";

export default function MarketVehPaymentsPage() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((state) => state.marketVehPayments);
    const { items: transporters } = useAppSelector((state) => state.transporters);
    const { items: paymentModes } = useAppSelector((state) => state.paymentModes);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MarketVehPayment | null>(null);
    const [deletingItem, setDeletingItem] = useState<MarketVehPayment | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const defaultFormData = {
        tripNo: 0, date: toISODateString(new Date()), transporterId: "", transporterName: "",
        marketVehNo: "", mode: "", paidAmt: 0, lrNo: "", fromBank: "", remark: "", runBal: 0,
    };
    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        dispatch(loadMarketVehPayments());
        dispatch(loadTransporters());
        dispatch(loadPaymentModes());
    }, [dispatch]);

    const filteredItems = items.filter((i) =>
        i.transporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.marketVehNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.tripNo.toString().includes(searchQuery)
    );

    const handleTransporterChange = (transporterId: string) => {
        const transporter = transporters.find((t) => t.id === transporterId);
        setFormData({ ...formData, transporterId, transporterName: transporter?.name || "", marketVehNo: transporter?.vehNo || "" });
    };

    const handleOpenDialog = (item?: MarketVehPayment) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                tripNo: item.tripNo, date: item.date.split("T")[0], transporterId: item.transporterId,
                transporterName: item.transporterName, marketVehNo: item.marketVehNo, mode: item.mode,
                paidAmt: item.paidAmt, lrNo: item.lrNo, fromBank: item.fromBank, remark: item.remark, runBal: item.runBal,
            });
        } else {
            setEditingItem(null);
            setFormData(defaultFormData);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) dispatch(updateMarketVehPayment({ id: editingItem.id, updates: formData }));
        else dispatch(addMarketVehPayment(formData));
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDelete = () => {
        if (deletingItem) { dispatch(deleteMarketVehPayment(deletingItem.id)); setIsDeleteDialogOpen(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    const totalPaid = filteredItems.reduce((sum, i) => sum + i.paidAmt, 0);

    return (
        <div className="flex flex-col">
            <PageHeader title="Market Vehicle Payments" description="Track payments to transporters/market vehicles">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Payment</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} payment{filteredItems.length !== 1 ? "s" : ""}</Badge>
                    <Badge variant="outline" className="text-red-600">Total Paid: {formatCurrency(totalPaid)}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Payment</Button>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Trip #</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Transporter</TableHead>
                                        <TableHead>Vehicle No</TableHead>
                                        <TableHead>LR No</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead className="text-right">Paid Amount</TableHead>
                                        <TableHead>From Bank</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.slice().reverse().map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.tripNo || "-"}</TableCell>
                                            <TableCell>{formatDate(item.date)}</TableCell>
                                            <TableCell className="font-medium">{item.transporterName}</TableCell>
                                            <TableCell>{item.marketVehNo}</TableCell>
                                            <TableCell>{item.lrNo || "-"}</TableCell>
                                            <TableCell><Badge variant="outline">{item.mode}</Badge></TableCell>
                                            <TableCell className="text-right text-red-600 font-medium">{formatCurrency(item.paidAmt)}</TableCell>
                                            <TableCell>{item.fromBank || "-"}</TableCell>
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
                        <DialogTitle>{editingItem ? "Edit Payment" : "Add Market Vehicle Payment"}</DialogTitle>
                        <DialogDescription>Record payment made to transporter</DialogDescription>
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
                                    <Label>Transporter</Label>
                                    <Select value={formData.transporterId} onValueChange={handleTransporterChange}>
                                        <SelectTrigger><SelectValue placeholder="Select transporter" /></SelectTrigger>
                                        <SelectContent>{transporters.map((t) => <SelectItem key={t.id} value={t.id}>{t.name} - {t.vehNo}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Vehicle No</Label><Input value={formData.marketVehNo} readOnly className="bg-muted" /></div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Payment Mode</Label>
                                    <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v })}>
                                        <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                                        <SelectContent>{paymentModes.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2"><Label>Paid Amount</Label><Input type="number" value={formData.paidAmt} onChange={(e) => setFormData({ ...formData, paidAmt: Number(e.target.value) })} required /></div>
                                <div className="grid gap-2"><Label>From Bank</Label><Input value={formData.fromBank} onChange={(e) => setFormData({ ...formData, fromBank: e.target.value })} placeholder="Bank account" /></div>
                            </div>
                            <div className="grid gap-2"><Label>Remark</Label><Input value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} /></div>
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
