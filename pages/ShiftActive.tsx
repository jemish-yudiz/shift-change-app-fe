
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShiftHistory, Task, TaskType, PreviousShiftInfo } from '../types';
import TaskCard from '../components/TaskCard';
// Added ClipboardList to the imports from lucide-react
import { Plus, Check, Save, Loader2, Info, AlertTriangle, AlertOctagon, X, Send, ClipboardList, User, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDateTo12Hour } from '../utils/timeFormat';

const ShiftActive: React.FC = () => {
  const [activeShift, setActiveShift] = useState<ShiftHistory | null>(null);
  const [previousShiftInfo, setPreviousShiftInfo] = useState<PreviousShiftInfo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ title: '', description: '', type: TaskType.INFO });
  const [handoverNotes, setHandoverNotes] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadActiveShift();
  }, []);

  const loadActiveShift = async () => {
    const res = await api.getActiveShift();
    if (res.hasActiveShift) {
      setActiveShift(res.activeShift);
      setPreviousShiftInfo(res.previousShiftInfo || null);
    }
    setLoading(false);
  };

  const handleAddTask = async () => {
    if (!newTask.title) return;
    setLoading(true);
    await api.addTask(newTask.type, newTask.title, newTask.description);
    setNewTask({ title: '', description: '', type: TaskType.INFO });
    setShowAddModal(false);
    await loadActiveShift();
  };

  const handleCompleteTask = async (id: string) => {
    try {
      const response = await api.completeTask(id);
      
      // Show notification if task was from previous worker
      if (response.taskInfo?.wasFromPreviousWorker) {
        setNotification({
          message: response.message || `Task from ${response.task.addedBy?.name || "previous worker"} completed successfully!`,
          type: 'success'
        });
        // Auto-hide notification after 4 seconds
        setTimeout(() => setNotification(null), 4000);
      } else if (response.message) {
        setNotification({
          message: response.message,
          type: 'success'
        });
        setTimeout(() => setNotification(null), 3000);
      }
      
      await loadActiveShift();
    } catch (error) {
      console.error('Failed to complete task', error);
      setNotification({
        message: 'Failed to complete task. Please try again.',
        type: 'info'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleEndShift = async () => {
    setLoading(true);
    await api.endShift(handoverNotes);
    navigate('/');
  };

  if (loading && !activeShift) return <div className="p-8 text-center">Loading task board...</div>;

  if (!activeShift) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4">No Active Shift</h2>
        <button onClick={() => navigate('/')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl">Go back to Start Shift</button>
      </div>
    );
  }

  // Separate tasks: carried forward (from previous worker) and own tasks
  const tasks = activeShift.tasks || [];
  const allCarriedForwardTasks = tasks.filter(t => t.carriedForward);
  const incompleteCarriedForwardTasks = allCarriedForwardTasks.filter(t => !t.isCompleted);
  const ownTasks = tasks.filter(t => !t.carriedForward);
  const taskSummary = activeShift.taskSummary;

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[200] p-4 rounded-2xl shadow-2xl transition-all duration-300 transform ${
          notification.type === 'success' 
            ? 'bg-emerald-600 text-white' 
            : 'bg-blue-600 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} />
            <p className="font-bold">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Task Control</h1>
          <p className="text-slate-500">
            {taskSummary ? (
              <>
                {taskSummary.total || 0} total tasks
                {taskSummary.carriedForward !== undefined && ` • ${taskSummary.carriedForward} from previous shift`}
                {taskSummary.pending !== undefined && ` • ${taskSummary.pending} pending`}
              </>
            ) : (
              <>Managing {tasks.length} tasks in current shift</>
            )}
          </p>
        </div>
        <div className="flex gap-2">
           <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all"
          >
            <Plus size={20} /> Add Log
          </button>
          <button
            onClick={() => setShowEndModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all"
          >
            <Check size={20} /> End Shift
          </button>
        </div>
      </div>

      {/* Previous Shift Info Banner */}
      {previousShiftInfo && previousShiftInfo.incompleteTasksCount > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-3xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-2xl">
              <User size={24} className="text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900 mb-2">
                Tasks from Previous Shift
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
              {previousShiftInfo.incompleteTasksCount} Incomplete
            </div>
          </div>
        </div>
      )}

      {/* Task Summary Cards */}
      {(taskSummary || previousShiftInfo) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-2xl font-black text-slate-900">
              {taskSummary?.total !== undefined ? taskSummary.total : tasks.length}
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-200 shadow-sm">
            <div className="text-2xl font-black text-orange-700">
              {taskSummary?.carriedForward !== undefined 
                ? taskSummary.carriedForward 
                : allCarriedForwardTasks.length}
            </div>
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wider">From Previous</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-sm">
            <div className="text-2xl font-black text-blue-700">
              {taskSummary?.ownTasks !== undefined 
                ? taskSummary.ownTasks 
                : ownTasks.length}
            </div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Your Tasks</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 shadow-sm">
            <div className="text-2xl font-black text-emerald-700">
              {taskSummary?.completed !== undefined 
                ? taskSummary.completed 
                : tasks.filter(t => t.isCompleted).length}
            </div>
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</div>
          </div>
        </div>
      )}

      {/* Carried Forward Tasks Section */}
      {allCarriedForwardTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight size={18} className="text-orange-600" />
            <h2 className="text-lg font-black text-slate-900">
              Tasks from Previous Worker ({allCarriedForwardTasks.length})
              {incompleteCarriedForwardTasks.length > 0 && (
                <span className="ml-2 text-sm font-normal text-orange-600">
                  ({incompleteCarriedForwardTasks.length} pending)
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-2 mb-6">
            {/* Show incomplete carried forward tasks first */}
            {incompleteCarriedForwardTasks.map(task => (
              <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
            ))}
            {/* Then show completed carried forward tasks */}
            {allCarriedForwardTasks
              .filter(t => t.isCompleted)
              .map(task => (
                <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
              ))}
          </div>
        </div>
      )}

      {/* Own Tasks Section */}
      <div>
        {allCarriedForwardTasks.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Plus size={18} className="text-blue-600" />
            <h2 className="text-lg font-black text-slate-900">
              Your Tasks ({ownTasks.length})
            </h2>
          </div>
        )}
        <div className="space-y-2">
          {ownTasks.length === 0 && allCarriedForwardTasks.length === 0 ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-3xl">
              <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No tasks logged yet for this shift.</p>
            </div>
          ) : ownTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white border border-dashed border-slate-200 rounded-3xl">
              <p>No tasks added by you yet.</p>
            </div>
          ) : (
            [...ownTasks].reverse().map(task => (
              <TaskCard key={task._id} task={task} onComplete={handleCompleteTask} />
            ))
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Add Log Entry</h3>
              <button onClick={() => setShowAddModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-2">
                {[
                  { id: TaskType.INFO, icon: Info, label: 'Info', color: 'text-blue-600', bg: 'bg-blue-50' },
                  { id: TaskType.WARNING, icon: AlertTriangle, label: 'Warning', color: 'text-orange-600', bg: 'bg-orange-50' },
                  { id: TaskType.CRUCIAL, icon: AlertOctagon, label: 'Crucial', color: 'text-red-600', bg: 'bg-red-50' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setNewTask({ ...newTask, type: t.id })}
                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                      newTask.type === t.id ? `border-slate-900 ${t.bg} ${t.color}` : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <t.icon size={20} />
                    <span className="text-xs font-black uppercase tracking-tighter">{t.label}</span>
                  </button>
                ))}
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g., Boiler Temperature High"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Notes / Description</label>
                <textarea
                  placeholder="Detail the situation..."
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 px-4 font-bold text-slate-600 rounded-xl hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                disabled={!newTask.title}
                className="flex-[2] py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg disabled:opacity-50"
              >
                Submit Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* End Shift Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-emerald-50 border-b border-emerald-100">
              <h3 className="text-xl font-black text-emerald-900">Finalizing Shift</h3>
              <p className="text-emerald-700 text-sm">Provide handover notes for the next worker.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-orange-800 text-sm flex gap-3">
                <AlertTriangle className="shrink-0" />
                <div>
                  <span className="font-bold">Notice:</span> {activeShift.tasks.filter(t => !t.isCompleted).length} tasks are still pending. These will be automatically carried forward to the next shift.
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Handover Instructions</label>
                <textarea
                  placeholder="What does the next worker need to know? (e.g., machine status, supply levels)"
                  rows={4}
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 py-3 px-4 font-bold text-slate-600 rounded-xl hover:bg-slate-100"
              >
                Go Back
              </button>
              <button
                onClick={handleEndShift}
                className="flex-[2] py-3 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg flex items-center justify-center gap-2"
              >
                <Send size={18} /> Confirm Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftActive;
