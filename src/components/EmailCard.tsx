import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Paperclip,
  MoreHorizontal,
  Archive,
  Bell,
  BellOff,
  Check,
  Clock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Email } from '@/types';
import { useStore } from '@/store';
import { CategoryBadge, PriorityIndicator, AnalyzingOverlay } from './ui';
import { formatDistanceToNow } from 'date-fns';

interface EmailCardProps {
  email: Email;
  onClick: () => void;
  isSelected?: boolean;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, onClick, isSelected }) => {
  const {
    toggleRead,
    toggleStar,
    archiveEmail,
    setReminder,
    analyzeEmail,
    snoozeEmail,
  } = useStore();

  const handleAnalyze = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!email.aiAnalysis) {
      analyzeEmail(email.id);
    }
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRead(email.id);
  };

  const handleToggleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStar(email.id);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    archiveEmail(email.id);
  };

  const handleSnooze = (e: React.MouseEvent) => {
    e.stopPropagation();
    snoozeEmail(email.id, 1);
  };

  const handleSetReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setReminder(email.id, tomorrow.toISOString(), 'reply');
  };

  const hasActionItems = email.aiAnalysis?.actionItems && email.aiAnalysis.actionItems.length > 0;

  return (
    <motion.div
      layout
      className={`relative group cursor-pointer rounded-xl transition-all duration-200 ${
        isSelected
          ? 'bg-violet-500/10 ring-1 ring-violet-500/50'
          : email.category === 'urgent'
          ? 'bg-red-500/5 hover:bg-red-500/10'
          : 'bg-[#1E1E27] hover:bg-[#252530]'
      } ${!email.isRead ? 'border-l-2 border-l-violet-500' : ''}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.15 }}
    >
      <AnalyzingOverlay isAnalyzing={email.isAnalyzing || false} />

      <div className="p-4">
        {/* Top Row: Avatar + Sender + Time */}
        <div className="flex items-start gap-3 mb-2">
          {/* Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
              {email.from.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>
            {!email.isRead && (
              <motion.div
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-violet-500 rounded-full border-2 border-[#1E1E27]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              />
            )}
          </motion.div>

          {/* Sender + Time */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm truncate ${!email.isRead ? 'text-white font-semibold' : 'text-gray-300'}`}>
                {email.from.name}
              </span>
              <span className="text-xs text-gray-500 flex-shrink-0">
                {formatDistanceToNow(new Date(email.date), { addSuffix: false })}
              </span>
            </div>
            <p className="text-xs text-gray-500 truncate">{email.from.email}</p>
          </div>

          {/* Star */}
          <motion.button
            onClick={handleToggleStar}
            className={`p-1 rounded transition-colors ${
              email.isStarred
                ? 'text-yellow-400'
                : 'text-gray-600 hover:text-gray-400 opacity-0 group-hover:opacity-100'
            }`}
            whileTap={{ scale: 0.8 }}
          >
            <Star size={16} fill={email.isStarred ? 'currentColor' : 'none'} />
          </motion.button>
        </div>

        {/* Subject */}
        <h3 className={`text-sm mb-1 truncate ${!email.isRead ? 'font-semibold text-white' : 'text-gray-300'}`}>
          {email.subject}
        </h3>

        {/* Preview */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{email.preview}</p>

        {/* Bottom Row: Badges + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={email.category} />
            {email.aiAnalysis && (
              <span className="flex items-center gap-1 text-xs text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full">
                <Sparkles size={10} />
                AI
              </span>
            )}
            {hasActionItems && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                <Check size={10} />
                Action
              </span>
            )}
            {email.hasAttachment && (
              <span className="text-gray-500">
                <Paperclip size={12} />
              </span>
            )}
            {email.reminder?.isActive && (
              <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                <Clock size={10} />
                Reminder
              </span>
            )}
          </div>

          {/* Priority */}
          {email.aiAnalysis && (
            <PriorityIndicator priority={email.aiAnalysis.priority} size="sm" />
          )}
        </div>

        {/* Action Buttons - Visible on Hover */}
        <motion.div
          className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.button
            onClick={handleToggleRead}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title={email.isRead ? 'Mark as unread' : 'Mark as read'}
            whileTap={{ scale: 0.9 }}
          >
            {email.isRead ? <Bell size={14} /> : <BellOff size={14} />}
          </motion.button>
          <motion.button
            onClick={handleSnooze}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Snooze for 1 day"
            whileTap={{ scale: 0.9 }}
          >
            <Clock size={14} />
          </motion.button>
          <motion.button
            onClick={handleArchive}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Archive"
            whileTap={{ scale: 0.9 }}
          >
            <Archive size={14} />
          </motion.button>
          <motion.button
            onClick={handleSetReminder}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            title="Set reminder"
            whileTap={{ scale: 0.9 }}
          >
            <Bell size={14} />
          </motion.button>
          {!email.aiAnalysis && (
            <motion.button
              onClick={handleAnalyze}
              className="p-2 rounded-lg hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 transition-colors ml-auto"
              title="Analyze with AI"
              whileTap={{ scale: 0.9 }}
            >
              <Sparkles size={14} />
            </motion.button>
          )}
          <motion.button
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors ml-auto"
            title="View details"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={14} />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};
