"use client";

/**
 * @file ExpenseFilters.jsx
 * @description
 * Presentational component responsible for rendering and managing
 * expense filtering controls such as category selection and date range.
 *
 * This component is fully controlled by its parent via props and
 * does not maintain any internal state. All user interactions
 * propagate changes upward through setter functions.
 *
 * The component focuses purely on UI and interaction handling,
 * keeping logic outside for better separation of concerns.
 *
 * @author Divyanshu Dugar
 * @project FinCraft AI
 */

import { Calendar, ChevronDown, Filter, Tag, Check } from "lucide-react";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment, useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * ExpenseFilters Component
 *
 * @param {Object} props
 * @param {Array} props.categories - List of available expense categories
 * @param {string} props.selectedCategory - Currently selected category ID
 * @param {Function} props.setSelectedCategory - Setter for selected category
 * @param {Object} props.dateRange - Selected date range for filtering
 * @param {string} props.dateRange.startDate - Start date (YYYY-MM-DD)
 * @param {string} props.dateRange.endDate - End date (YYYY-MM-DD)
 * @param {Function} props.setDateRange - Setter for date range
 */
export default function ExpenseFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  dateRange,
  setDateRange,
}) {
  // For portal dropdown: track button position
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Pending date state — only committed to parent on "Apply"
  const [pendingStart, setPendingStart] = useState(dateRange.startDate);
  const [pendingEnd, setPendingEnd] = useState(dateRange.endDate);

  // Sync pending values when parent changes dateRange externally (e.g. month nav)
  useEffect(() => {
    setPendingStart(dateRange.startDate);
    setPendingEnd(dateRange.endDate);
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        left: rect.left + window.scrollX,
        top: rect.bottom + window.scrollY,
        width: rect.width,
      });
    }
  }, [dropdownOpen]);

  return (
    <div className="relative bg-slate-800/60 backdrop-blur-xl border border-cyan-400/20 shadow-sm rounded-2xl p-6 mb-10 transition-all duration-300 hover:shadow-md">
      {/* ============================================================
          Header Section - Displays title and reset action
         ============================================================ */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          <Filter className="inline-block w-5 h-5 mr-2 text-cyan-400" />
          Expense Filters
        </h2>

        {/* Resets category and date range filters to default values */}
        <button
          onClick={() => {
            setPendingStart("");
            setPendingEnd("");
            setDateRange({ startDate: "", endDate: "" });
            setSelectedCategory("all");
          }}
          className="text-sm text-slate-400 hover:text-blue-400 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      {/* ============================================================
          Filters Grid
          - Responsive layout for all filter controls
         ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ========================================================
            Category Filter
            - Allows filtering expenses by category
           ======================================================== */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-400 mb-2.5 flex items-center tracking-wide">
            <Tag className="w-4 h-4 mr-2 text-purple-400" />
            Category
          </label>

          <Listbox value={selectedCategory} onChange={setSelectedCategory}>
            {({ open }) => {
              useEffect(() => { setDropdownOpen(open); }, [open]);
              return (
                <div className="relative">
                  <Listbox.Button ref={buttonRef} className="w-full pl-4 pr-11 py-2.5 text-left text-slate-200 border border-slate-600 rounded-xl bg-slate-700/50 shadow-sm hover:border-purple-400/60 focus:ring-2 focus:ring-purple-400/40 focus:border-purple-400 outline-none transition-all duration-200 cursor-pointer flex items-center">
                    <span>
                      {selectedCategory === "all"
                        ? "All Categories"
                        : categories?.find((c) => c._id === selectedCategory)?.name || "Select Category"}
                    </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
                    </span>
                  </Listbox.Button>
                  {open && typeof window !== "undefined" && createPortal(
                    <div style={{ position: 'absolute', left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width, zIndex: 1000 }}>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="max-h-60 overflow-auto rounded-xl bg-slate-800 border border-slate-700 py-2 shadow-xl focus:outline-none text-base">
                          <Listbox.Option
                            key="all"
                            value="all"
                            className={({ active }) =>
                              `cursor-pointer select-none relative py-2.5 pl-10 pr-4 rounded-lg mx-1 ${
                                active ? "bg-purple-500/15 text-purple-300" : "text-slate-200"
                              }`
                            }
                          >
                            {({ selected }) => (
                              <>
                                <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>All Categories</span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-2 flex items-center text-purple-400">
                                    <Check className="w-4 h-4" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                          {categories?.map((category) => (
                            <Listbox.Option
                              key={category._id || category.name}
                              value={category._id}
                              className={({ active }) =>
                                `cursor-pointer select-none relative py-2.5 pl-10 pr-4 rounded-lg mx-1 ${
                                  active ? "bg-purple-500/15 text-purple-300" : "text-slate-200"
                                }`
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? "font-semibold" : "font-normal"}`}>{category.name}</span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-2 flex items-center text-purple-400">
                                      <Check className="w-4 h-4" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>,
                    document.body
                  )}
                </div>
              );
            }}
          </Listbox>
        </div>

        {/* ========================================================
            Start Date Filter
            - Filters expenses starting from selected date
           ======================================================== */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-400 mb-2.5 flex items-center tracking-wide">
            <Calendar className="w-4 h-4 mr-2 text-blue-400" />
            Start Date
          </label>

          <input
            type="date"
            value={pendingStart}
            onChange={(e) => setPendingStart(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 shadow-sm hover:border-blue-400/60 focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 [color-scheme:dark] outline-none transition-all duration-200"
          />
        </div>

        {/* ========================================================
            End Date Filter
            - Filters expenses up to selected date
           ======================================================== */}
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-400 mb-2.5 flex items-center tracking-wide">
            <Calendar className="w-4 h-4 mr-2 text-pink-400" />
            End Date
          </label>

          <input
            type="date"
            value={pendingEnd}
            onChange={(e) => setPendingEnd(e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 shadow-sm hover:border-pink-400/60 focus:ring-2 focus:ring-pink-400/40 focus:border-pink-400 [color-scheme:dark] outline-none transition-all duration-200"
          />
        </div>
      </div>

      {/* Apply date range button */}
      <div className="flex justify-end mt-5">
        <button
          onClick={() => setDateRange({ startDate: pendingStart, endDate: pendingEnd })}
          disabled={pendingStart === dateRange.startDate && pendingEnd === dateRange.endDate}
          className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply Date Range
        </button>
      </div>
    </div>
  );
}
