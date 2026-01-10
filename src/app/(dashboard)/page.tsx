"use client";

import { useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVehicles, useDrivers, useBillingParties, useTransporters, useTrips, useTripBooks } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import {
  Truck,
  Users,
  Building2,
  Map,
  TrendingUp,
  IndianRupee,
  Package,
  Activity,
} from "lucide-react";

export default function DashboardPage() {
  const { vehicles, fetchVehicles } = useVehicles();
  const { drivers, fetchDrivers } = useDrivers();
  const { billingParties, fetchBillingParties } = useBillingParties();
  const { transporters, fetchTransporters } = useTransporters();
  const { trips, fetchTrips } = useTrips();
  const { tripBooks, fetchTripBooks } = useTripBooks();

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
    fetchBillingParties();
    fetchTransporters();
    fetchTrips();
    fetchTripBooks();
  }, [fetchVehicles, fetchDrivers, fetchBillingParties, fetchTransporters, fetchTrips, fetchTripBooks]);

  // Calculate totals
  const totalRevenue = tripBooks.reduce((sum, tb) => sum + (tb.tripAmount || 0), 0);
  const totalProfit = tripBooks.reduce((sum, tb) => sum + (tb.netProfit || 0), 0);
  const pendingAmount = tripBooks.reduce((sum, tb) => sum + (tb.pendingAmt || 0), 0);

  const stats = [
    {
      title: "Total Vehicles",
      value: vehicles.length,
      icon: Truck,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Active Drivers",
      value: drivers.length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Billing Parties",
      value: billingParties.length,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Transporters",
      value: transporters.length,
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Total Trips",
      value: trips.length,
      icon: Map,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      title: "Net Profit",
      value: formatCurrency(totalProfit),
      icon: TrendingUp,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    },
    {
      title: "Pending Amount",
      value: formatCurrency(pendingAmount),
      icon: Activity,
      color: "text-rose-600",
      bgColor: "bg-rose-100 dark:bg-rose-900/30",
    },
  ];

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Dashboard"
        description="Overview of your fleet management system"
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Recent Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              {trips.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No trips recorded yet. Start by adding a new trip.
                </p>
              ) : (
                <div className="space-y-3">
                  {trips.slice(-5).reverse().map((trip) => (
                    <div
                      key={trip.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">Trip #{trip.tripNo}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.from} → {trip.to}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(trip.tripFare)}</p>
                        <p className="text-sm text-muted-foreground">{trip.vehNo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Active Vehicles</span>
                  <span className="font-medium">{vehicles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Kilometers</span>
                  <span className="font-medium">
                    {trips.reduce((sum, t) => sum + (t.tripKm || 0), 0).toLocaleString()} km
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fuel Expenses</span>
                  <span className="font-medium">
                    {formatCurrency(trips.reduce((sum, t) => sum + (t.fuelExpAmt || 0), 0))}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Average Trip Value</span>
                  <span className="font-medium">
                    {formatCurrency(trips.length > 0 ? totalRevenue / trips.length : 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        {vehicles.length === 0 && drivers.length === 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Welcome to FleetTracker! Here&apos;s how to get started:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Add your vehicles in the <strong>Vehicles</strong> section</li>
                <li>Register your drivers in the <strong>Drivers</strong> section</li>
                <li>Add your billing parties (customers) in <strong>Billing Parties</strong></li>
                <li>Set up expense categories and payment modes</li>
                <li>Start recording trips in the <strong>Trips</strong> section</li>
              </ol>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
