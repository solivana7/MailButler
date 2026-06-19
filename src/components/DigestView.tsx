import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Sparkles,
  ArrowRight,
  Calendar,
  Mail,
  BarChart3,
} from 'lucide-react';
import { useStore } from '@/store';

export const DigestView: React.FC = () => {
  const { digest } = useStore();

  if (!digest) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0D0D12]">
        <div className="text-center">
          <FileText size={48} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-500">No digest available</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col h-full bg-[#0D0D12]">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800 bg-[#16161D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Weekly Digest</h1>
              <p className="text-sm text-gray-500">
                {new Date(digest.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                {new Date(digest.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          <motion.button
            className="px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View History
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div
          className="space-y-6 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-xl p-5 border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Mail size={16} className="text-gray-500" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">Total Emails</span>
              </div>
              <p className="text-2xl font-bold text-white">{digest.totalEmails}</p>
              <p className="text-xs text-gray-500 mt-1">{digest.analyzedEmails} AI analyzed</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-xl p-5 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-orange-400" />
                <span className="text-xs text-orange-400 uppercase tracking-wider">Urgent</span>
              </div>
              <p className="text-2xl font-bold text-orange-400">{digest.urgentReplies}</p>
              <p className="text-xs text-gray-500 mt-1">Needs your attention</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-xl p-5 border border-emerald-500/20">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 uppercase tracking-wider">Completed</span>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{digest.tasksCompleted}</p>
              <p className="text-xs text-gray-500 mt-1">of {digest.tasksCreated} tasks</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-xl p-5 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-blue-400" />
                <span className="text-xs text-blue-400 uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">{digest.pendingTasks}</p>
              <p className="text-xs text-gray-500 mt-1">Tasks remaining</p>
            </div>
          </motion.div>

          {/* Follow-ups Section */}
          {digest.followUps.length > 0 && (
            <motion.div variants={itemVariants} className="bg-[#1E1E27] rounded-xl p-5 border border-gray-800">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={18} className="text-pink-400" />
                Follow-ups Required
              </h2>
              <div className="space-y-3">
                {digest.followUps.map((followUp) => (
                  <motion.div
                    key={followUp.id}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white text-xs font-medium">
                        {followUp.sender.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{followUp.subject}</p>
                        <p className="text-xs text-gray-500">{followUp.sender}</p>
                      </div>
                    </div>
                    <span className="text-xs text-pink-400 bg-pink-500/20 px-2 py-1 rounded">
                      {followUp.daysAgo} days ago
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Top Senders */}
          <motion.div variants={itemVariants} className="bg-[#1E1E27] rounded-xl p-5 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users size={18} className="text-violet-400" />
              Top Senders
            </h2>
            <div className="space-y-3">
              {digest.topSenders.map((sender, index) => (
                <motion.div
                  key={sender.email}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <span className="text-sm font-medium text-gray-500 w-4">{index + 1}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {sender.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{sender.name}</p>
                    <p className="text-xs text-gray-500">{sender.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 size={14} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-300">{sender.count}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* AI Insights */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-xl p-5 border border-violet-500/20">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-violet-400" />
              AI Insights
            </h2>
            <div className="space-y-3">
              {digest.insights.map((insight, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-violet-500/5 rounded-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">{insight}</p>
                </motion.div>
              ))}
            </div>

            {/* Action Button */}
            <motion.button
              className="w-full mt-4 px-4 py-3 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              View Detailed Analytics <ArrowRight size={14} />
            </motion.button>
          </motion.div>

          {/* Task Progress */}
          <motion.div variants={itemVariants} className="bg-[#1E1E27] rounded-xl p-5 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Task Completion</h2>
            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(digest.tasksCompleted / digest.tasksCreated) * 100}%` }}
                transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">
                {digest.tasksCompleted} completed
              </span>
              <span className="text-xs text-gray-500">
                {digest.pendingTasks} remaining
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
