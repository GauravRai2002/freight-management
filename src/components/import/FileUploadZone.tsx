"use client";

import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
    onFileSelect: (file: File) => void;
    acceptedFormats?: string[];
    maxSizeMB?: number;
}

export function FileUploadZone({
    onFileSelect,
    acceptedFormats = [".csv", ".xlsx", ".xls"],
    maxSizeMB = 10,
}: FileUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback(
        (file: File): string | null => {
            const extension = "." + file.name.split(".").pop()?.toLowerCase();
            if (!acceptedFormats.includes(extension)) {
                return `Invalid file format. Accepted: ${acceptedFormats.join(", ")}`;
            }
            if (file.size > maxSizeMB * 1024 * 1024) {
                return `File too large. Maximum size: ${maxSizeMB}MB`;
            }
            return null;
        },
        [acceptedFormats, maxSizeMB]
    );

    const handleFile = useCallback(
        (file: File) => {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }
            setError(null);
            setSelectedFile(file);
            onFileSelect(file);
        },
        [validateFile, onFileSelect]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const handleRemoveFile = useCallback(() => {
        setSelectedFile(null);
        setError(null);
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    return (
        <div className="space-y-4">
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50",
                    error && "border-destructive"
                )}
            >
                <input
                    type="file"
                    accept={acceptedFormats.join(",")}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-3">
                    <div
                        className={cn(
                            "p-4 rounded-full transition-colors",
                            isDragging ? "bg-primary/10" : "bg-muted"
                        )}
                    >
                        <Upload
                            className={cn(
                                "h-8 w-8",
                                isDragging ? "text-primary" : "text-muted-foreground"
                            )}
                        />
                    </div>
                    <div>
                        <p className="font-medium">
                            {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Supports {acceptedFormats.join(", ")} (max {maxSizeMB}MB)
                        </p>
                    </div>
                </div>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {selectedFile && !error && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileSpreadsheet className="h-8 w-8 text-green-600" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {formatFileSize(selectedFile.size)}
                        </p>
                    </div>
                    <button
                        onClick={handleRemoveFile}
                        className="p-1 hover:bg-background rounded"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
