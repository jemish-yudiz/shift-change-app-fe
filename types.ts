
export enum UserRole {
  WORKER = 'worker',
  ADMIN = 'admin'
}

export enum TaskType {
  INFO = 'info',
  WARNING = 'warning',
  CRUCIAL = 'crucial'
}

export enum ShiftStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Department {
  _id: string;
  name: string;
}

export interface ShiftDefinition {
  _id: string;
  name: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department: Department;
  shift: ShiftDefinition;
}

export interface Task {
  _id: string;
  type: TaskType;
  title: string;
  description: string;
  addedBy: {
    _id: string;
    name: string;
  };
  addedAt: string;
  isCompleted: boolean;
  completedBy?: {
    _id: string;
    name: string;
  };
  completedAt?: string;
  carriedForward: boolean;
  carriedForwardFrom?: string;
}

export interface TaskSummary {
  total: number;
  carriedForward: number;
  ownTasks: number;
  completed: number;
  pending: number;
}

export interface PreviousShiftInfo {
  worker: {
    _id: string;
    name: string;
    email: string;
    employeeId?: string;
  };
  shiftId: string;
  startTime: string;
  endTime: string;
  handoverNotes?: string;
  incompleteTasks: Task[];
  incompleteTasksCount: number;
}

export interface ShiftHistory {
  _id: string;
  worker: Partial<User>;
  department: Department;
  shift: ShiftDefinition;
  startTime: string;
  endTime?: string;
  status: ShiftStatus;
  tasks: Task[];
  handoverNotes?: string;
  taskSummary?: TaskSummary;
}

export interface TaskInfo {
  isCarriedForward: boolean;
  wasFromPreviousWorker: boolean;
  completedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CompleteTaskResponse {
  success: boolean;
  message?: string;
  task: Task;
  taskInfo?: TaskInfo;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
