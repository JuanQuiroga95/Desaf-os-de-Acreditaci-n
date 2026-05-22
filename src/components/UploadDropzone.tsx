"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, File, X, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  onUploadSuccess: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function UploadDropzone({ onUploadSuccess, accept = "*", maxSizeMB = 10 }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo es muy grande. Máximo ${maxSizeMB}MB.`);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      // Usamos el endpoint directo de upload de vercel blob
      const response = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });

      if (!response.ok) {
        throw new Error("Error al subir archivo");
      }

      const blob = await response.json();
      onUploadSuccess(blob.url);
    } catch (err) {
      setError("Hubo un problema subiendo tu archivo. Intenta de nuevo.");
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <UploadCloud size={24} />
          </div>
          <div>
            <p className="font-semibold text-sm">Arrastra tu archivo aquí</p>
            <p className="text-xs text-muted-foreground mt-1">o haz clic para seleccionar</p>
          </div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Max {maxSizeMB}MB</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept={accept}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-border rounded-xl p-4 flex items-center justify-between bg-card">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
              <File size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          {!isUploading && (
            <button
              onClick={() => setFile(null)}
              className="p-2 text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors shrink-0"
              title="Quitar archivo"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-2 font-medium">{error}</p>}

      {file && (
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full mt-4 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <span className="animate-pulse">Subiendo...</span>
          ) : (
            <>
              <CheckCircle size={18} /> Confirmar Subida
            </>
          )}
        </button>
      )}
    </div>
  );
}
