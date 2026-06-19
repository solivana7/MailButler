import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Trash2,
  Filter,
  Plus,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store';
import { Task } from '@/types';
import { formatDistanceToNow, isToday, isTomorrow, isPast, format } from 'date-fns';

const priorityColors = {
  high: 'text-red-400 bg-red-500/20',
  medium: 'text-yellow-400 bg-yellow-500/20',
  low: 'text-gray-400 bg-gray-500/20',
};

const statusConfig = {
  pending: { icon: Circle, color: 'text-gray-500', bg: 'border-gray-700' },
  in_progress: { icon: Clock, color: 'text-blue-400', bg: 'border-blue-500' },
  completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'border-emerald-500' },
};

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const StatusIcon = statusConfig[task.status].icon;
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';

  const getDueDateLabel = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const dueDateLabel = getDueDateLabel();

  return (
    <motion.div
      layout
      className={`group relative p-4 rounded-xl transition-all ${
        task.status === 'completed'
          ? 'bg-gray-800/30 border border-gray-800'
          : 'bg-[#1E1E27] border border-gray-800 hover:border-gray-700'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      {/* Status Icon */}
      <motion.button
        onClick={onToggle}
        className={`absolute left-4 top-4 ${statusConfig[task.status].color} hover:scale-110 transition-transform`}
        whileTap={{ scale: 0.9 }}
      >
        <StatusIcon
          size={20}
          fill={task.status === 'completed' ? 'currentColor' : 'none'}
          strokeWidth={task.status === 'completed' ? 0 : 2}
        />
      </motion.button>

      {/* Content */}
      <div className="pl-10 pr-16">
        <p className={`text-sm font-medium ${
          task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'
        }`}>
          {task.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {dueDateLabel && (
            <span className={`flex items-center gap-1 text-xs ${
              isOverdue ? 'text-red-400' : 'text-gray-500'
            }`}>
              <Calendar size={10} />
              {dueDateLabel}
            </span>
          )}
          <span className="text-xs text-gray-600">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
          whileTap={{ scale: 0.9 }}
        >
          <Trash2 size={14} />
        </motion.button>
      </div>

      {/* Overdue Warning */}
      {isOverdue && (
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <AlertCircle size={12} className="text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

export const TaskPanel: React.FC = () => {
  const { tasks, completeTask, deleteTask } = useStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    if (filter === 'pending') {
      filtered = filtered.filter((t) => t.status !== 'completed');
    } else if (filter === 'completed') {
      filtered = filtered.filter((t) => t.status === 'completed');
    }
    return filtered.sort((a, b) => {
      // Completed at bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (b.status === 'completed' && a.status !== 'completed') return -1;
      // Then by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [tasks, filter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'completed').length,
  }), [tasks]);

  return (
    <div className="flex flex-col h-full bg-[#0D0D12]">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800 bg-[#16161D]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold text-white">Tasks</h1>
            <p className="text-sm text-gray-500 mt-1">
              {stats.pending} pending, {stats.completed} completed
            </p>
          </div>
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Add Task
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-lg font-semibold text-white">{stats.pending}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Completed</p>
            <p className="text-lg font-semibold text-emerald-400">{stats.completed}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Overdue</p>
            <p className={`text-lg font-semibold ${stats.overdue > 0 ? 'text-red-400' : 'text-white'}`}>
              {stats.overdue}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mt-4">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <motion.button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={() => completeTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))
          ) : (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <CheckCircle2 size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">
                {filter === 'all' ? 'No tasks yet' : `No ${filter} tasks`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Extract tasks from emails or create manually
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
