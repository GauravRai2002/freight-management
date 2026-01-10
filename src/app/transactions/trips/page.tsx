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
import { useTrips, useVehicles, useDrivers } from "@/hooks";
import { Trip } from "@/types";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { Plus, Pencil, Trash2, Map, Search, Lock, Unlock } from "lucide-react";

export default function TripsPage() {
    const { trips, loading, fetchTrips, createTrip, editTrip, removeTrip } = useTrips();
    const { vehicles, fetchVehicles } = useVehicles();
    const { drivers, fetchDrivers } = useDrivers();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Trip | null>(null);
    const [deletingItem, setDeletingItem] = useState<Trip | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const defaultFormData = {
        date: toISODateString(new Date()),
        vehNo: "",
        driverName: "",
        from: "",
        to: "",
        tripKm: 0,
        fuelExpAmt: 0,
        average: 0,
        tripFare: 0,
        rtFare: 0,
        totalTripFare: 0,
        tripExpense: 0,
        profitStatement: 0,
        stMiter: 0,
        endMiter: 0,
        dieselRate: 0,
        ltr: 0,
        isMarketTrip: false,
        exIncome: 0,
        driverBal: 0,
        lockStatus: false,
    };

    const [formData, setFormData] = useState(defaultFormData);

    useEffect(() => {
        fetchTrips();
        fetchVehicles();
        fetchDrivers();
    }, [fetchTrips, fetchVehicles, fetchDrivers]);

    const filteredItems = trips.filter(
        (t) =>
            t.tripNo.toString().includes(searchQuery) ||
            t.vehNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.to.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (item?: Trip) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                date: item.date.split("T")[0],
                vehNo: item.vehNo,
                driverName: item.driverName,
                from: item.from,
                to: item.to,
                tripKm: item.tripKm,
                fuelExpAmt: item.fuelExpAmt,
                average: item.average,
                tripFare: item.tripFare,
                rtFare: item.rtFare,
                totalTripFare: item.totalTripFare,
                tripExpense: item.tripExpense,
                profitStatement: item.profitStatement,
                stMiter: item.stMiter,
                endMiter: item.endMiter,
                dieselRate: item.dieselRate,
                ltr: item.ltr,
                isMarketTrip: item.isMarketTrip,
                exIncome: item.exIncome,
                driverBal: item.driverBal,
                lockStatus: item.lockStatus,
            });
        } else {
            setEditingItem(null);
            setFormData(defaultFormData);
        }
        setIsDialogOpen(true);
    };

    // Auto-calculate fields
    useEffect(() => {
        const totalTripFare = formData.tripFare + formData.rtFare;
        const profitStatement = totalTripFare - formData.tripExpense;
        const tripKm = formData.endMiter - formData.stMiter;
        const average = formData.ltr > 0 ? tripKm / formData.ltr : 0;

        setFormData((prev) => ({
            ...prev,
            totalTripFare,
            profitStatement,
            tripKm: tripKm > 0 ? tripKm : prev.tripKm,
            average: average > 0 ? Math.round(average * 100) / 100 : prev.average,
        }));
    }, [formData.tripFare, formData.rtFare, formData.tripExpense, formData.stMiter, formData.endMiter, formData.ltr]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await editTrip(editingItem.id, formData);
            } else {
                await createTrip(formData);
            }
            setIsDialogOpen(false);
            setEditingItem(null);
        } catch { }
    };

    const handleDelete = async () => {
        if (deletingItem) {
            try {
                await removeTrip(deletingItem.id);
                setIsDeleteDialogOpen(false);
                setDeletingItem(null);
            } catch { }
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Trips" description="Manage trip records">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />New Trip</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search trips..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} trip{filteredItems.length !== 1 ? "s" : ""}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Map className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No trips found</h3>
                                <p className="text-muted-foreground text-sm mb-4">{searchQuery ? "Try a different search" : "Start by adding your first trip"}</p>
                                {!searchQuery && <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />New Trip</Button>}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Trip #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Vehicle</TableHead>
                                            <TableHead>Driver</TableHead>
                                            <TableHead>From → To</TableHead>
                                            <TableHead className="text-right">Trip Fare</TableHead>
                                            <TableHead className="text-right">Expense</TableHead>
                                            <TableHead className="text-right">Profit</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="w-24 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.slice().reverse().map((trip) => (
                                            <TableRow key={trip.id}>
                                                <TableCell className="font-medium">{trip.tripNo}</TableCell>
                                                <TableCell>{formatDate(trip.date)}</TableCell>
                                                <TableCell>{trip.vehNo}</TableCell>
                                                <TableCell>{trip.driverName || "-"}</TableCell>
                                                <TableCell>{trip.from} → {trip.to}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(trip.totalTripFare)}</TableCell>
                                                <TableCell className="text-right text-red-600">{formatCurrency(trip.tripExpense)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    <span className={trip.profitStatement >= 0 ? "text-green-600" : "text-red-600"}>
                                                        {formatCurrency(trip.profitStatement)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {trip.lockStatus ? (
                                                        <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Locked</Badge>
                                                    ) : (
                                                        <Badge variant="outline"><Unlock className="h-3 w-3 mr-1" />Open</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(trip)} disabled={trip.lockStatus}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => { setDeletingItem(trip); setIsDeleteDialogOpen(true); }} disabled={trip.lockStatus}>
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
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
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>{editingItem ? `Edit Trip #${editingItem.tripNo}` : "New Trip"}</DialogTitle>
                        <DialogDescription>{editingItem ? "Update trip details" : "Enter the trip details"}</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh] pr-4">
                        <form onSubmit={handleSubmit} id="trip-form">
                            <div className="grid gap-4 py-4">
                                {/* Row 1: Date, Vehicle, Driver */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="date">Date</Label>
                                        <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Vehicle</Label>
                                        <Select value={formData.vehNo} onValueChange={(v) => setFormData({ ...formData, vehNo: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger>
                                            <SelectContent>
                                                {vehicles.map((v) => <SelectItem key={v.id} value={v.vehNo}>{v.vehNo}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Driver</Label>
                                        <Select value={formData.driverName} onValueChange={(v) => setFormData({ ...formData, driverName: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                                            <SelectContent>
                                                {drivers.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Row 2: From, To */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="from">From</Label>
                                        <Input id="from" placeholder="Origin city" value={formData.from} onChange={(e) => setFormData({ ...formData, from: e.target.value.toUpperCase() })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="to">To</Label>
                                        <Input id="to" placeholder="Destination city" value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value.toUpperCase() })} required />
                                    </div>
                                </div>

                                {/* Row 3: Odometer */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="stMiter">Start Meter</Label>
                                        <Input id="stMiter" type="number" value={formData.stMiter} onChange={(e) => setFormData({ ...formData, stMiter: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="endMiter">End Meter</Label>
                                        <Input id="endMiter" type="number" value={formData.endMiter} onChange={(e) => setFormData({ ...formData, endMiter: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="tripKm">Trip KM</Label>
                                        <Input id="tripKm" type="number" value={formData.tripKm} readOnly className="bg-muted" />
                                    </div>
                                </div>

                                {/* Row 4: Fuel */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="dieselRate">Diesel Rate</Label>
                                        <Input id="dieselRate" type="number" step="0.01" value={formData.dieselRate} onChange={(e) => setFormData({ ...formData, dieselRate: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="ltr">Liters</Label>
                                        <Input id="ltr" type="number" step="0.01" value={formData.ltr} onChange={(e) => setFormData({ ...formData, ltr: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="fuelExpAmt">Fuel Expense</Label>
                                        <Input id="fuelExpAmt" type="number" value={formData.fuelExpAmt} onChange={(e) => setFormData({ ...formData, fuelExpAmt: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="average">Average</Label>
                                        <Input id="average" type="number" step="0.01" value={formData.average} readOnly className="bg-muted" />
                                    </div>
                                </div>

                                {/* Row 5: Fare */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tripFare">Trip Fare</Label>
                                        <Input id="tripFare" type="number" value={formData.tripFare} onChange={(e) => setFormData({ ...formData, tripFare: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="rtFare">Return Trip Fare</Label>
                                        <Input id="rtFare" type="number" value={formData.rtFare} onChange={(e) => setFormData({ ...formData, rtFare: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="totalTripFare">Total Fare</Label>
                                        <Input id="totalTripFare" type="number" value={formData.totalTripFare} readOnly className="bg-muted font-medium" />
                                    </div>
                                </div>

                                {/* Row 6: Expense & Profit */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="tripExpense">Trip Expense</Label>
                                        <Input id="tripExpense" type="number" value={formData.tripExpense} onChange={(e) => setFormData({ ...formData, tripExpense: Number(e.target.value) })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="profitStatement">Profit</Label>
                                        <Input id="profitStatement" type="number" value={formData.profitStatement} readOnly className={`bg-muted font-medium ${formData.profitStatement >= 0 ? "text-green-600" : "text-red-600"}`} />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </ScrollArea>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" form="trip-form">{editingItem ? "Update" : "Create"} Trip</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Trip</DialogTitle>
                        <DialogDescription>Are you sure you want to delete Trip <strong>#{deletingItem?.tripNo}</strong>?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
