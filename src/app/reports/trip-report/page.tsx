"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadTrips } from "@/store/slices/tripSlice";
import { loadVehicles } from "@/store/slices/vehicleSlice";
import { loadDrivers } from "@/store/slices/driverSlice";
import { formatCurrency, formatDate, toISODateString } from "@/lib/utils";
import { BarChart3, Filter, Download, TrendingUp, TrendingDown, DollarSign, Map } from "lucide-react";

export default function TripReportPage() {
    const dispatch = useAppDispatch();
    const { items: trips, loading } = useAppSelector((state) => state.trips);
    const { items: vehicles } = useAppSelector((state) => state.vehicles);
    const { items: drivers } = useAppSelector((state) => state.drivers);

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        vehicleNo: "",
        driverName: "",
    });

    useEffect(() => {
        dispatch(loadTrips());
        dispatch(loadVehicles());
        dispatch(loadDrivers());
    }, [dispatch]);

    // Filter trips
    const filteredTrips = trips.filter((trip) => {
        if (filters.fromDate && new Date(trip.date) < new Date(filters.fromDate)) return false;
        if (filters.toDate && new Date(trip.date) > new Date(filters.toDate)) return false;
        if (filters.vehicleNo && filters.vehicleNo !== "all" && trip.vehNo !== filters.vehicleNo) return false;
        if (filters.driverName && filters.driverName !== "all" && trip.driverName !== filters.driverName) return false;
        return true;
    });

    // Calculate summary
    const summary = {
        totalTrips: filteredTrips.length,
        totalFare: filteredTrips.reduce((sum, t) => sum + t.totalTripFare, 0),
        totalExpense: filteredTrips.reduce((sum, t) => sum + t.tripExpense, 0),
        totalProfit: filteredTrips.reduce((sum, t) => sum + t.profitStatement, 0),
        totalKm: filteredTrips.reduce((sum, t) => sum + t.tripKm, 0),
        totalFuel: filteredTrips.reduce((sum, t) => sum + t.fuelExpAmt, 0),
    };

    const clearFilters = () => {
        setFilters({ fromDate: "", toDate: "", vehicleNo: "", driverName: "" });
    };

    const exportToCSV = () => {
        const headers = ["Trip #", "Date", "Vehicle", "Driver", "From", "To", "KM", "Fare", "Expense", "Profit"];
        const rows = filteredTrips.map((t) => [
            t.tripNo, formatDate(t.date), t.vehNo, t.driverName, t.from, t.to, t.tripKm, t.totalTripFare, t.tripExpense, t.profitStatement,
        ]);
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `trip-report-${toISODateString(new Date())}.csv`;
        a.click();
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Trip Report" description="View and analyze trip data">
                <Button variant="outline" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />Export CSV
                </Button>
            </PageHeader>

            <div className="p-6 space-y-6">
                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="grid gap-2">
                                <Label>From Date</Label>
                                <Input type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>To Date</Label>
                                <Input type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Vehicle</Label>
                                <Select value={filters.vehicleNo || "all"} onValueChange={(v) => setFilters({ ...filters, vehicleNo: v })}>
                                    <SelectTrigger><SelectValue placeholder="All vehicles" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Vehicles</SelectItem>
                                        {vehicles.map((v) => <SelectItem key={v.id} value={v.vehNo}>{v.vehNo}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Driver</Label>
                                <Select value={filters.driverName || "all"} onValueChange={(v) => setFilters({ ...filters, driverName: v })}>
                                    <SelectTrigger><SelectValue placeholder="All drivers" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Drivers</SelectItem>
                                        {drivers.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end">
                                <Button variant="outline" onClick={clearFilters} className="w-full">Clear</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <Map className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Total Trips</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{summary.totalTrips}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Total Fare</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalFare)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <TrendingDown className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-muted-foreground">Total Expense</span>
                            </div>
                            <p className="text-2xl font-bold mt-1 text-red-600">{formatCurrency(summary.totalExpense)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-muted-foreground">Net Profit</span>
                            </div>
                            <p className={`text-2xl font-bold mt-1 ${summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(summary.totalProfit)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Total KM</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{summary.totalKm.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Fuel Cost</span>
                            </div>
                            <p className="text-2xl font-bold mt-1">{formatCurrency(summary.totalFuel)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredTrips.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No trips match the filters</h3>
                                <p className="text-muted-foreground text-sm">Adjust the filters or add new trips</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Trip #</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Vehicle</TableHead>
                                            <TableHead>Driver</TableHead>
                                            <TableHead>Route</TableHead>
                                            <TableHead className="text-right">KM</TableHead>
                                            <TableHead className="text-right">Fare</TableHead>
                                            <TableHead className="text-right">Expense</TableHead>
                                            <TableHead className="text-right">Profit</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTrips.slice().reverse().map((trip) => (
                                            <TableRow key={trip.id}>
                                                <TableCell className="font-medium">{trip.tripNo}</TableCell>
                                                <TableCell>{formatDate(trip.date)}</TableCell>
                                                <TableCell>{trip.vehNo}</TableCell>
                                                <TableCell>{trip.driverName || "-"}</TableCell>
                                                <TableCell>{trip.from} → {trip.to}</TableCell>
                                                <TableCell className="text-right">{trip.tripKm}</TableCell>
                                                <TableCell className="text-right">{formatCurrency(trip.totalTripFare)}</TableCell>
                                                <TableCell className="text-right text-red-600">{formatCurrency(trip.tripExpense)}</TableCell>
                                                <TableCell className="text-right font-medium">
                                                    <span className={trip.profitStatement >= 0 ? "text-green-600" : "text-red-600"}>
                                                        {formatCurrency(trip.profitStatement)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {/* Summary Row */}
                                        <TableRow className="bg-muted/50 font-bold">
                                            <TableCell colSpan={5}>TOTAL</TableCell>
                                            <TableCell className="text-right">{summary.totalKm}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(summary.totalFare)}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(summary.totalExpense)}</TableCell>
                                            <TableCell className="text-right">
                                                <span className={summary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}>
                                                    {formatCurrency(summary.totalProfit)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
