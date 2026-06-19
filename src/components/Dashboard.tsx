import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Inbox,
  Star,
  Archive,
  Users,
  BarChart3,
} from 'lucide-react';
import { useStore } from '@/store';
import { CategoryBadge } from './ui';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Dashboard: React.FC = () => {
  const { emails, accounts, tasks, digest, setActiveSection, setActiveTab, selectEmail } = useStore();

  const stats = useMemo(() => {
    const enabledAccounts = accounts.filter((a) => a.isEnabled);
    return {
      totalEmails: emails.length,
      unreadEmails: emails.filter((e) => !e.isRead).length,
      urgentEmails: emails.filter((e) => e.category === 'urgent').length,
      pendingTasks: tasks.filter((t) => t.status === 'pending').length,
      completedTasks: tasks.filter((t) => t.status === 'completed').length,
      totalUnread: enabledAccounts.reduce((sum, a) => sum + a.unreadCount, 0),
    };
  }, [emails, accounts, tasks]);

  const recentUrgentEmails = emails
    .filter((e) => e.category === 'urgent' && !e.isRead)
    .slice(0, 3);

  const pendingTasksWithDue = tasks
    .filter((t) => t.status === 'pending')
    .slice(0, 3);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      urgent: 0,
      important: 0,
      'follow-up': 0,
      task: 0,
      newsletter: 0,
      archive: 0,
    };
    emails.forEach((e) => {
      counts[e.category] = (counts[e.category] || 0) + 1;
    });
    return counts;
  }, [emails]);

  return (
    <div className="flex flex-col h-full bg-[#0D0D12] overflow-y-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-6 md:p-8 border-b border-gray-800 bg-[#16161D]/50">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, Alex
            </h1>
            <p className="text-gray-400 mt-1">
              Here's your email overview for today
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              <span className="text-sm text-gray-400">AI Active</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg"
              whileHover={{ scale: 1.02 }}
            >
              <Inbox size={16} className="text-gray-400" />
              <span className="text-sm text-gray-400">{stats.totalUnread} unread</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        className="flex-1 p-6 md:p-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              className="bg-gradient-to-br from-violet-500/20 to-violet-500/5 rounded-2xl p-5 border border-violet-500/20"
              whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.4)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Mail size={20} className="text-violet-400" />
                </div>
                <Sparkles size={16} className="text-violet-400" />
              </div>
              <p className="text-3xl font-bold text-white">{stats.totalEmails}</p>
              <p className="text-sm text-gray-400 mt-1">Total Emails</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-2xl p-5 border border-orange-500/20"
              whileHover={{ scale: 1.02, borderColor: 'rgba(249, 115, 22, 0.4)' }}
              onClick={() => setActiveTab('urgent')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-orange-400" />
                </div>
                <ArrowRight size={16} className="text-orange-400" />
              </div>
              <p className="text-3xl font-bold text-orange-400">{stats.urgentEmails}</p>
              <p className="text-sm text-gray-400 mt-1">Urgent</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 rounded-2xl p-5 border border-emerald-500/20"
              whileHover={{ scale: 1.02, borderColor: 'rgba(16, 185, 129, 0.4)' }}
              onClick={() => setActiveSection('tasks')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <ArrowRight size={16} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-emerald-400">{stats.pendingTasks}</p>
              <p className="text-sm text-gray-400 mt-1">Pending Tasks</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 rounded-2xl p-5 border border-blue-500/20"
              whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.4)' }}
              onClick={() => setActiveSection('tasks')}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp size={20} className="text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-400">{stats.completedTasks}</p>
              <p className="text-sm text-gray-400 mt-1">Completed</p>
            </motion.div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Urgent Emails */}
            <motion.div variants={itemVariants} className="bg-[#16161D] rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-5 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-400" />
                    Needs Attention
                  </h2>
                  <motion.button
                    onClick={() => setActiveTab('urgent')}
                    className="text-sm text-violet-400 hover:text-violet-300"
                    whileHover={{ x: 2 }}
                  >
                    View all
                  </motion.button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {recentUrgentEmails.length > 0 ? (
                  recentUrgentEmails.map((email) => (
                    <motion.div
                      key={email.id}
                      className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
                      whileHover={{ x: 4 }}
                      onClick={() => selectEmail(email.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                          {email.from.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{email.subject}</p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">{email.from.name}</p>
                        </div>
                        <CategoryBadge category={email.category} size="sm" showIcon={false} />
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500/50 mb-2" />
                    <p className="text-sm text-gray-500">All caught up!</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pending Tasks */}
            <motion.div variants={itemVariants} className="bg-[#16161D] rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-5 border-b border-gray-800">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock size={18} className="text-blue-400" />
                    Pending Tasks
                  </h2>
                  <motion.button
                    onClick={() => setActiveSection('tasks')}
                    className="text-sm text-violet-400 hover:text-violet-300"
                    whileHover={{ x: 2 }}
                  >
                    View all
                  </motion.button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {pendingTasksWithDue.length > 0 ? (
                  pendingTasksWithDue.map((task) => (
                    <motion.div
                      key={task.id}
                      className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          task.priority === 'high' ? 'border-red-500' :
                          task.priority === 'medium' ? 'border-yellow-500' : 'border-gray-600'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{task.description}</p>
                          {task.dueDate && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 size={32} className="mx-auto text-emerald-500/50 mb-2" />
                    <p className="text-sm text-gray-500">No pending tasks</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          <motion.div variants={itemVariants} className="bg-[#16161D] rounded-2xl border border-gray-800 p-5">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-violet-400" />
              Email Breakdown
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(categoryCounts).map(([category, count]) => (
                <motion.div
                  key={category}
                  className="bg-gray-800/50 rounded-xl p-4 text-center hover:bg-gray-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => {
                    setActiveTab(category as any);
                    setActiveSection('tabs');
                  }}
                >
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <CategoryBadge category={category as any} size="sm" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Digest Preview */}
          {digest && (
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-2xl border border-violet-500/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Weekly Digest</h2>
                    <p className="text-sm text-gray-400">
                      {new Date(digest.weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                      {new Date(digest.weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <motion.button
                  onClick={() => setActiveSection('digest')}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Digest <ArrowRight size={14} />
                </motion.button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-violet-500/10 rounded-xl p-4">
                  <p className="text-2xl font-bold text-violet-400">{digest.totalEmails}</p>
                  <p className="text-xs text-gray-400">Total Emails</p>
                </div>
                <div className="bg-orange-500/10 rounded-xl p-4">
                  <p className="text-2xl font-bold text-orange-400">{digest.urgentReplies}</p>
                  <p className="text-xs text-gray-400">Urgent Replies</p>
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-4">
                  <p className="text-2xl font-bold text-emerald-400">{digest.tasksCompleted}</p>
                  <p className="text-xs text-gray-400">Tasks Done</p>
                </div>
                <div className="bg-blue-500/10 rounded-xl p-4">
                  <p className="text-2xl font-bold text-blue-400">{digest.pendingTasks}</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Senders */}
          {digest && (
            <motion.div variants={itemVariants} className="bg-[#16161D] rounded-2xl border border-gray-800 p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users size={18} className="text-violet-400" />
                Top Senders This Week
              </h2>
              <div className="space-y-3">
                {digest.topSenders.slice(0, 5).map((sender, index) => (
                  <motion.div
                    key={sender.email}
                    className="flex items-center gap-4 p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
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
                    <span className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300">
                      {sender.count} emails
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
