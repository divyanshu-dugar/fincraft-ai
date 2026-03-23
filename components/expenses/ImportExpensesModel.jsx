"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from "lucide-react";
import { getToken } from "@/lib/authenticate";

export default function ImportExpensesModal({ isOpen, onClose, onImportSuccess }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map/Review, 3: Confirm, 4: Complete
  const [file, setFile] = useState(null);
  const [uploadType, setUploadType] = useState(null); // 'csv' or 'image'
  const [previewData, setPreviewData] = useState([]);
  const [importData, setImportData] = useState([]);
  const [mapping, setMapping] = useState({
    date: '',
    category: '',
    amount: '',
    note: ''
  });
  const [importResults, setImportResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const toApiLocalDateTime = (dateValue) => {
    if (!dateValue) return '';

    const normalized = String(dateValue).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      return `${normalized}T00:00:00`;
    }

    return normalized;
  };

  // Supported file types
  const supportedFormats = ['.csv', '.xlsx', '.xls'];
  const MAX_IMPORT_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

  // Handle file selection
  const handleFileSelect = (selectedFile, type) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    
    if (type === 'image') {
      if (!/\.(jpg|jpeg|png|gif|webp)$/.test(fileName)) {
        alert('Please select a valid image file (JPG, PNG, GIF, WebP)');
        return;
      }
      setFile(selectedFile);
      setUploadType('image');
      handleImageUpload(selectedFile);
    } else {
      const fileExtension = fileName.split('.').pop();
      if (!['csv', 'xlsx', 'xls'].includes(fileExtension)) {
        alert('Please select a CSV or Excel file');
        return;
      }

      if (selectedFile.size > MAX_IMPORT_FILE_SIZE_BYTES) {
        alert(`File is too large. Please upload a file smaller than ${Math.round(MAX_IMPORT_FILE_SIZE_BYTES / (1024 * 1024))} MB.`);
        return;
      }

      setFile(selectedFile);
      setUploadType('csv');
      parseFile(selectedFile);
    }
  };

  // Handle image upload with AI extraction
  const handleImageUpload = async (imageFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/expenses/extract-from-image`, {
        method: 'POST',
        headers: {
          'Authorization': `jwt ${token}`
        },
        body: formData
      });

      const result = await res.json();

      if (res.ok && result.expenses && result.expenses.length > 0) {
        setImportData(result.expenses);
        setPreviewData(result.expenses);
        setStep(2);
      } else {
        alert('No expenses found in image. Please try another screenshot.');
      }
    } catch (error) {
      console.error('Image extraction error:', error);
      alert('Error processing image: ' + error.message);
    } finally {
      setLoading(false);
    }
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

    setImportData(data);
    setPreviewData(data.slice(0, 10)); // Only preview first 10 rows in UI
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
    if (!file && importData.length === 0) return;

    setLoading(true);
    try {
      let expensesToImport = [];

      if (uploadType === 'csv') {
        expensesToImport = importData.map(row => ({
          date: toApiLocalDateTime(row[mapping.date] || ''),
          category: row[mapping.category] || '',
          amount: row[mapping.amount] || '',
          note: row[mapping.note] || ''
        })).filter(expense => expense.date && expense.amount);
      } else {
        // For images, data is already extracted and formatted
        expensesToImport = importData.map(expense => ({
          ...expense,
          date: toApiLocalDateTime(expense.date),
        }));
      }

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

        // Auto-close modal after successful import
        // If there were no errors or some imports succeeded, close after 2 seconds
        if (result.importedCount > 0) {
          setTimeout(() => {
            handleClose();
          }, 2000);
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
    setUploadType(null);
    setPreviewData([]);
    setImportData([]);
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
            {step === 2 && (uploadType === 'csv' ? "Map Columns" : "Review Extracted")}
            {step === 3 && "Confirm Import"}
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
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How would you like to import expenses?
              </h3>
              <p className="text-gray-600 mb-8">
                Choose between uploading a file or scanning a screenshot from your wallet app.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CSV/Excel Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Upload CSV/Excel</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Import expenses from a spreadsheet file
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files[0], 'csv')}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                  <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                    Choose File
                  </button>
                </motion.div>

                {/* Screenshot Option */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-gray-200 rounded-2xl p-6 cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.onchange = (e) => handleFileSelect(e.target.files[0], 'image');
                    input.click();
                  }}
                >
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Upload className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Scan Screenshot</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Use AI to extract expenses from wallet screenshots
                  </p>
                  <button className="text-sm text-green-600 font-medium hover:text-green-700">
                    Upload Screenshot
                  </button>
                </motion.div>
              </div>

              {/* Loading state for image processing */}
              {loading && (
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-600">Processing image...</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Mapping/Review */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {uploadType === 'csv' ? (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Map Your Columns
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Match your file columns to the required expense fields.
                  </p>

                  {importData.length > previewData.length && (
                    <p className="text-sm text-gray-500 mb-4">
                      Showing first {previewData.length} of {importData.length} rows for preview.
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {[
                      { key: 'date', label: 'Date', required: true },
                      { key: 'category', label: 'Category', required: true },
                      { key: 'amount', label: 'Amount', required: true },
                      { key: 'note', label: 'Note', required: false }
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
                      </div>
                    ))}
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
                </>
              ) : (
                <>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Review Extracted Expenses
                  </h3>
                  <p className="text-gray-600 mb-6">
                    AI found {previewData.length} transaction{previewData.length !== 1 ? 's' : ''} in your screenshot.
                  </p>

                  <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Date</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Category</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Amount</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700 border-b">Note</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.map((expense, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-600">{expense.date}</td>
                              <td className="px-4 py-3 text-gray-600">{expense.category}</td>
                              <td className="px-4 py-3 text-gray-600 font-medium">${expense.amount}</td>
                              <td className="px-4 py-3 text-gray-600 text-sm">{expense.note}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {uploadType === 'csv' ? 'Confirm CSV Import' : 'Confirm Import'}
              </h3>
              <p className="text-gray-600 mb-6">
                Ready to import {importData.length} expense{importData.length !== 1 ? 's' : ''}?
              </p>

              {uploadType === 'csv' ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">
                        Column Mapping Summary
                      </p>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Total rows: {importData.length}</li>
                        <li>• Date column: <span className="font-semibold">{mapping.date}</span></li>
                        <li>• Category column: <span className="font-semibold">{mapping.category}</span></li>
                        <li>• Amount column: <span className="font-semibold">{mapping.amount}</span></li>
                        {mapping.note && <li>• Note column: <span className="font-semibold">{mapping.note}</span></li>}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">
                        AI Extraction Summary
                      </p>
                      <p className="text-sm text-blue-700 mt-2">
                        Successfully extracted <span className="font-semibold">{previewData.length} transaction{previewData.length !== 1 ? 's' : ''}</span> from your screenshot.
                      </p>
                    </div>
                  </div>
                </div>
              )}

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
              {importResults.importedCount > 0 ? (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Import Complete!
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Redirecting to expense list...
                  </p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                    <p className="text-green-800 font-medium">
                      Successfully imported {importResults.importedCount} expense{importResults.importedCount !== 1 ? 's' : ''}
                    </p>
                    {importResults.errors.length > 0 && (
                      <div className="mt-3 text-left">
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                          ⚠️ Some rows had errors:
                        </p>
                        <ul className="text-sm text-yellow-700 space-y-1 max-h-32 overflow-y-auto">
                          {importResults.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Import Failed
                  </h3>
                  
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-800 font-medium mb-3">
                      No expenses could be imported. Please check the following:
                    </p>
                    <ul className="text-sm text-red-700 space-y-2 text-left max-h-40 overflow-y-auto">
                      {importResults.errors.length > 0 ? (
                        importResults.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))
                      ) : (
                        <>
                          <li>• Amount contains currency symbols or invalid format</li>
                          <li>• Date format is not recognized (use YYYY-MM-DD)</li>
                          <li>• Category is not properly formatted</li>
                        </>
                      )}
                    </ul>
                  </div>
                </>
              )}

              {importResults.importedCount === 0 && (
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Done
                </button>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}