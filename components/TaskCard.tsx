
import React from 'react';
import { Task, TaskType } from '../types';
import { Info, AlertTriangle, AlertOctagon, CheckCircle2, Circle } from 'lucide-react';
import { formatDateTo12Hour } from '../utils/timeFormat';

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  isReadOnly?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, isReadOnly }) => {
  const getColors = () => {
    switch (task.type) {
      case TaskType.CRUCIAL: return 'border-red-500 bg-red-50 text-red-700';
      case TaskType.WARNING: return 'border-orange-500 bg-orange-50 text-orange-700';
      default: return 'border-blue-500 bg-blue-50 text-blue-700';
    }
  };

  const getIcon = () => {
    switch (task.type) {
      case TaskType.CRUCIAL: return <AlertOctagon size={20} />;
      case TaskType.WARNING: return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className={`border-l-4 p-4 rounded-r-xl shadow-sm bg-white mb-3 flex items-start gap-4 transition-all ${task.isCompleted ? 'opacity-60 bg-slate-50 border-slate-300' : 'hover:shadow-md'}`}>
      <div className={`mt-1 p-2 rounded-lg ${getColors().split(' ')[1]} ${getColors().split(' ')[2]}`}>
        {getIcon()}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`font-bold ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>
            {task.title}
          </h4>
          {task.carriedForward && (
            <span className="text-[10px] uppercase font-black bg-slate-800 text-white px-2 py-0.5 rounded-full">
              Handover
            </span>
          )}
        </div>
        <p className={`text-sm ${task.isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
          {task.description}
        </p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 font-medium">
              Added by {task.addedBy?.name || "Deleted User"} • {formatDateTo12Hour(task.addedAt)}
            </span>
            {task.isCompleted && task.completedBy && task.carriedForward && (
              <span className="text-[10px] text-orange-600 font-medium">
                Completed by {task.completedBy?.name || "Deleted User"} • {task.completedAt && formatDateTo12Hour(task.completedAt)}
              </span>
            )}
            {task.isCompleted && task.completedBy && !task.carriedForward && (
              <span className="text-[10px] text-slate-500 font-medium">
                Completed by {task.completedBy?.name || "Deleted User"} • {task.completedAt && formatDateTo12Hour(task.completedAt)}
              </span>
            )}
          </div>
          {task.isCompleted && (
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Resolved
            </span>
          )}
        </div>
      </div>

      {!isReadOnly && !task.isCompleted && onComplete && (
        <button
          onClick={() => onComplete(task._id)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-all"
        >
          <Circle size={28} />
        </button>
      )}
    </div>
  );
};

export default TaskCard;
