"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    loadTransporters, addTransporter, updateTransporter, deleteTransporter,
} from "@/store/slices/transporterSlice";
import { Transporter } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Truck, Search } from "lucide-react";

export default function TransportersPage() {
    const dispatch = useAppDispatch();
    const { items: transporters, loading } = useAppSelector((state) => state.transporters);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Transporter | null>(null);
    const [deletingItem, setDeletingItem] = useState<Transporter | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        vehNo: "", name: "", drCr: "" as "Dr" | "Cr" | "", openBal: 0, remark: "",
    });

    useEffect(() => { dispatch(loadTransporters()); }, [dispatch]);

    const filteredItems = transporters.filter(
        (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.vehNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenDialog = (item?: Transporter) => {
        if (item) {
            setEditingItem(item);
            setFormData({ vehNo: item.vehNo, name: item.name, drCr: item.drCr, openBal: item.openBal, remark: item.remark });
        } else {
            setEditingItem(null);
            setFormData({ vehNo: "", name: "", drCr: "", openBal: 0, remark: "" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            dispatch(updateTransporter({ id: editingItem.id, updates: formData }));
        } else {
            dispatch(addTransporter(formData));
        }
        setIsDialogOpen(false);
        setEditingItem(null);
    };

    const handleDelete = () => {
        if (deletingItem) {
            dispatch(deleteTransporter(deletingItem.id));
            setIsDeleteDialogOpen(false);
            setDeletingItem(null);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Transporters" description="Manage market vehicle transporters">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Transporter</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search transporters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} transporter{filteredItems.length !== 1 ? "s" : ""}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Truck className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No transporters found</h3>
                                <p className="text-muted-foreground text-sm mb-4">{searchQuery ? "Try a different search term" : "Get started by adding your first transporter"}</p>
                                {!searchQuery && <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Transporter</Button>}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Vehicle No</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Dr/Cr</TableHead>
                                        <TableHead className="text-right">Opening Bal</TableHead>
                                        <TableHead className="text-right">Total Trips</TableHead>
                                        <TableHead className="text-right">Bill Amt</TableHead>
                                        <TableHead className="text-right">Paid Amt</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.vehNo}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.drCr && <Badge variant={item.drCr === "Dr" ? "destructive" : "success"}>{item.drCr}</Badge>}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.openBal)}</TableCell>
                                            <TableCell className="text-right">{item.totalTrip}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.billAmt)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.paidAmt)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.closeBal)}</TableCell>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Transporter" : "Add Transporter"}</DialogTitle>
                        <DialogDescription>{editingItem ? "Update the transporter details" : "Enter the details for the new transporter"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="vehNo">Vehicle Number</Label>
                                <Input id="vehNo" placeholder="e.g., MH01AB1234" value={formData.vehNo} onChange={(e) => setFormData({ ...formData, vehNo: e.target.value.toUpperCase() })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="name">Transporter Name</Label>
                                <Input id="name" placeholder="Enter transporter name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Dr/Cr</Label>
                                    <Select value={formData.drCr} onValueChange={(v) => setFormData({ ...formData, drCr: v as "Dr" | "Cr" | "" })}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Dr">Debit (Dr)</SelectItem>
                                            <SelectItem value="Cr">Credit (Cr)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="openBal">Opening Balance</Label>
                                    <Input id="openBal" type="number" value={formData.openBal} onChange={(e) => setFormData({ ...formData, openBal: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="remark">Remark</Label>
                                <Input id="remark" value={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingItem ? "Update" : "Add"} Transporter</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Transporter</DialogTitle>
                        <DialogDescription>Are you sure you want to delete <strong>{deletingItem?.name}</strong>? This action cannot be undone.</DialogDescription>
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
