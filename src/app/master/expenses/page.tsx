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
import { loadExpenseCategories, addExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from "@/store/slices/expenseCategorySlice";
import { ExpenseCategory } from "@/types";
import { Plus, Pencil, Trash2, Receipt, Search } from "lucide-react";

const EXPENSE_MODES = ["General", "Expenses", "Fuel"] as const;

export default function ExpenseCategoriesPage() {
    const dispatch = useAppDispatch();
    const { items, loading } = useAppSelector((state) => state.expenseCategories);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ExpenseCategory | null>(null);
    const [deletingItem, setDeletingItem] = useState<ExpenseCategory | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({ name: "", mode: "General" as "General" | "Expenses" | "Fuel" });

    useEffect(() => { dispatch(loadExpenseCategories()); }, [dispatch]);

    const filteredItems = items.filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleOpenDialog = (item?: ExpenseCategory) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, mode: item.mode });
        } else {
            setEditingItem(null);
            setFormData({ name: "", mode: "General" });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingItem) {
            dispatch(updateExpenseCategory({ id: editingItem.id, updates: formData }));
        } else {
            dispatch(addExpenseCategory(formData));
        }
        setIsDialogOpen(false);
    };

    const handleDelete = () => {
        if (deletingItem) {
            dispatch(deleteExpenseCategory(deletingItem.id));
            setIsDeleteDialogOpen(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="text-muted-foreground">Loading...</div></div>;

    return (
        <div className="flex flex-col">
            <PageHeader title="Expense Categories" description="Manage expense types and categories">
                <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
            </PageHeader>

            <div className="p-6">
                <div className="mb-4 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                    </div>
                    <Badge variant="secondary">{filteredItems.length} categor{filteredItems.length !== 1 ? "ies" : "y"}</Badge>
                </div>

                <Card>
                    <CardContent className="p-0">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium mb-2">No categories found</h3>
                                <p className="text-muted-foreground text-sm mb-4">{searchQuery ? "Try a different search" : "Add your first expense category"}</p>
                                {!searchQuery && <Button onClick={() => handleOpenDialog()}><Plus className="h-4 w-4 mr-2" />Add Category</Button>}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">#</TableHead>
                                        <TableHead>Category Name</TableHead>
                                        <TableHead>Mode</TableHead>
                                        <TableHead className="w-24 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.map((item, index) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell><Badge variant="outline">{item.mode}</Badge></TableCell>
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
                        <DialogTitle>{editingItem ? "Edit Category" : "Add Category"}</DialogTitle>
                        <DialogDescription>{editingItem ? "Update the category details" : "Enter the details for the new category"}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input id="name" placeholder="e.g., BORDER-EXP" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label>Mode</Label>
                                <Select value={formData.mode} onValueChange={(v) => setFormData({ ...formData, mode: v as typeof formData.mode })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {EXPENSE_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>Are you sure you want to delete <strong>{deletingItem?.name}</strong>?</DialogDescription>
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
