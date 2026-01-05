import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ShiftHistory, ShiftStatus } from "../types";
import {
  Calendar,
  User,
  Clipboard,
  CheckCircle,
  Filter,
  X,
} from "lucide-react";
import { formatDateTo12Hour } from "../utils/timeFormat";

const History: React.FC = () => {
  const [history, setHistory] = useState<ShiftHistory[]>([]);
  const [department, setDepartment] = useState<string>("");
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<{
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }>({
    limit: 50,
  });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getDepartmentHistory(filters);
      setHistory(data.shiftHistories || []);
      setDepartment(data.department || "");
      setCount(data.count || 0);
    } catch (err) {
      console.error("Failed to load department history", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (
    key: keyof typeof filters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleApplyFilters = () => {
    loadHistory();
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilters({ limit: 50 });
    setShowFilters(false);
  };

  const hasActiveFilters = () => {
    return !!(
      filters.status ||
      filters.startDate ||
      filters.endDate ||
      (filters.limit && filters.limit !== 50)
    );
  };

  if (loading)
    return <div className="p-8 text-center">Fetching records...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Department History
          </h1>
          <p className="text-slate-500">
            {department
              ? `Audit logs for ${department} department`
              : "Audit logs for your department"}
            {count > 0 && ` • ${count} shift${count !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
            hasActiveFilters()
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          <Filter size={18} />
          Filters
          {hasActiveFilters() && (
            <span className="bg-white text-indigo-600 text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </button>
      </header>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-slate-900">
              Filter Options
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Status
              </label>
              <select
                value={filters.status || ""}
                onChange={(e) =>
                  handleFilterChange("status", e.target.value || undefined)
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">All Statuses</option>
                <option value={ShiftStatus.ACTIVE}>Active</option>
                <option value={ShiftStatus.COMPLETED}>Completed</option>
                <option value={ShiftStatus.CANCELLED}>Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value || undefined)
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  handleFilterChange("endDate", e.target.value || undefined)
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">
                Limit
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={filters.limit || 50}
                onChange={(e) =>
                  handleFilterChange(
                    "limit",
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleApplyFilters}
              className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-400" />
          <p className="text-slate-400">
            {hasActiveFilters()
              ? "No shifts found matching your filters."
              : "No shift history available."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((sh) => (
            <div
              key={sh._id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all"
            >
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900">
                      {new Date(sh.startTime).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <User size={12} /> {sh.worker?.name || "Deleted User"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clipboard size={12} />{" "}
                        {sh.shift?.name || "Unknown Shift"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-bold text-slate-800">
                      {sh.endTime
                        ? `${formatDateTo12Hour(
                            sh.startTime
                          )} - ${formatDateTo12Hour(sh.endTime)}`
                        : "Ongoing"}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                      {sh.status}
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold">
                    <CheckCircle size={14} />{" "}
                    {sh.tasks.filter((t) => t.isCompleted).length} /{" "}
                    {sh.tasks.length} Completed
                  </div>
                </div>
              </div>

              {sh.handoverNotes && (
                <div className="px-5 pb-5 pt-0">
                  <div className="bg-slate-50 p-4 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                      Handover Notes
                    </span>
                    <p className="text-sm text-slate-600 italic">
                      "{sh.handoverNotes}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
