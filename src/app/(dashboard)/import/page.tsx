"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUploadZone } from "@/components/import/FileUploadZone";
import { DataPreviewTable } from "@/components/import/DataPreviewTable";
import { FieldMismatchAlert } from "@/components/import/FieldMismatchAlert";
import { useImport } from "@/hooks/useImport";
import { Upload, Eye, Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";

export default function ImportPage() {
    const router = useRouter();
    const {
        step,
        parseResult,
        importProgress,
        importResults,
        isLoading,
        handleFileSelect,
        updateRowData,
        startImport,
        reset,
    } = useImport();

    const [showFieldAlerts, setShowFieldAlerts] = useState(true);

    const steps = [
        { id: "upload", label: "Upload", icon: Upload },
        { id: "preview", label: "Preview", icon: Eye },
        { id: "importing", label: "Import", icon: Loader2 },
        { id: "complete", label: "Complete", icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(s => s.id === step);
    const validRowCount = parseResult?.data.filter(d => d.isValid).length ?? 0;

    return (
        <div className="flex flex-col">
            <PageHeader title="Import Data" description="Import trips from Excel or CSV files">
                {step === "complete" && (
                    <Button onClick={() => router.push("/transactions/trips")}>
                        View Trips
                    </Button>
                )}
            </PageHeader>

            <div className="p-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {steps.map((s, idx) => {
                        const Icon = s.icon;
                        const isActive = idx === currentStepIndex;
                        const isComplete = idx < currentStepIndex;
                        return (
                            <div key={s.id} className="flex items-center">
                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${isActive ? "bg-primary text-primary-foreground" :
                                    isComplete ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                                        "bg-muted text-muted-foreground"
                                    }`}>
                                    <Icon className={`h-4 w-4 ${step === "importing" && s.id === "importing" ? "animate-spin" : ""}`} />
                                    <span className="text-sm font-medium">{s.label}</span>
                                </div>
                                {idx < steps.length - 1 && (
                                    <div className={`w-8 h-0.5 ${isComplete ? "bg-green-500" : "bg-muted"}`} />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Step Content */}
                <Card className="max-w-5xl mx-auto">
                    {step === "upload" && (
                        <>
                            <CardHeader>
                                <CardTitle>Upload File</CardTitle>
                                <CardDescription>
                                    Select a CSV, XLSX, or XLS file containing trip data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <FileUploadZone onFileSelect={handleFileSelect} />

                                {isLoading && (
                                    <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Parsing file...
                                    </div>
                                )}

                                {parseResult && !parseResult.success && (
                                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                        <p className="text-destructive font-medium">Failed to parse file</p>
                                        <ul className="text-sm text-destructive/80 mt-2 list-disc list-inside">
                                            {parseResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </CardContent>
                        </>
                    )}

                    {step === "preview" && parseResult && (
                        <>
                            <CardHeader>
                                <CardTitle>Preview Data</CardTitle>
                                <CardDescription>
                                    Review and edit the data before importing. Click on cells to edit.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {showFieldAlerts && (
                                    <FieldMismatchAlert
                                        extraFields={parseResult.extraFields}
                                        missingFields={parseResult.missingFields}
                                        onDismiss={() => setShowFieldAlerts(false)}
                                    />
                                )}

                                <DataPreviewTable
                                    data={parseResult.data}
                                    onDataChange={updateRowData}
                                />

                                <div className="flex justify-between pt-4">
                                    <Button variant="outline" onClick={reset}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back
                                    </Button>
                                    <Button onClick={startImport} disabled={validRowCount === 0}>
                                        Import {validRowCount} Trip{validRowCount !== 1 ? "s" : ""}
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {step === "importing" && (
                        <>
                            <CardHeader>
                                <CardTitle>Importing...</CardTitle>
                                <CardDescription>
                                    Please wait while we import your data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-muted-foreground mb-1">{importProgress.phase}</p>
                                        <p className="text-2xl font-bold">
                                            {importProgress.current} / {importProgress.total}
                                        </p>
                                        <p className="text-muted-foreground">trips imported</p>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    )}

                    {step === "complete" && (
                        <>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    {importResults.failed === 0 ? (
                                        <>
                                            <CheckCircle className="h-6 w-6 text-green-600" />
                                            Import Complete
                                        </>
                                    ) : (
                                        <>
                                            <AlertCircle className="h-6 w-6 text-amber-600" />
                                            Import Completed with Errors
                                        </>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                                            {importResults.success}
                                        </p>
                                        <p className="text-sm text-green-600 dark:text-green-500">
                                            Trips
                                        </p>
                                    </div>
                                    <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                                            {importResults.expensesCreated || 0}
                                        </p>
                                        <p className="text-sm text-purple-600 dark:text-purple-500">
                                            Expenses
                                        </p>
                                    </div>
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                                            {importResults.categoriesCreated}
                                        </p>
                                        <p className="text-sm text-blue-600 dark:text-blue-500">
                                            Categories
                                        </p>
                                    </div>
                                    <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-center">
                                        <p className="text-3xl font-bold text-red-700 dark:text-red-400">
                                            {importResults.failed}
                                        </p>
                                        <p className="text-sm text-red-600 dark:text-red-500">
                                            Failed
                                        </p>
                                    </div>
                                </div>

                                {importResults.errors.length > 0 && (
                                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                        <p className="font-medium text-destructive mb-2">Errors:</p>
                                        <ul className="text-sm space-y-1 max-h-40 overflow-y-auto">
                                            {importResults.errors.map((e, i) => (
                                                <li key={i} className="text-destructive/80">• {e}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="flex justify-center gap-4 pt-4">
                                    <Button variant="outline" onClick={reset}>
                                        <RotateCcw className="h-4 w-4 mr-2" />
                                        Import More
                                    </Button>
                                    <Button onClick={() => router.push("/transactions/trips")}>
                                        View Trips
                                    </Button>
                                </div>
                            </CardContent>
                        </>
                    )}
                </Card>
            </div>
        </div>
    );
}
