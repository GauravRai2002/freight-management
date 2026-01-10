"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadBillingParties } from "@/store/slices/billingPartySlice";
import { loadDrivers } from "@/store/slices/driverSlice";
import { loadTransporters } from "@/store/slices/transporterSlice";
import { loadTrips } from "@/store/slices/tripSlice";
import { loadTripBooks } from "@/store/slices/tripBookSlice";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Building2, Users, Truck, TrendingUp, TrendingDown, DollarSign, IndianRupee } from "lucide-react";

export default function BalanceSheetPage() {
    const dispatch = useAppDispatch();
    const { items: parties, loading: partiesLoading } = useAppSelector((state) => state.billingParties);
    const { items: drivers, loading: driversLoading } = useAppSelector((state) => state.drivers);
    const { items: transporters, loading: transportersLoading } = useAppSelector((state) => state.transporters);
    const { items: trips } = useAppSelector((state) => state.trips);
    const { items: tripBooks } = useAppSelector((state) => state.tripBooks);

    useEffect(() => {
        dispatch(loadBillingParties());
        dispatch(loadDrivers());
        dispatch(loadTransporters());
        dispatch(loadTrips());
        dispatch(loadTripBooks());
    }, [dispatch]);

    // Calculate summaries
    const partySummary = {
        totalBillAmount: parties.reduce((sum, p) => sum + p.billAmtTrip + p.billAmtRT, 0),
        totalReceived: parties.reduce((sum, p) => sum + p.receiveAmt, 0),
        totalBalance: parties.reduce((sum, p) => sum + p.balanceAmt, 0),
    };

    const driverSummary = {
        totalDebit: drivers.reduce((sum, d) => sum + d.debit, 0),
        totalCredit: drivers.reduce((sum, d) => sum + d.credit, 0),
        totalBalance: drivers.reduce((sum, d) => sum + d.closeBal, 0),
    };

    const transporterSummary = {
        totalBillAmount: transporters.reduce((sum, t) => sum + t.billAmt, 0),
        totalPaid: transporters.reduce((sum, t) => sum + t.paidAmt, 0),
        totalBalance: transporters.reduce((sum, t) => sum + t.closeBal, 0),
    };

    const tripSummary = {
        totalTrips: trips.length,
        totalRevenue: trips.reduce((sum, t) => sum + t.totalTripFare, 0),
        totalExpense: trips.reduce((sum, t) => sum + t.tripExpense, 0),
        totalProfit: trips.reduce((sum, t) => sum + t.profitStatement, 0),
    };

    const loading = partiesLoading || driversLoading || transportersLoading;

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Balance Sheet" description="Financial overview and summaries" />

            <div className="p-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <IndianRupee className="h-5 w-5 text-green-600" />
                                <span className="text-sm font-medium text-muted-foreground">Total Revenue</span>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{formatCurrency(tripSummary.totalRevenue)}</p>
                            <p className="text-sm text-muted-foreground mt-1">{tripSummary.totalTrips} trips</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-medium text-muted-foreground">Total Expense</span>
                            </div>
                            <p className="text-3xl font-bold text-red-600">{formatCurrency(tripSummary.totalExpense)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-muted-foreground">Net Profit</span>
                            </div>
                            <p className={`text-3xl font-bold ${tripSummary.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {formatCurrency(tripSummary.totalProfit)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-5 w-5 text-orange-600" />
                                <span className="text-sm font-medium text-muted-foreground">Receivable Balance</span>
                            </div>
                            <p className="text-3xl font-bold text-orange-600">{formatCurrency(partySummary.totalBalance)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Party Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" /> Billing Party Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Billed</p>
                                <p className="text-xl font-bold">{formatCurrency(partySummary.totalBillAmount)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Received</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(partySummary.totalReceived)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Outstanding</p>
                                <p className="text-xl font-bold text-orange-600">{formatCurrency(partySummary.totalBalance)}</p>
                            </div>
                        </div>
                        {parties.filter((p) => p.balanceAmt !== 0).length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Party Name</TableHead>
                                        <TableHead className="text-right">Opening</TableHead>
                                        <TableHead className="text-right">Billed</TableHead>
                                        <TableHead className="text-right">Received</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parties.filter((p) => p.balanceAmt !== 0).map((party) => (
                                        <TableRow key={party.id}>
                                            <TableCell className="font-medium">{party.name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(party.openBal)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(party.billAmtTrip + party.billAmtRT)}</TableCell>
                                            <TableCell className="text-right text-green-600">{formatCurrency(party.receiveAmt)}</TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={party.balanceAmt >= 0 ? "text-orange-600" : "text-red-600"}>
                                                    {formatCurrency(party.balanceAmt)}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Driver Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" /> Driver Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Debit (Paid)</p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(driverSummary.totalDebit)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Credit (Received)</p>
                                <p className="text-xl font-bold text-green-600">{formatCurrency(driverSummary.totalCredit)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Net Balance</p>
                                <p className="text-xl font-bold">{formatCurrency(driverSummary.totalBalance)}</p>
                            </div>
                        </div>
                        {drivers.filter((d) => d.closeBal !== 0).length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Driver Name</TableHead>
                                        <TableHead className="text-right">Opening</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {drivers.filter((d) => d.closeBal !== 0).map((driver) => (
                                        <TableRow key={driver.id}>
                                            <TableCell className="font-medium">{driver.name}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(driver.openBal)}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(driver.debit)}</TableCell>
                                            <TableCell className="text-right text-green-600">{formatCurrency(driver.credit)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(driver.closeBal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Transporter Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Truck className="h-5 w-5" /> Transporter Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Billed</p>
                                <p className="text-xl font-bold">{formatCurrency(transporterSummary.totalBillAmount)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Total Paid</p>
                                <p className="text-xl font-bold text-red-600">{formatCurrency(transporterSummary.totalPaid)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground">Payable Balance</p>
                                <p className="text-xl font-bold text-orange-600">{formatCurrency(transporterSummary.totalBalance)}</p>
                            </div>
                        </div>
                        {transporters.filter((t) => t.closeBal !== 0).length > 0 && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Transporter</TableHead>
                                        <TableHead>Vehicle</TableHead>
                                        <TableHead className="text-right">Opening</TableHead>
                                        <TableHead className="text-right">Billed</TableHead>
                                        <TableHead className="text-right">Paid</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transporters.filter((t) => t.closeBal !== 0).map((transporter) => (
                                        <TableRow key={transporter.id}>
                                            <TableCell className="font-medium">{transporter.name}</TableCell>
                                            <TableCell>{transporter.vehNo}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(transporter.openBal)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(transporter.billAmt)}</TableCell>
                                            <TableCell className="text-right text-red-600">{formatCurrency(transporter.paidAmt)}</TableCell>
                                            <TableCell className="text-right font-medium text-orange-600">{formatCurrency(transporter.closeBal)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
