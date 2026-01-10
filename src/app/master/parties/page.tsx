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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    loadBillingParties,
    addBillingParty,
    updateBillingParty,
    deleteBillingParty,
} from "@/store/slices/billingPartySlice";
import { BillingParty } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Building2, Search } from "lucide-react";

export default function PartiesPage() {
    const dispatch = useAppDispatch();
    const { items: parties, loading } = useAppSelector((state) => state.billingParties);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingParty, setEditingParty] = useState<BillingParty | null>(null);
    const [deletingParty, setDeletingParty] = useState<BillingParty | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        contactNo: "",
        drCr: "" as "Dr" | "Cr" | "",
        openBal: 0,
        remark: "",
    });

    useEffect(() => {
        dispatch(loadBillingParties());
    }, [dispatch]);

    const filteredParties = parties.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.contactNo.includes(searchQuery)
    );

    const handleOpenDialog = (party?: BillingParty) => {
        if (party) {
            setEditingParty(party);
            setFormData({
                name: party.name,
                contactNo: party.contactNo,
                drCr: party.drCr,
                openBal: party.openBal,
                remark: party.remark,
            });
        } else {
            setEditingParty(null);
            setFormData({ name: "", contactNo: "", drCr: "", openBal: 0, remark: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingParty) {
            dispatch(
                updateBillingParty({
                    id: editingParty.id,
                    updates: formData,
                })
            );
        } else {
            dispatch(addBillingParty(formData));
        }

        setIsDialogOpen(false);
        setFormData({ name: "", contactNo: "", drCr: "", openBal: 0, remark: "" });
        setEditingParty(null);
    };

    const handleDelete = () => {
        if (deletingParty) {
            dispatch(deleteBillingParty(deletingParty.id));
            setIsDeleteDialogOpen(false);
            setDeletingParty(null);
        }
    };

    const openDeleteDialog = (party: BillingParty) => {
        setDeletingParty(party);
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
                title="Billing Parties"
                description="Manage your customers and billing parties"
            >
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Party
                </Button>
            </PageHeader>

            <div className="p-6">
                {/* Search */}
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search parties..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Badge variant="secondary">
                        {filteredParties.length} part{filteredParties.length !== 1 ? "ies" : "y"}
                    </Badge>
                </div>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {filteredParties.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No billing parties found</h3>
                                <p className="text-muted-foreground text-sm mb-4">
                                    {searchQuery
                                        ? "Try a different search term"
                                        : "Get started by adding your first billing party"}
                                </p>
                                {!searchQuery && (
                                    <Button onClick={() => handleOpenDialog()}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Party
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Party Name</TableHead>
                                        <TableHead>Contact</TableHead>
                                        <TableHead>Dr/Cr</TableHead>
                                        <TableHead className="text-right">Opening Bal</TableHead>
                                        <TableHead className="text-right">Bill Amt (Trip)</TableHead>
                                        <TableHead className="text-right">Received</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredParties.map((party, index) => (
                                        <TableRow key={party.id}>
                                            <TableCell className="text-muted-foreground">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">{party.name}</TableCell>
                                            <TableCell>{party.contactNo || "-"}</TableCell>
                                            <TableCell>
                                                {party.drCr && (
                                                    <Badge variant={party.drCr === "Dr" ? "destructive" : "success"}>
                                                        {party.drCr}
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(party.openBal)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(party.billAmtTrip)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(party.receiveAmt)}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={party.balanceAmt < 0 ? "text-destructive" : ""}>
                                                    {formatCurrency(party.balanceAmt)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenDialog(party)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(party)}
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
                            {editingParty ? "Edit Billing Party" : "Add Billing Party"}
                        </DialogTitle>
                        <DialogDescription>
                            {editingParty
                                ? "Update the party details below"
                                : "Enter the details for the new billing party"}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Party Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter party name"
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
                                {editingParty ? "Update" : "Add"} Party
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Billing Party</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <strong>{deletingParty?.name}</strong>? This action cannot be
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
