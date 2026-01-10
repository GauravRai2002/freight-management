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
import { useDrivers } from "@/hooks";
import { Driver } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react";

export default function DriversPage() {
    const { drivers, loading, fetchDrivers, createDriver, editDriver, removeDriver } = useDrivers();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
    const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        contactNo: "",
        drCr: "" as "Dr" | "Cr" | "",
        openBal: 0,
        remark: "",
    });

    useEffect(() => {
        fetchDrivers();
    }, [fetchDrivers]);

    const filteredDrivers = drivers.filter(
        (d) =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.contactNo.includes(searchQuery)
    );

    const handleOpenDialog = (driver?: Driver) => {
        if (driver) {
            setEditingDriver(driver);
            setFormData({
                name: driver.name,
                contactNo: driver.contactNo,
                drCr: driver.drCr,
                openBal: driver.openBal,
                remark: driver.remark,
            });
        } else {
            setEditingDriver(null);
            setFormData({ name: "", contactNo: "", drCr: "", openBal: 0, remark: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingDriver) {
                await editDriver(editingDriver.id, formData);
            } else {
                await createDriver(formData);
            }

            setIsDialogOpen(false);
            setFormData({ name: "", contactNo: "", drCr: "", openBal: 0, remark: "" });
            setEditingDriver(null);
        } catch {
            // Error handled in hook
        }
    };

    const handleDelete = async () => {
        if (deletingDriver) {
            try {
                await removeDriver(deletingDriver.id);
                setIsDeleteDialogOpen(false);
                setDeletingDriver(null);
            } catch {
                // Error handled in hook
            }
        }
    };

    const openDeleteDialog = (driver: Driver) => {
        setDeletingDriver(driver);
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
                title="Drivers"
                description="Manage your fleet drivers"
            >
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Driver
                </Button>
            </PageHeader>

            <div className="p-6">
                {/* Search */}
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search drivers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Badge variant="secondary">
                        {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? "s" : ""}
                    </Badge>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredDrivers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No drivers found</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    {searchQuery
                                        ? "Try a different search term"
                                        : "Get started by adding your first driver"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => handleOpenDialog()}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Driver
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Dr/Cr</TableHead>
                                        <TableHead className="text-right">Opening Bal</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead className="text-right">Closing Bal</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredDrivers.map((driver, index) => (
                                        <TableRow key={driver.id}>
                                            <TableCell className="text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">{driver.name}</TableCell>
                                            <TableCell>{driver.contactNo || "-"}</TableCell>
                                            <TableCell>
                                                {driver.drCr && (
                                                    <Badge variant={driver.drCr === "Dr" ? "destructive" : "success"}>
                                                        {driver.drCr}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(driver.openBal)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(driver.debit)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(driver.credit)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {formatCurrency(driver.closeBal)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(driver)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(driver)}
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
                            {editingDriver ? "Edit Driver" : "Add Driver"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingDriver
                                ? "Update the driver details below"
                                : "Enter the details for the new driver"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Driver Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter driver name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="contactNo">Contact Number</Label>
                                <Input
                                    id="contactNo"
                                    placeholder="Enter contact number"
                                    value={formData.contactNo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, contactNo: e.target.value })
                                    }
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="drCr">Dr/Cr</Label>
                                    <Select
                                        value={formData.drCr}
                                        onValueChange={(value) =>
                                            setFormData({ ...formData, drCr: value as "Dr" | "Cr" | "" })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dr">Debit (Dr)</SelectItem>
                                            <SelectItem value="Cr">Credit (Cr)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="openBal">Opening Balance</Label>
                                    <Input
                                        id="openBal"
                                        type="number"
                                        placeholder="0"
                                        value={formData.openBal}
                                        onChange={(e) =>
                                            setFormData({ ...formData, openBal: Number(e.target.value) })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="remark">Remark</Label>
                                <Input
                                    id="remark"
                                    placeholder="Any remarks"
                                    value={formData.remark}
                                    onChange={(e) =>
                                        setFormData({ ...formData, remark: e.target.value })
                                    }
                                />
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
                                {editingDriver ? "Update" : "Add"} Driver
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Driver</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete driver{" "}
                            <strong>{deletingDriver?.name}</strong>? This action cannot be
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
