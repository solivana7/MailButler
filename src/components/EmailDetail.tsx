import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreHorizontal,
  Clock,
  Bell,
  Check,
  Plus,
  Sparkles,
  Calendar,
  Tag,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';
import { Email } from '@/types';
import { useStore } from '@/store';
import { CategoryBadge, PriorityIndicator } from './ui';
import { formatDistanceToNow, format } from 'date-fns';

interface EmailDetailProps {
  email: Email;
  onClose: () => void;
}

export const EmailDetail: React.FC<EmailDetailProps> = ({ email, onClose }) => {
  const {
    toggleStar,
    toggleRead,
    archiveEmail,
    setEmailCategory,
    setReminder,
    analyzeEmail,
    addTask,
    completeTask,
  } = useStore();

  const [showCategories, setShowCategories] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleAddTask = () => {
    const description = email.subject;
    addTask({
      emailId: email.id,
      description,
      priority: 'medium',
      status: 'pending',
    });
  };

  const handleAnalyze = () => {
    if (!email.aiAnalysis) {
      analyzeEmail(email.id);
    }
  };

  const categories = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
    { value: 'important', label: 'Important', color: 'bg-orange-500' },
    { value: 'follow-up', label: 'Follow-up', color: 'bg-pink-500' },
    { value: 'task', label: 'Task', color: 'bg-emerald-500' },
    { value: 'newsletter', label: 'Newsletter', color: 'bg-gray-500' },
    { value: 'archive', label: 'Archive', color: 'bg-gray-600' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-[#16161D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors md:hidden"
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={20} />
            </motion.button>
            <h2 className="text-sm font-medium text-gray-400 truncate max-w-[200px] md:max-w-none">
              {email.subject}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => toggleStar(email.id)}
              className={`p-2 rounded-lg transition-colors ${
                email.isStarred
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
              whileTap={{ scale: 0.9 }}
            >
              <Star size={18} fill={email.isStarred ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              onClick={() => archiveEmail(email.id)}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <Archive size={18} />
            </motion.button>
            <div className="relative">
              <motion.button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <MoreHorizontal size={18} />
              </motion.button>
              {showActions && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 bg-[#1E1E27] border border-gray-700 rounded-lg shadow-xl z-10 py-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                    <Reply size={14} /> Reply
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                    <Forward size={14} /> Forward
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2">
                    <Clock size={14} /> Snooze
                  </button>
                  <button className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2">
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Email Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-start gap-4">
            <motion.div
              className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold"
              whileHover={{ scale: 1.05 }}
            >
              {email.from.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-white">{email.from.name}</h3>
                  <p className="text-sm text-gray-500">{email.from.email}</p>
                </div>
                <span className="text-sm text-gray-500 flex-shrink-0">
                  {format(new Date(email.date), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">To: {email.to.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <motion.div
          className="mx-6 mt-6 p-4 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-xl border border-violet-500/20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-sm font-medium text-violet-300">AI Analysis</span>
            </div>
            {email.aiAnalysis ? (
              <PriorityIndicator priority={email.aiAnalysis.priority} size="md" />
            ) : (
              <motion.button
                onClick={handleAnalyze}
                className="px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Sparkles size={12} />
                Analyze Now
              </motion.button>
            )}
          </div>

          {email.aiAnalysis && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <p className="text-sm font-medium text-white">{email.aiAnalysis.priority}/10</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Urgency</p>
                <p className={`text-sm font-medium capitalize ${
                  email.aiAnalysis.urgency === 'critical' ? 'text-red-400' :
                  email.aiAnalysis.urgency === 'high' ? 'text-orange-400' :
                  email.aiAnalysis.urgency === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {email.aiAnalysis.urgency}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Sentiment</p>
                <p className="text-sm font-medium capitalize text-white">{email.aiAnalysis.sentiment}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Reply Expected</p>
                <p className={`text-sm font-medium capitalize ${
                  email.aiAnalysis.replyExpectation === 'required' ? 'text-emerald-400' :
                  email.aiAnalysis.replyExpectation === 'optional' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {email.aiAnalysis.replyExpectation}
                </p>
              </div>
            </div>
          )}

          {email.aiAnalysis && email.aiAnalysis.actionItems.length > 0 && (
            <div className="mt-4 pt-4 border-t border-violet-500/20">
              <p className="text-xs text-gray-500 mb-2">Detected Action Items:</p>
              <div className="flex flex-wrap gap-2">
                {email.aiAnalysis.actionItems.map((item, i) => (
                  <motion.span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Check size={10} /> {item}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Email Body */}
        <div className="p-6">
          <div className="prose prose-invert prose-sm max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {email.body}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 flex flex-wrap gap-3">
          <motion.button
            onClick={handleAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Add to Tasks
          </motion.button>
          <motion.button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setReminder(email.id, tomorrow.toISOString(), 'reply');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Bell size={16} /> Set Reminder
          </motion.button>
          <div className="relative">
            <motion.button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Tag size={16} /> Category
              <ChevronDown size={14} />
            </motion.button>
            {showCategories && (
              <motion.div
                className="absolute bottom-full left-0 mb-2 w-48 bg-[#1E1E27] border border-gray-700 rounded-lg shadow-xl z-10 py-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => {
                      setEmailCategory(email.id, cat.value as any);
                      setShowCategories(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-800 flex items-center gap-2 ${
                      email.category === cat.value ? 'text-white' : 'text-gray-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                    {cat.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Quick Reply */}
        <div className="px-6 pb-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Quick reply..."
              className="w-full bg-transparent text-white placeholder-gray-500 resize-none focus:outline-none text-sm"
              rows={3}
            />
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <MessageSquare size={16} />
                </button>
              </div>
              <motion.button
                className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Send
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
