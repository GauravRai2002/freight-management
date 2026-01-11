"use client";

import { useState } from "react";
import { TripImportData } from "@/lib/importConfig";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface DataPreviewTableProps {
    data: TripImportData[];
    onDataChange: (index: number, field: keyof TripImportData, value: unknown) => void;
}

export function DataPreviewTable({ data, onDataChange }: DataPreviewTableProps) {
    const [page, setPage] = useState(0);
    const pageSize = 50;
    const totalPages = Math.ceil(data.length / pageSize);
    const pageData = data.slice(page * pageSize, (page + 1) * pageSize);

    const validCount = data.filter(d => d.isValid).length;
    const invalidCount = data.length - validCount;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Badge variant="secondary">{data.length} rows</Badge>
                <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {validCount} valid
                </Badge>
                {invalidCount > 0 && (
                    <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {invalidCount} errors
                    </Badge>
                )}
            </div>

            <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Trip No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Plant</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead className="text-right">Cars</TableHead>
                            <TableHead className="text-right">Invoice</TableHead>
                            <TableHead className="text-right">Expense</TableHead>
                            <TableHead className="text-right">Profit</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pageData.map((row, idx) => {
                            const actualIndex = page * pageSize + idx;
                            const hasErrors = !row.isValid;
                            return (
                                <TableRow key={actualIndex} className={hasErrors ? "bg-destructive/10" : ""}>
                                    <TableCell className="text-muted-foreground">{actualIndex + 1}</TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.tripNo || ""}
                                            onChange={(e) => onDataChange(actualIndex, "tripNo", e.target.value)}
                                            className="h-8 w-32"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="date"
                                            value={row.date || ""}
                                            onChange={(e) => onDataChange(actualIndex, "date", e.target.value)}
                                            className="h-8 w-32"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            value={row.vehNo || ""}
                                            onChange={(e) => onDataChange(actualIndex, "vehNo", e.target.value)}
                                            className="h-8 w-28"
                                        />
                                    </TableCell>
                                    <TableCell className="max-w-[100px] truncate">{row.plantName || "-"}</TableCell>
                                    <TableCell className="max-w-[80px] truncate">{row.fromLocation || "-"}</TableCell>
                                    <TableCell className="max-w-[80px] truncate">{row.toLocation || "-"}</TableCell>
                                    <TableCell className="text-right">{isNaN(row.carQty) ? 0 : row.carQty}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(row.tripFare)}</TableCell>
                                    <TableCell className="text-right text-red-600">{formatCurrency(row.tripExpense)}</TableCell>
                                    <TableCell className={`text-right font-medium ${!isNaN(row.profitStatement) && row.profitStatement >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {formatCurrency(row.profitStatement)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.isValid ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-destructive mx-auto" />
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </ScrollArea>

            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing {page * pageSize + 1}-{Math.min((page + 1) * pageSize, data.length)} of {data.length}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
