"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useVehicles } from "@/hooks";
import { Vehicle } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Truck, Search } from "lucide-react";

const VEHICLE_TYPES = ["MXL", "SXL", "LCV", "HCV", "Container", "Trailer", "Tanker", "Other"];

export default function VehiclesPage() {
    const { vehicles, loading, fetchVehicles, createVehicle, editVehicle, removeVehicle } = useVehicles();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        vehNo: "",
        vehType: "",
    });

    useEffect(() => {
        fetchVehicles();
    }, [fetchVehicles]);

    const filteredVehicles = vehicles.filter(
        (v) =>
            v.vehNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.vehType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (vehicle?: Vehicle) => {
        if (vehicle) {
            setEditingVehicle(vehicle);
            setFormData({
                vehNo: vehicle.vehNo,
                vehType: vehicle.vehType,
            });
        } else {
            setEditingVehicle(null);
            setFormData({ vehNo: "", vehType: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingVehicle) {
                await editVehicle(editingVehicle.id, formData);
            } else {
                await createVehicle(formData);
            }

            setIsDialogOpen(false);
            setFormData({ vehNo: "", vehType: "" });
            setEditingVehicle(null);
        } catch {
            // Error is handled in the hook with toast
        }
    };

    const handleDelete = async () => {
        if (deletingVehicle) {
            try {
                await removeVehicle(deletingVehicle.id);
                setIsDeleteDialogOpen(false);
                setDeletingVehicle(null);
            } catch {
                // Error is handled in the hook with toast
            }
        }
    };

    const openDeleteDialog = (vehicle: Vehicle) => {
        setDeletingVehicle(vehicle);
        setIsDeleteDialogOpen(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            <PageHeader
                title="Vehicles"
                description="Manage your fleet vehicles"
            >
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vehicle
                </Button>
            </PageHeader>

            <div className="p-6">
                {/* Search */}
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search vehicles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Badge variant="secondary">
                        {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""}
                    </Badge>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredVehicles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No vehicles found</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    {searchQuery
                                        ? "Try a different search term"
                                        : "Get started by adding your first vehicle"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => handleOpenDialog()}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Vehicle
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Vehicle No</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Total Trips</TableHead>
                                        <TableHead className="text-right">Net Profit</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredVehicles.map((vehicle, index) => (
                                        <TableRow key={vehicle.id}>
                                            <TableCell className="text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">{vehicle.vehNo}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{vehicle.vehType}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">{vehicle.totalTrip}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(vehicle.netProfit)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(vehicle)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(vehicle)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
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

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingVehicle ? "Edit Vehicle" : "Add Vehicle"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingVehicle
                                ? "Update the vehicle details below"
                                : "Enter the details for the new vehicle"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vehNo">Vehicle Number</Label>
                                <Input
                                    id="vehNo"
                                    placeholder="e.g., MH01AB1234"
                                    value={formData.vehNo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, vehNo: e.target.value.toUpperCase() })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="vehType">Vehicle Type</Label>
                                <Select
                                    value={formData.vehType}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, vehType: value })
                                    }
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VEHICLE_TYPES.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingVehicle ? "Update" : "Add"} Vehicle
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Vehicle</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete vehicle{" "}
                            <strong>{deletingVehicle?.vehNo}</strong>? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
