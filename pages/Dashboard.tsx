import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import { ShiftHistory, User, PreviousShiftInfo } from "../types";
import {
  PlayCircle,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  User as UserIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatTime12Hour, formatDateTo12Hour } from "../utils/timeFormat";

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeShift, setActiveShift] = useState<ShiftHistory | null>(null);
  const [previousShiftInfo, setPreviousShiftInfo] = useState<PreviousShiftInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadShiftData();
  }, []);

  const loadShiftData = async () => {
    try {
      const res = await api.getActiveShift();
      setActiveShift(res.activeShift);
      setPreviousShiftInfo(res.previousShiftInfo || null);
    } catch (err) {
      console.error("Failed to load shift data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    setLoading(true);
    try {
      await api.startShift();
      await loadShiftData();
      navigate("/shift");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to start shift");
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-slate-500">
        Connecting to system...
      </div>
    );

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Worker Station</h1>
        <p className="text-slate-500">Welcome back, {user.name}</p>
      </header>

      {/* Primary Status Card */}
      <div
        className={`p-6 rounded-3xl shadow-xl overflow-hidden relative ${
          activeShift
            ? "bg-indigo-600 text-white"
            : "bg-white border border-slate-200"
        }`}
      >
        {!activeShift && (
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Clock size={160} />
          </div>
        )}

        <div className="relative z-10">
          <h2 className="text-lg font-bold mb-1">
            {activeShift ? "Shift Active" : "Off Duty"}
          </h2>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full text-sm font-medium">
              <MapPin size={16} /> {user.department.name}
            </div>
            <div className="flex items-center gap-2 bg-black/10 px-3 py-1.5 rounded-full text-sm font-medium">
              <Clock size={16} /> {user.shift.name} (
              {formatTime12Hour(user.shift.startTime)} -{" "}
              {formatTime12Hour(user.shift.endTime)})
            </div>
          </div>

          {!activeShift ? (
            <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <p className="text-slate-600 text-sm">
                  You are currently off-duty. Starting your shift will
                  automatically carry forward critical tasks from the previous
                  worker.
                </p>
              </div>
              <button
                onClick={handleStartShift}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl transition-all"
              >
                <PlayCircle size={24} />
                Begin Work Shift
              </button>
            </div>
          ) : (
            <div className="mt-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-black">
                  Active Since {formatDateTo12Hour(activeShift.startTime)}
                </div>
              </div>
              <button
                onClick={() => navigate("/shift")}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                View Shift Tasks <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Previous Shift Info */}
      {previousShiftInfo && previousShiftInfo.incompleteTasksCount > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <UserIcon size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Incomplete Tasks from Previous Shift
              </h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Previous Worker:</span>
                  <span>{previousShiftInfo.worker?.name || "Deleted User"}</span>
                  {previousShiftInfo.worker?.employeeId && (
                    <span className="text-slate-500">({previousShiftInfo.worker.employeeId})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-500" />
                  <span>
                    {formatDateTo12Hour(previousShiftInfo.startTime)} - {formatDateTo12Hour(previousShiftInfo.endTime)}
                  </span>
                </div>
                {previousShiftInfo.handoverNotes && (
                  <div className="mt-3 p-3 bg-white/60 rounded-xl border border-orange-200">
                    <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Handover Notes</span>
                    <p className="text-slate-700 italic">"{previousShiftInfo.handoverNotes}"</p>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-orange-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
              {previousShiftInfo.incompleteTasksCount} Pending
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <CheckCircle size={24} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {activeShift?.taskSummary?.completed || activeShift?.tasks.filter((t) => t.isCompleted).length || 0}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Resolved Tasks
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {activeShift?.taskSummary?.pending || activeShift?.tasks.filter((t) => !t.isCompleted).length || 0}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Issues
            </div>
          </div>
        </div>

        {activeShift?.taskSummary && (
          <>
            <div className="bg-orange-50 p-6 rounded-3xl border border-orange-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
                  <ArrowRight size={24} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-orange-700">
                  {activeShift.taskSummary.carriedForward}
                </div>
                <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                  From Previous
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <Info size={24} />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black text-blue-700">
                  {activeShift.taskSummary.ownTasks}
                </div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Your Tasks
                </div>
              </div>
            </div>
          </>
        )}

        {!activeShift?.taskSummary && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Info size={24} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900">
                {activeShift?.tasks.length || 0}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Shift Tasks
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
