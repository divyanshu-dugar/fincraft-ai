"use client";

import toast from "react-hot-toast";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { getToken } from "@/lib/authenticate";
import { CategoryPicker } from "@/components/categories/CategoryPicker";

// ─── helpers ─────────────────────────────────────────────────────────────────

let _rid = 0;
function uid() { return ++_rid; }

function toApiLocalDateTime(v) {
  if (!v) return "";
  const s = String(v).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00` : s;
}

// Common AI category name aliases → canonical sub-category names
const CATEGORY_ALIASES = {
  food: "restaurant", dining: "restaurant", "eating out": "restaurant",
  cafe: "drinks/coffee", coffee: "drinks/coffee", tea: "drinks/coffee",
  grocery: "groceries", "grocery shopping": "groceries", supermarket: "groceries",
  gas: "transport", fuel: "transport", uber: "transport", taxi: "transport", cab: "transport", transit: "transport", bus: "transport", metro: "transport", train: "transport",
  movie: "entertainment", movies: "entertainment", netflix: "subscriptions", spotify: "subscriptions",
  gym: "fitness", workout: "fitness",
  doctor: "health/medical", hospital: "health/medical", pharmacy: "health/medical", medicine: "health/medical",
  rent: "rent/mortgage", mortgage: "rent/mortgage",
  electricity: "utilities", water: "utilities", power: "utilities",
  mobile: "phone bill", phone: "phone bill", recharge: "phone bill",
  wifi: "internet", broadband: "internet",
  clothes: "shopping", clothing: "shopping", amazon: "shopping", online: "shopping",
  gift: "gifts", donation: "charity",
  course: "education", tuition: "education", book: "education", books: "education",
  haircut: "grooming", salon: "grooming", barber: "grooming",
  sip: "mutual funds", "mutual fund": "mutual funds",
};

/** Try to resolve an AI-returned category string into a CategoryPicker value. */
function autoMatch(name, tree) {
  if (!name || !tree?.length) return null;
  const q = name.toLowerCase().trim();

  const mkVal = (p, s) => ({
    parentId: p._id, parentName: p.name, parentIcon: p.icon,
    subcategoryId: s?._id || null, subcategoryName: s?.name || null, subcategoryIcon: s?.icon || undefined,
  });

  // 1. exact sub-category name
  for (const p of tree)
    for (const s of p.subcategories || [])
      if (s.name.toLowerCase() === q) return mkVal(p, s);

  // 2. exact parent name
  for (const p of tree)
    if (p.name.toLowerCase() === q) return mkVal(p, null);

  // 3. alias lookup → match resolved alias to sub-category
  const alias = CATEGORY_ALIASES[q];
  if (alias) {
    for (const p of tree)
      for (const s of p.subcategories || [])
        if (s.name.toLowerCase() === alias) return mkVal(p, s);
  }

  // 4. partial / fuzzy: sub name contains query OR query contains sub's first word
  for (const p of tree)
    for (const s of p.subcategories || []) {
      const sn = s.name.toLowerCase();
      const sw = sn.split(" ")[0];
      if (sn.includes(q) || q.includes(sw)) return mkVal(p, s);
    }

  return null;
}

// ─── editable row card (image flow) ──────────────────────────────────────────

function EditableRowCard({ row, index, onChange, onDelete, categoryTree, onAddCategory }) {
  const [open, setOpen] = useState(false);
  const unmatched = !row.category;

  return (
    <div className={`rounded-2xl border ${unmatched ? "border-amber-500/30 bg-amber-500/10" : "border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60"} overflow-hidden`}>
      {/* card header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400 flex-shrink-0">
          {index + 1}
        </span>

        {/* category badge */}
        <div className="flex-1 min-w-0">
          {row.category ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                {row.category.parentIcon} {row.category.parentName}
              </span>
              {row.category.subcategoryName && (
                <>
                  <span className="text-gray-300">›</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {row.category.subcategoryIcon} {row.category.subcategoryName}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-sm font-semibold text-amber-400">
                {row.aiCategory ? `"${row.aiCategory}" — needs category` : "No category set"}
              </span>
            </div>
          )}
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {row.date || "No date"} · ${row.amount || "0"}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {row.category && <Check className="w-4 h-4 text-emerald-500" />}
          {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {/* editable fields */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-300 dark:border-slate-700 pt-4">
          {/* ai suggestion hint */}
          {row.aiCategory && !row.category && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-amber-300">AI suggested: "{row.aiCategory}"</p>
                <p className="text-amber-400 mt-0.5">This doesn't match any existing category. Please pick one below, or create a new sub-category.</p>
              </div>
            </div>
          )}
          {row.aiCategory && row.category && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
              <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
              AI suggested "{row.aiCategory}" — auto-matched above. Change if needed.
            </div>
          )}

          {/* category picker */}
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Category <span className="text-rose-400">*</span></p>
            <CategoryPicker
              tree={categoryTree}
              value={row.category}
              onChange={(v) => onChange(row._id, "category", v)}
              onAddCategory={onAddCategory}
              placeholder="Select category"
              error={!row.category ? "Required" : undefined}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* date */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Date</p>
              <input
                type="date"
                value={row.date}
                onChange={(e) => onChange(row._id, "date", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-200 [color-scheme:dark] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>
            {/* amount */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Amount ($)</p>
              <input
                type="number"
                inputMode="decimal"
                value={row.amount}
                min="0"
                onWheel={(e) => e.currentTarget.blur()}
                onChange={(e) => onChange(row._id, "amount", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
              />
            </div>
          </div>

          {/* note */}
          <div>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">Note</p>
            <input
              type="text"
              value={row.note}
              onChange={(e) => onChange(row._id, "note", e.target.value)}
              placeholder="Optional note…"
              className="w-full px-3 py-2 rounded-xl border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
          </div>

          {/* delete */}
          <button
            type="button"
            onClick={() => onDelete(row._id)}
            className="flex items-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove this expense
          </button>
        </div>
      )}
    </div>
  );
}

// ─── CSV category name resolver (one row per unique name) ─────────────────────

function CsvCategoryResolver({ names, mappings, onChange, categoryTree, onAddCategory }) {
  return (
    <div className="space-y-3">
      {names.map((name) => {
        const cat = mappings[name];
        return (
          <div key={name} className={`rounded-2xl border p-4 ${cat ? "border-slate-300 dark:border-slate-700 bg-slate-100/60 dark:bg-slate-800/60" : "border-amber-500/30 bg-amber-500/10"}`}>
            <div className="flex items-center gap-3 mb-3">
              {cat
                ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                : <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />}
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">"{name}"</span>
              {cat ? (
                <span className="ml-auto text-xs text-emerald-400 font-semibold">
                  → {cat.parentName}{cat.subcategoryName ? ` › ${cat.subcategoryName}` : ""}
                </span>
              ) : (
                <span className="ml-auto text-xs text-amber-400 font-semibold">needs selection</span>
              )}
            </div>
            <CategoryPicker
              tree={categoryTree}
              value={cat || null}
              onChange={(v) => onChange(name, v)}
              onAddCategory={onAddCategory}
              placeholder={`Map "${name}" to a category`}
            />
          </div>
        );
      })}
    </div>
  );
}

// ─── main modal ───────────────────────────────────────────────────────────────

/**
 * Steps:
 *  1 – Choose file type (Upload)
 *  2 – CSV column mapping  (CSV only; image skips to 3)
 *  3 – Review & Edit (image: editable cards; CSV: category-name resolver)
 *  4 – Confirm
 *  5 – Complete
 */
export default function ImportExpensesModal({ isOpen, onClose, onImportSuccess }) {
  const [step,          setStep]         = useState(1);
  const [uploadType,    setUploadType]   = useState(null); // 'csv' | 'image'
  const [importData,    setImportData]   = useState([]); // raw CSV rows
  const [mapping,       setMapping]      = useState({ date: "", category: "", amount: "", note: "" });
  const [editableRows,  setEditableRows] = useState([]); // image flow rows
  const [csvUniqNames,  setCsvUniqNames] = useState([]); // unique category names from CSV
  const [csvCatMap,     setCsvCatMap]    = useState({}); // name → CategoryValue
  const [importResults, setImportResults] = useState(null);
  const [loading,       setLoading]      = useState(false);
  const [categoryTree,  setCategoryTree] = useState([]);
  const fileInputRef = useRef(null);

  const MAX_SIZE = 5 * 1024 * 1024;

  // ── fetch category tree ────────────────────────────────────────────────────
  const fetchCategoryTree = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expense-categories`, {
        headers: { Authorization: `jwt ${token}` },
      });
      if (!res.ok) return;
      const d = await res.json();
      if (d.tree) setCategoryTree(d.tree);
    } catch { /* silent */ }
  }, []);

  // Seed defaults if tree is empty on first open
  const seedAndFetch = useCallback(async () => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expense-categories/seed`, {
        method: "POST",
        headers: { Authorization: `jwt ${token}` },
      });
      await fetchCategoryTree();
    } catch { /* silent */ }
  }, [fetchCategoryTree]);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      await fetchCategoryTree();
      // Re-read from the API response directly — categoryTree state may not be committed yet
      const token = getToken();
      if (!token) return;
      try {
        const checkRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expense-categories`, {
          headers: { Authorization: `jwt ${token}` },
        });
        if (!checkRes.ok) return;
        const checkData = await checkRes.json();
        if (!checkData.tree?.length) await seedAndFetch();
      } catch { /* silent */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── add category from inside the modal ────────────────────────────────────
  const handleAddCategory = async (parentId, name, color) => {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");
    const body = parentId ? { name, parentCategory: parentId } : { name, isParent: true };
    if (color) body.color = color;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expense-categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `jwt ${token}` },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.error || "Failed to create category");
    }
    await fetchCategoryTree();
  };

  // ── reset ──────────────────────────────────────────────────────────────────
  const reset = () => {
    setStep(1);
    setUploadType(null);
    setImportData([]);
    setMapping({ date: "", category: "", amount: "", note: "" });
    setEditableRows([]);
    setCsvUniqNames([]);
    setCsvCatMap({});
    setImportResults(null);
    setLoading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleClose = () => { reset(); onClose(); };

  // ── file selection ─────────────────────────────────────────────────────────
  const handleFileSelect = (selectedFile, type) => {
    if (!selectedFile) return;
    const name = selectedFile.name.toLowerCase();
    if (type === "image") {
      if (!/\.(jpg|jpeg|png|gif|webp)$/.test(name)) { toast.error("Please select a valid image (JPG, PNG, GIF, WebP)"); return; }
      setUploadType("image");
      handleImageUpload(selectedFile);
    } else {
      const ext = name.split(".").pop();
      if (!["csv", "xlsx", "xls"].includes(ext)) { toast.error("Please select a CSV or Excel file"); return; }
      if (selectedFile.size > MAX_SIZE) { toast.error("File is too large (max 5 MB)"); return; }
      setUploadType("csv");
      parseFile(selectedFile);
    }
  };

  // ── image upload → AI extraction ───────────────────────────────────────────
  const handleImageUpload = async (imageFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/extract-from-image`, {
        method: "POST",
        headers: { Authorization: `jwt ${token}` },
        body: formData,
      });
      const result = await res.json();
      if (res.ok && result.expenses?.length > 0) {
        buildEditableRows(result.expenses);
      } else {
        toast.error("No expenses found in image. Please try another screenshot.");
      }
    } catch (err) {
      toast.error("Error processing image: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Convert AI-extracted expenses into editable rows and go to step 3. */
  function buildEditableRows(expenses) {
    const rows = expenses.map((e) => ({
      _id: uid(),
      date: typeof e.date === "string" ? e.date.slice(0, 10) : "",
      amount: String(e.amount || ""),
      note: e.note || "",
      aiCategory: e.category || "",
      category: autoMatch(e.category, categoryTree),
    }));
    setEditableRows(rows);
    setStep(3);
  }

  // ── CSV parsing ────────────────────────────────────────────────────────────
  const parseFile = (f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (f.name.endsWith(".csv")) parseCSV(e.target.result);
        else toast.error("Excel parsing is not supported yet. Please export as CSV.");
      } catch { toast.error("Error parsing file. Please check the format."); }
    };
    if (f.name.endsWith(".csv")) reader.readAsText(f);
    else reader.readAsArrayBuffer(f);
  };

  const parseCSV = (content) => {
    const lines = content.split("\n").filter((l) => l.trim());
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const rows = lines.slice(1)
      .map((line) => {
        const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        const row = {};
        headers.forEach((h, i) => { row[h] = vals[i] || ""; });
        return row;
      })
      .filter((r) => Object.values(r).some(Boolean));
    setImportData(rows);
    autoDetectMapping(headers);
    setStep(2);
  };

  const autoDetectMapping = (headers) => {
    const m = { date: "", category: "", amount: "", note: "" };
    headers.forEach((h) => {
      const l = h.toLowerCase();
      if (l.includes("date"))                                                  m.date = h;
      else if (l.includes("categor"))                                          m.category = h;
      else if (l.includes("amount") || l.includes("price") || l.includes("cost")) m.amount = h;
      else if (l.includes("note") || l.includes("description") || l.includes("memo")) m.note = h;
    });
    setMapping(m);
  };

  /** After CSV column mapping → resolve unique category names. */
  const buildCsvCategoryResolution = () => {
    const uniqueNames = [...new Set(
      importData.map((r) => (r[mapping.category] || "").trim()).filter(Boolean)
    )];
    const initialMap = {};
    uniqueNames.forEach((n) => { initialMap[n] = autoMatch(n, categoryTree); });
    setCsvUniqNames(uniqueNames);
    setCsvCatMap(initialMap);
    setStep(3);
  };

  // ── editable row helpers ───────────────────────────────────────────────────
  const updateRow = (id, field, value) => {
    setEditableRows((prev) => prev.map((r) => r._id === id ? { ...r, [field]: value } : r));
  };
  const deleteRow = (id) => setEditableRows((prev) => prev.filter((r) => r._id !== id));

  // ── import ─────────────────────────────────────────────────────────────────
  const handleImport = async () => {
    setLoading(true);
    try {
      let expenses = [];


      if (uploadType === "image") {
        const noDate = editableRows.filter((r) => !r.date);
        const noAmount = editableRows.filter((r) => !r.amount);
        if (noDate.length || noAmount.length) {
          toast.error(`${noDate.length + noAmount.length} row(s) are missing date or amount. Please review all expenses.`);
          setLoading(false);
          return;
        }
        expenses = editableRows.map((r) => ({
          date: toApiLocalDateTime(r.date),
          // If user picked a category → send ObjectId; otherwise fall back to AI string (backend auto-resolves)
          category: r.category
            ? (r.category.subcategoryId || r.category.parentId)
            : (r.aiCategory || "Miscellaneous"),
          amount: Number(r.amount),
          note: r.note,
        }));
      } else {
        // CSV: apply category name → id mapping to all rows
        expenses = importData
          .map((r) => {
            const catName = (r[mapping.category] || "").trim();
            const catVal  = csvCatMap[catName];
            const catId   = catVal ? (catVal.subcategoryId || catVal.parentId) : null;
            return {
              date:     toApiLocalDateTime(r[mapping.date] || ""),
              category: catId,
              amount:   Number(r[mapping.amount] || 0),
              note:     r[mapping.note] || "",
            };
          })
          .filter((e) => e.date && e.category && e.amount > 0);
      }

      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/expenses/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `jwt ${token}` },
        body: JSON.stringify({ expenses }),
      });
      const result = await res.json();
      if (res.ok) {
        setImportResults(result);
        setStep(5);
        if (onImportSuccess) onImportSuccess();
        if (result.importedCount > 0) setTimeout(handleClose, 2500);
      } else {
        throw new Error(result.message || "Import failed");
      }
    } catch (err) {
      toast.error("Import failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── derived ────────────────────────────────────────────────────────────────
  const csvHeaders = importData.length > 0 ? Object.keys(importData[0]) : [];
  const unmatchedRowCount  = editableRows.filter((r) => !r.category).length;
  const unmatchedCatCount  = Object.values(csvCatMap).filter((v) => !v).length;
  const allImageRowsValid  = editableRows.every((r) => r.category && r.amount && r.date);

  const stepTitle = {
    1: "Import Expenses",
    2: "Map Columns",
    3: uploadType === "image" ? "Review & Edit" : "Resolve Categories",
    4: "Confirm Import",
    5: "Import Complete",
  }[step] || "Import";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-100/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-300 dark:border-slate-700 w-full max-w-2xl flex flex-col max-h-[92vh]"
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-300 dark:border-slate-700 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{stepTitle}</h2>
            {step > 1 && step < 5 && (
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">Step {step} of 4</p>
            )}
          </div>
          <button onClick={handleClose} className="p-2 rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* step progress bar */}
        {step < 5 && (
          <div className="h-0.5 bg-slate-200 dark:bg-slate-700">
            <div className="h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${((step - 1) / 3) * 100}%` }} />
          </div>
        )}

        <div className="overflow-y-auto flex-1 px-6 py-6 space-y-5">

          {/* ── Step 1: Choose upload type ────────────────────────────── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Import from a spreadsheet or extract expenses from a wallet/bank screenshot using AI.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* CSV */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-left hover:border-blue-400/60 hover:bg-blue-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Upload CSV / Excel</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Import from a spreadsheet file (.csv, .xlsx)</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileSelect(e.target.files[0], "csv")}
                    accept=".csv,.xlsx,.xls"
                    className="hidden"
                  />
                </button>
                {/* Screenshot */}
                <button
                  type="button"
                  onClick={() => {
                    const inp = document.createElement("input");
                    inp.type = "file";
                    inp.accept = "image/*";
                    inp.onchange = (e) => handleFileSelect(e.target.files[0], "image");
                    inp.click();
                  }}
                  className="border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-left hover:border-emerald-400/60 hover:bg-emerald-500/10 transition-all group"
                >
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                    <Upload className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Scan Screenshot</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">AI extracts expenses from wallet or bank screenshots</p>
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-3 mt-6 py-4 rounded-2xl bg-blue-500/15 text-blue-400 text-sm font-medium">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing screenshot with AI…
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 2: CSV column mapping ────────────────────────────── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                Match your CSV columns to the expense fields. We auto-detected the best matches.
              </p>
              {importData.length > 10 && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">{importData.length} rows detected in file.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "date",     label: "Date",     req: true  },
                  { key: "category", label: "Category", req: true  },
                  { key: "amount",   label: "Amount",   req: true  },
                  { key: "note",     label: "Note",     req: false },
                ].map(({ key, label, req }) => (
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-2">
                      {label} {req && <span className="text-rose-400">*</span>}
                    </label>
                    <select
                      value={mapping[key]}
                      onChange={(e) => setMapping((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full border border-slate-600 bg-slate-200/50 dark:bg-slate-700/50 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    >
                      <option value="">Select column…</option>
                      {csvHeaders.map((h) => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Review & Edit ─────────────────────────────────── */}
          {step === 3 && uploadType === "image" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {/* summary banner */}
              <div className={`flex items-center gap-3 rounded-2xl border px-5 py-4 ${unmatchedRowCount > 0 ? "border-amber-500/30 bg-amber-500/10" : "border-emerald-500/30 bg-emerald-500/10"}`}>
                {unmatchedRowCount > 0
                  ? <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  : <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {editableRows.length} expense{editableRows.length !== 1 ? "s" : ""} extracted
                    {unmatchedRowCount > 0 && ` · ${unmatchedRowCount} need a category`}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Review each expense below. Click a row to expand and edit.
                  </p>
                </div>
              </div>

              {editableRows.map((row, i) => (
                <EditableRowCard
                  key={row._id}
                  row={row}
                  index={i}
                  onChange={updateRow}
                  onDelete={deleteRow}
                  categoryTree={categoryTree}
                  onAddCategory={handleAddCategory}
                />
              ))}

              {editableRows.length === 0 && (
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  <p className="font-semibold">All rows deleted.</p>
                  <button onClick={() => setStep(1)} className="mt-2 text-sm text-blue-400 hover:underline">Start over</button>
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && uploadType === "csv" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                We found <strong className="text-slate-900 dark:text-white">{csvUniqNames.length}</strong> unique category name{csvUniqNames.length !== 1 ? "s" : ""} in your CSV.
                Map each to a category in your hierarchy — this mapping is applied to all matching rows.
              </p>
              {unmatchedCatCount > 0 && (
                <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 mb-4 text-xs text-amber-400 font-semibold">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {unmatchedCatCount} name{unmatchedCatCount > 1 ? "s" : ""} still unresolved — rows without a category will be skipped on import.
                </div>
              )}
              <CsvCategoryResolver
                names={csvUniqNames}
                mappings={csvCatMap}
                onChange={(name, val) => setCsvCatMap((p) => ({ ...p, [name]: val }))}
                categoryTree={categoryTree}
                onAddCategory={handleAddCategory}
              />
            </motion.div>
          )}

          {/* ── Step 4: Confirm ──────────────────────────────────────── */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-blue-300 text-sm">Ready to import</p>
                    <ul className="mt-2 space-y-1 text-sm text-blue-400">
                      {uploadType === "image" ? (
                        <>
                          <li>• <strong>{editableRows.length}</strong> expense{editableRows.length !== 1 ? "s" : ""} ready to save</li>
                          {unmatchedRowCount > 0 && <li className="text-amber-400">• <strong>{unmatchedRowCount}</strong> without a category will be skipped</li>}
                        </>
                      ) : (
                        <>
                          <li>• <strong>{importData.length}</strong> rows in file</li>
                          <li>• <strong>{csvUniqNames.length - unmatchedCatCount}</strong> of {csvUniqNames.length} categories resolved</li>
                          {unmatchedCatCount > 0 && <li className="text-amber-400">• Rows with unresolved categories will be skipped</li>}
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 5: Complete ─────────────────────────────────────── */}
          {step === 5 && importResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
              {importResults.importedCount > 0 ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-5 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Import complete!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">Closing automatically…</p>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-left">
                    <p className="text-emerald-400 font-bold text-sm mb-1">
                      ✅ {importResults.importedCount} expense{importResults.importedCount !== 1 ? "s" : ""} saved
                    </p>
                    {importResults.errors?.length > 0 && (
                      <>
                        <p className="text-amber-400 text-xs font-semibold mt-3 mb-1">⚠️ Some rows had issues:</p>
                        <ul className="text-xs text-amber-400 space-y-1 max-h-28 overflow-y-auto">
                          {importResults.errors.map((e, i) => <li key={i}>• {e}</li>)}
                        </ul>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-5 bg-rose-500/20 rounded-2xl flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-rose-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">No expenses imported</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">Please check the issues below and try again.</p>
                  {importResults.errors?.length > 0 && (
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-left text-xs text-rose-400 space-y-1 max-h-40 overflow-y-auto">
                      {importResults.errors.map((e, i) => <p key={i}>• {e}</p>)}
                    </div>
                  )}
                  <button onClick={handleClose} className="mt-5 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700">
                    Close
                  </button>
                </>
              )}
            </motion.div>
          )}
        </div>

        {/* footer navigation */}
        {step < 5 && (
          <div className="flex items-center justify-between gap-3 px-6 py-5 border-t border-slate-300 dark:border-slate-700 flex-shrink-0">
            {step > 1 ? (
              <button
                onClick={() => setStep((p) => p - 1)}
                disabled={loading}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 border border-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:bg-slate-700 transition-all disabled:opacity-40"
              >
                Back
              </button>
            ) : <div />}

            {step === 1 && <div />}

            {step === 2 && (
              <button
                onClick={buildCsvCategoryResolution}
                disabled={!mapping.date || !mapping.amount || !mapping.category}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Continue
              </button>
            )}

            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                disabled={uploadType === "image" && editableRows.length === 0}
                className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {uploadType === "image" && unmatchedRowCount > 0
                  ? `Continue (${unmatchedRowCount} unresolved)`
                  : "Continue"}
              </button>
            )}

            {step === 4 && (
              <button
                onClick={handleImport}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</> : "Start Import"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
