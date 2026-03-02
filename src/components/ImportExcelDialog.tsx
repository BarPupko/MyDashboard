import { useState, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { importFromExcel } from '../utils/excelExport';
import type { ImportResult } from '../utils/excelExport';
import type { WorkDayEntry } from '../types/workHours';

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (entries: WorkDayEntry[], mode: 'merge' | 'replace') => void;
}

export function ImportExcelDialog({ open, onOpenChange, onImport }: ImportExcelDialogProps) {
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    try {
      const importResult = await importFromExcel(selectedFile);
      setResult(importResult);
      
      if (importResult.success && importResult.entries.length > 0) {
        // Don't close yet, show results first
      }
    } catch (error) {
      setResult({
        success: false,
        entries: [],
        errors: [`Import failed: ${error}`],
        totalImported: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = () => {
    if (result?.success && result.entries.length > 0) {
      onImport(result.entries, importMode);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
          <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Import Excel File
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Import work hours data from an Excel file with Hebrew columns
          </Dialog.Description>

          <Dialog.Close asChild>
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </Dialog.Close>

          {/* File Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              selectedFile 
                ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="h-12 w-12 text-green-600" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">Click or drag to change file</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-12 w-12 text-gray-400" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Drop Excel file here or click to browse
                </p>
                <p className="text-xs text-gray-500">Supports .xlsx and .xls files</p>
              </div>
            )}
          </div>

          {/* Import Mode Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Import Mode
            </label>
            <RadioGroup.Root
              value={importMode}
              onValueChange={(value) => setImportMode(value as 'merge' | 'replace')}
              className="flex gap-4"
            >
              <div className="flex items-center">
                <RadioGroup.Item
                  value="merge"
                  id="merge"
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white" />
                </RadioGroup.Item>
                <label htmlFor="merge" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Merge (update existing, add new)
                </label>
              </div>
              <div className="flex items-center">
                <RadioGroup.Item
                  value="replace"
                  id="replace"
                  className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                >
                  <RadioGroup.Indicator className="flex items-center justify-center w-full h-full relative after:content-[''] after:block after:w-2 after:h-2 after:rounded-full after:bg-white" />
                </RadioGroup.Item>
                <label htmlFor="replace" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Replace all data
                </label>
              </div>
            </RadioGroup.Root>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div>
                  {result.success ? (
                    <>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Ready to import {result.totalImported} entries
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Click "Confirm Import" to save the data
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Import failed
                      </p>
                      {result.errors.map((error, i) => (
                        <p key={i} className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {error}
                        </p>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            
            {result?.success ? (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
              >
                Confirm Import ({result.totalImported} entries)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleImport}
                disabled={!selectedFile || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {isLoading ? 'Processing...' : 'Parse File'}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
