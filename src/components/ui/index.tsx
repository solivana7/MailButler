import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, TabType } from '@/types';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

const categoryConfig: Record<Category, { color: string; bg: string; icon: string; label: string }> = {
  urgent: { color: 'text-red-400', bg: 'bg-red-500/20', icon: '🔥', label: 'Urgent' },
  important: { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '⭐', label: 'Important' },
  'follow-up': { color: 'text-pink-400', bg: 'bg-pink-500/20', icon: '📌', label: 'Follow-up' },
  task: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '✅', label: 'Task' },
  newsletter: { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '📧', label: 'Newsletter' },
  archive: { color: 'text-gray-500', bg: 'bg-gray-600/20', icon: '📦', label: 'Archive' },
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'sm', showIcon = true }) => {
  const safeCategory = category && categoryConfig[category] ? category : 'archive';
  const config = categoryConfig[safeCategory];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <motion.span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bg} ${config.color} ${sizeClasses}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </motion.span>
  );
};

interface PriorityIndicatorProps {
  priority: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ priority, size = 'sm' }) => {
  const getColor = (p: number) => {
    if (p >= 8) return 'bg-red-500';
    if (p >= 6) return 'bg-orange-500';
    if (p >= 4) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const sizeConfig = {
    sm: { width: 24, height: 6, segments: 3 },
    md: { width: 36, height: 8, segments: 5 },
    lg: { width: 48, height: 10, segments: 7 },
  };

  const config = sizeConfig[size];
  const filledSegments = Math.ceil((priority / 10) * config.segments);

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: config.segments }).map((_, i) => (
        <motion.div
          key={i}
          className={`h-full rounded-sm transition-colors ${
            i < filledSegments ? getColor(priority) : 'bg-gray-700'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          style={{ width: config.width / config.segments - 2, height: config.height }}
        />
      ))}
    </div>
  );
};

interface TabButtonProps {
  tab: TabType;
  label: string;
  count?: number;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabButton: React.FC<TabButtonProps> = ({
  tab,
  label,
  count,
  icon,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {count !== undefined && count > 0 && (
        <motion.span
          className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
            isActive ? 'bg-violet-500/30' : 'bg-gray-700'
          }`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {count}
        </motion.span>
      )}
    </motion.button>
  );
};

interface StatusDotProps {
  status: 'connected' | 'syncing' | 'error' | 'disabled';
}

export const StatusDot: React.FC<StatusDotProps> = ({ status }) => {
  const config = {
    connected: { color: 'bg-emerald-500', pulse: false },
    syncing: { color: 'bg-yellow-500', pulse: true },
    error: { color: 'bg-red-500', pulse: false },
    disabled: { color: 'bg-gray-500', pulse: false },
  };

  const { color, pulse } = config[status];

  return (
    <span className="relative flex h-2.5 w-2.5">
      {pulse && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-75 animate-ping`} />
      )}
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
    </span>
  );
};

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-medium text-gray-200 mb-2">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{description}</p>
      {action && (
        <motion.button
          onClick={action.onClick}
          className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

interface AnalyzingOverlayProps {
  isAnalyzing: boolean;
}

export const AnalyzingOverlay: React.FC<AnalyzingOverlayProps> = ({ isAnalyzing }) => {
  return (
    <AnimatePresence>
      {isAnalyzing && (
        <motion.div
          className="absolute inset-0 bg-violet-500/10 rounded-lg flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 rounded-full"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
          >
            <motion.span
              className="text-violet-400 text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              AI Analyzing...
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeConfig = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <motion.div
      className={`${sizeConfig[size]} border-2 border-violet-500/30 border-t-violet-500 rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );
};
