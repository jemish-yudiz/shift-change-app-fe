
import { User, UserRole, TaskType, ShiftStatus, ShiftHistory } from '../types';

export const MOCK_USER: User = {
  _id: 'u123',
  name: 'John Miller',
  email: 'john.m@industry-pro.com',
  role: UserRole.WORKER,
  department: { _id: 'd1', name: 'Production Line A' },
  shift: { _id: 's1', name: 'Morning Shift', startTime: '06:00', endTime: '14:00' }
};

export const MOCK_PREVIOUS_SHIFT: ShiftHistory = {
  _id: 'sh_prev_1',
  worker: { _id: 'u456', name: 'Sarah Connor' },
  department: { _id: 'd1', name: 'Production Line A' },
  shift: { _id: 's3', name: 'Night Shift', startTime: '22:00', endTime: '06:00' },
  startTime: '2024-05-20T22:00:00Z',
  endTime: '2024-05-21T06:00:00Z',
  status: ShiftStatus.COMPLETED,
  handoverNotes: "Hydraulic pressure was slightly fluctuating on Machine 4. Keep an eye.",
  tasks: [
    {
      _id: 't_prev_1',
      type: TaskType.WARNING,
      title: 'Fluctuating Pressure',
      description: 'Machine 4 pressure varies between 40-45 PSI.',
      addedBy: { _id: 'u456', name: 'Sarah Connor' },
      addedAt: '2024-05-21T02:30:00Z',
      isCompleted: false,
      carriedForward: true
    },
    {
      _id: 't_prev_2',
      type: TaskType.INFO,
      title: 'Lubrication done',
      description: 'All conveyors lubricated at 04:00 AM.',
      addedBy: { _id: 'u456', name: 'Sarah Connor' },
      addedAt: '2024-05-21T04:15:00Z',
      isCompleted: true,
      carriedForward: false
    }
  ]
};
