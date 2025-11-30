"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from "lucide-react";
import { getToken } from "@/lib/authenticate";

export default function ImportExpensesModal({ isOpen, onClose, onImportSuccess }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Review, 4: Complete
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [mapping, setMapping] = useState({
    date: '',
    category: '',
    amount: '',
    note: ''
  });
  const [importResults, setImportResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Supported file types
  const supportedFormats = ['.csv', '.xlsx', '.xls'];

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      alert('Please select a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  // Parse CSV/Excel file
  const parseFile = (selectedFile) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        if (selectedFile.name.endsWith('.csv')) {
          parseCSV(content);
        } else {
          parseExcel(content, selectedFile);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format.');
      }
    };

    if (selectedFile.name.endsWith('.csv')) {
      reader.readAsText(selectedFile);
    } else {
      reader.readAsArrayBuffer(selectedFile);
    }
  };

  // Parse CSV content
  const parseCSV = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    }).filter(row => Object.values(row).some(val => val));

    setPreviewData(data.slice(0, 10)); // Show first 10 rows
    autoDetectMapping(headers);
    setStep(2);
  };

  // Parse Excel content (simplified - you might want to use a library like SheetJS)
  const parseExcel = (content, file) => {
    // For Excel files, we'll show a simplified approach
    // In a real app, you'd use SheetJS or similar library
    alert('Excel parsing requires additional libraries. For now, please use CSV format.');
    return;
  };

  // Auto-detect column mapping
  const autoDetectMapping = (headers) => {
    const mapping = {
      date: '',
      category: '',
      amount: '',
      note: ''
    };

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      
      if (lowerHeader.includes('date')) mapping.date = header;
      else if (lowerHeader.includes('categor')) mapping.category = header;
      else if (lowerHeader.includes('amount') || lowerHeader.includes('price') || lowerHeader.includes('cost')) mapping.amount = header;
      else if (lowerHeader.includes('note') || lowerHeader.includes('description') || lowerHeader.includes('memo')) mapping.note = header;
    });

    setMapping(mapping);
  };

  // Handle mapping change
  const handleMappingChange = (field, value) => {
    setMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Process and import data
  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const expensesToImport = previewData.map(row => ({
        date: row[mapping.date] || '',
        category: row[mapping.category] || '',
        amount: row[mapping.amount] || '',
        note: row[mapping.note] || ''
      })).filter(expense => expense.date && expense.amount); // Filter out empty rows

      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `jwt ${token}`
        },
        body: JSON.stringify({ expenses: expensesToImport })
      });

      const result = await res.json();

      if (res.ok) {
        setImportResults(result);
        setStep(4);
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        throw new Error(result.message || 'Import failed');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset modal
  const resetModal = () => {
    setFile(null);
    setPreviewData([]);
    setMapping({
      date: '',
      category: '',
      amount: '',
      note: ''
    });
    setImportResults(null);
    setStep(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Close handler
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Get headers from preview data
  const headers = previewData.length > 0 ? Object.keys(previewData[0]) : [];

  // Download template
  const downloadTemplate = () => {
    const template = `date,category,amount,note
2024-01-15,Grocery,45.50,Weekly groceries
2024-01-16,Restaurant,32.75,Dinner with friends
2024-01-17,Transport,15.00,UBER ride
2024-01-18,Shopping,89.99,New clothes`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 && "Import Expenses"}
            {step === 2 && "Map Columns"}
            {step === 3 && "Review Import"}
            {step === 4 && "Import Complete"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Step 1: Upload */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Upload Your Expenses File
              </h3>
              <p className="text-gray-600 mb-6">
                Upload a CSV or Excel file containing your expenses. We'll help you map the columns.
              </p>

              {/* File Drop Zone */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 mb-6 hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  const droppedFile = e.dataTransfer.files[0];
                  handleFileSelect(droppedFile);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">
                  CSV, Excel files (Max 10MB)
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e.target.files[0])}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />

              {/* Template Download */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-3">
                  Don't have a template? Download our CSV template:
                </p>
                <button
                  onClick={downloadTemplate}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mx-auto"
                >
                  <Download className="w-4 h-4" />
                  Download CSV Template
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Mapping */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Map Your Columns
              </h3>
              <p className="text-gray-600 mb-6">
                Match your file columns to the required expense fields.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { key: 'date', label: 'Date', required: true, placeholder: 'e.g., 2024-01-15' },
                  { key: 'category', label: 'Category', required: true, placeholder: 'e.g., Grocery, Restaurant' },
                  { key: 'amount', label: 'Amount', required: true, placeholder: 'e.g., 45.50' },
                  { key: 'note', label: 'Note', required: false, placeholder: 'e.g., Weekly groceries' }
                ].map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={mapping[field.key]}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select column...</option>
                      {headers.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                    {mapping[field.key] && (
                      <p className="text-xs text-gray-500 mt-1">
                        Sample: {previewData[0]?.[mapping[field.key]] || 'No data'}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Data Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Data Preview</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {headers.slice(0, 6).map(header => (
                            <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 border-b">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b border-gray-100 last:border-b-0">
                            {headers.slice(0, 6).map(header => (
                              <td key={header} className="px-3 py-2 text-gray-600">
                                {row[header]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!mapping.date || !mapping.amount || !mapping.category}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Import
              </h3>
              <p className="text-gray-600 mb-6">
                Ready to import {previewData.length} expenses?
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Import Summary
                    </p>
                    <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                      <li>• Total rows found: {previewData.length}</li>
                      <li>• Date column: {mapping.date}</li>
                      <li>• Category column: {mapping.category}</li>
                      <li>• Amount column: {mapping.amount}</li>
                      {mapping.note && <li>• Note column: {mapping.note}</li>}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Start Import'
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && importResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Import Complete!
              </h3>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <p className="text-green-800 font-medium">
                  Successfully imported {importResults.importedCount} expenses
                </p>
                {importResults.errors.length > 0 && (
                  <div className="mt-3 text-left">
                    <p className="text-sm font-medium text-yellow-800 mb-2">
                      Some rows had errors:
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}