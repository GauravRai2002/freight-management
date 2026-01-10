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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadTripBooks, addTripBook, updateTripBook, deleteTripBook } from "@/store/slices/tripBookSlice";
import { loadTrips } from "@/store/slices/tripSlice";
import { loadBillingParties } from "@/store/slices/billingPartySlice";
import { loadTransporters } from "@/store/slices/transporterSlice";
import { TripBook } from "@/types";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { Plus, Pencil, Trash2, BookOpen, Search } from "lucide-react";

const FREIGHT_MODES = ["FIX", "PE Ton", "PE KG"] as const;

export default function TripBookPage() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((state) => state.tripBooks);
    const { items: trips } = useAppSelector((state) => state.trips);
    const { items: parties } = useAppSelector((state) => state.billingParties);
    const { items: transporters } = useAppSelector((state) => state.transporters);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TripBook | null>(null);
    const [deletingItem, setDeletingItem] = useState<TripBook | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const defaultFormData = {
        tripNo: 0, date: toISODateString(new Date()), lrNo: "", billingPartyId: "", billingPartyName: "",
        freightMode: "FIX" as "FIX" | "PE Ton" | "PE KG", tripAmount: 0, advanceAmt: 0, shortageAmt: 0,
        deductionAmt: 0, holdingAmt: 0, receivedAmt: 0, pendingAmt: 0,
        transporterId: "", transporterName: "", marketVehNo: "", marketFreight: 0, marketAdvance: 0,
        marketBalance: 0, lWeight: 0, uWeight: 0, remark: "", netProfit: 0,
    };
    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        dispatch(loadTripBooks());
        dispatch(loadTrips());
        dispatch(loadBillingParties());
        dispatch(loadTransporters());
    }, [dispatch]);

    const filteredItems = items.filter((i) =>
        i.tripNo.toString().includes(searchQuery) ||
        i.billingPartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.lrNo?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-calculate fields
    useEffect(() => {
        const receivedAmt = formData.tripAmount - formData.shortageAmt - formData.deductionAmt - formData.holdingAmt;
        const pendingAmt = receivedAmt - formData.advanceAmt;
        const marketBalance = formData.marketFreight - formData.marketAdvance;
        const netProfit = receivedAmt - formData.marketFreight;

        setFormData((prev) => ({ ...prev, receivedAmt, pendingAmt, marketBalance, netProfit }));
    }, [formData.tripAmount, formData.shortageAmt, formData.deductionAmt, formData.holdingAmt, formData.advanceAmt, formData.marketFreight, formData.marketAdvance]);

    const handleOpenDialog = (item?: TripBook) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                tripNo: item.tripNo, date: item.date.split("T")[0], lrNo: item.lrNo,
                billingPartyId: item.billingPartyId, billingPartyName: item.billingPartyName,
                freightMode: item.freightMode, tripAmount: item.tripAmount, advanceAmt: item.advanceAmt,
                shortageAmt: item.shortageAmt, deductionAmt: item.deductionAmt, holdingAmt: item.holdingAmt,
                receivedAmt: item.receivedAmt, pendingAmt: item.pendingAmt, transporterId: item.transporterId,
                transporterName: item.transporterName, marketVehNo: item.marketVehNo, marketFreight: item.marketFreight,
                marketAdvance: item.marketAdvance, marketBalance: item.marketBalance, lWeight: item.lWeight,
                uWeight: item.uWeight, remark: item.remark, netProfit: item.netProfit,
            });
        } else {
            setEditingItem(null);
            setFormData(defaultFormData);
        }
        setIsDialogOpen(true);
    };

    const handlePartyChange = (partyId: string) => {
        const party = parties.find((p) => p.id === partyId);
        setFormData({ ...formData, billingPartyId: partyId, billingPartyName: party?.name || "" });
    };

    const handleTransporterChange = (transporterId: string) => {
        const transporter = transporters.find((t) => t.id === transporterId);
        setFormData({ ...formData, transporterId, transporterName: transporter?.name || "", marketVehNo: transporter?.vehNo || "" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) dispatch(updateTripBook({ id: editingItem.id, updates: formData }));
        else dispatch(addTripBook(formData));
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDelete = () => {
        if (deletingItem) { dispatch(deleteTripBook(deletingItem.id)); setIsDeleteDialogOpen(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Trip Book" description="Detailed trip booking with billing information">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />New Booking</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by trip #, party, LR..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} booking{filteredItems.length !== 1 ? "s" : ""}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />New Booking</Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Trip #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>LR No</TableHead>
                                            <TableHead>Billing Party</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Received</TableHead>
                                            <TableHead className="text-right">Pending</TableHead>
                                            <TableHead>Market Vehicle</TableHead>
                                            <TableHead className="text-right">Net Profit</TableHead>
                                            <TableHead className="w-24 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.slice().reverse().map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.tripNo}</TableCell>
                                                <TableCell>{formatDate(item.date)}</TableCell>
                                                <TableCell>{item.lrNo || "-"}</TableCell>
                                                <TableCell>{item.billingPartyName}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(item.tripAmount)}</TableCell>
                                                <TableCell className="text-right text-green-600">{formatCurrency(item.receivedAmt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <span className={item.pendingAmt > 0 ? "text-orange-600" : ""}>{formatCurrency(item.pendingAmt)}</span>
                                                </TableCell>
                                                <TableCell>{item.marketVehNo || "-"}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    <span className={item.netProfit >= 0 ? "text-green-600" : "text-red-600"}>{formatCurrency(item.netProfit)}</span>
                                                </TableCell>
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
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? `Edit Booking #${editingItem.tripNo}` : "New Trip Booking"}</DialogTitle>
                        <DialogDescription>Enter billing and transporter details</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <form onSubmit={handleSubmit} id="tripbook-form">
                            <div className="grid gap-4 py-4">
                                {/* Basic Info */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="grid gap-2"><Label>Trip No</Label><Input type="number" value={formData.tripNo} onChange={(e) => setFormData({ ...formData, tripNo: Number(e.target.value) })} required /></div>
                                    <div className="grid gap-2"><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required /></div>
                                    <div className="grid gap-2"><Label>LR Number</Label><Input value={formData.lrNo} onChange={(e) => setFormData({ ...formData, lrNo: e.target.value.toUpperCase() })} /></div>
                                    <div className="grid gap-2">
                                        <Label>Freight Mode</Label>
                                        <Select value={formData.freightMode} onValueChange={(v) => setFormData({ ...formData, freightMode: v as typeof formData.freightMode })}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>{FREIGHT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Billing Party Section */}
                                <div className="border-t pt-4 mt-2">
                                    <h4 className="text-sm font-medium mb-3">Billing Party Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Billing Party</Label>
                                            <Select value={formData.billingPartyId} onValueChange={handlePartyChange}>
                                                <SelectTrigger><SelectValue placeholder="Select party" /></SelectTrigger>
                                                <SelectContent>{parties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2"><Label>Trip Amount</Label><Input type="number" value={formData.tripAmount} onChange={(e) => setFormData({ ...formData, tripAmount: Number(e.target.value) })} /></div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-4 mt-4">
                                        <div className="grid gap-2"><Label>Advance</Label><Input type="number" value={formData.advanceAmt} onChange={(e) => setFormData({ ...formData, advanceAmt: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Shortage</Label><Input type="number" value={formData.shortageAmt} onChange={(e) => setFormData({ ...formData, shortageAmt: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Deduction</Label><Input type="number" value={formData.deductionAmt} onChange={(e) => setFormData({ ...formData, deductionAmt: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Holding</Label><Input type="number" value={formData.holdingAmt} onChange={(e) => setFormData({ ...formData, holdingAmt: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Received</Label><Input type="number" value={formData.receivedAmt} readOnly className="bg-muted text-green-600 font-medium" /></div>
                                    </div>
                                </div>

                                {/* Market Vehicle Section */}
                                <div className="border-t pt-4 mt-2">
                                    <h4 className="text-sm font-medium mb-3">Market Vehicle (if applicable)</h4>
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
                                    <div className="grid grid-cols-3 gap-4 mt-4">
                                        <div className="grid gap-2"><Label>Market Freight</Label><Input type="number" value={formData.marketFreight} onChange={(e) => setFormData({ ...formData, marketFreight: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Market Advance</Label><Input type="number" value={formData.marketAdvance} onChange={(e) => setFormData({ ...formData, marketAdvance: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Market Balance</Label><Input type="number" value={formData.marketBalance} readOnly className="bg-muted" /></div>
                                    </div>
                                </div>

                                {/* Weight & Summary */}
                                <div className="border-t pt-4 mt-2">
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="grid gap-2"><Label>Loading Weight</Label><Input type="number" step="0.01" value={formData.lWeight} onChange={(e) => setFormData({ ...formData, lWeight: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Unloading Weight</Label><Input type="number" step="0.01" value={formData.uWeight} onChange={(e) => setFormData({ ...formData, uWeight: Number(e.target.value) })} /></div>
                                        <div className="grid gap-2"><Label>Pending Amount</Label><Input type="number" value={formData.pendingAmt} readOnly className="bg-muted text-orange-600 font-medium" /></div>
                                        <div className="grid gap-2"><Label>Net Profit</Label><Input type="number" value={formData.netProfit} readOnly className={`bg-muted font-bold ${formData.netProfit >= 0 ? "text-green-600" : "text-red-600"}`} /></div>
                                    </div>
                                </div>

                                <div className="grid gap-2"><Label>Remark</Label><Input value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} /></div>
                            </div>
                        </form>
                    </ScrollArea>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" form="tripbook-form">{editingItem ? "Update" : "Create"} Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Delete Booking</DialogTitle><DialogDescription>Are you sure you want to delete this booking?</DialogDescription></DialogHeader>
                    <DialogFooter><Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button><Button variant="destructive" onClick={handleDelete}>Delete</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
