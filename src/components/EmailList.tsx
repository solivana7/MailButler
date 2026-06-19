import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, Sparkles, X } from 'lucide-react';
import { useStore } from '@/store';
import { EmailCard } from './EmailCard';
import { EmailDetail } from './EmailDetail';
import { TabButton, EmptyState } from './ui';
import { TabType, Email } from '@/types';

const tabs: { tab: TabType; label: string; icon: string }[] = [
  { tab: 'all', label: 'All', icon: '📥' },
  { tab: 'urgent', label: 'Urgent', icon: '🔥' },
  { tab: 'tasks', label: 'Tasks', icon: '✅' },
  { tab: 'follow-up', label: 'Follow-up', icon: '📌' },
  { tab: 'newsletters', label: 'Newsletters', icon: '📧' },
  { tab: 'archive', label: 'Archive', icon: '📦' },
];

export const EmailList: React.FC = () => {
  const { emails, activeTab, setActiveTab, selectedEmailId, selectEmail, searchQuery, setSearchQuery } = useStore();
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [showSearch, setShowSearch] = useState(false);

  // Filter emails based on active tab
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Filter by tab
    switch (activeTab) {
      case 'urgent':
        filtered = filtered.filter((e) => e.category === 'urgent');
        break;
      case 'tasks':
        filtered = filtered.filter((e) => e.aiAnalysis?.actionItems && e.aiAnalysis.actionItems.length > 0);
        break;
      case 'follow-up':
        filtered = filtered.filter((e) => e.category === 'follow-up');
        break;
      case 'newsletters':
        filtered = filtered.filter((e) => e.category === 'newsletter');
        break;
      case 'archive':
        filtered = filtered.filter((e) => e.category === 'archive');
        break;
      default:
        filtered = filtered.filter((e) => e.category !== 'archive');
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.subject.toLowerCase().includes(query) ||
          e.from.name.toLowerCase().includes(query) ||
          e.from.email.toLowerCase().includes(query) ||
          e.preview.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'priority') {
      filtered = [...filtered].sort((a, b) => (b.aiAnalysis?.priority || 0) - (a.aiAnalysis?.priority || 0));
    } else {
      filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    return filtered;
  }, [emails, activeTab, searchQuery, sortBy]);

  // Get counts for tabs
  const tabCounts = useMemo(() => ({
    all: emails.filter((e) => e.category !== 'archive').length,
    urgent: emails.filter((e) => e.category === 'urgent').length,
    tasks: emails.filter((e) => e.aiAnalysis?.actionItems && e.aiAnalysis.actionItems.length > 0).length,
    'follow-up': emails.filter((e) => e.category === 'follow-up').length,
    newsletters: emails.filter((e) => e.category === 'newsletter').length,
    archive: emails.filter((e) => e.category === 'archive').length,
  }), [emails]);

  const selectedEmail = useMemo(
    () => emails.find((e) => e.id === selectedEmailId),
    [emails, selectedEmailId]
  );

  const handleAnalyzeAll = () => {
    const unreadWithoutAnalysis = emails.filter((e) => !e.isRead && !e.aiAnalysis);
    // In real app, this would batch process
  };

  return (
    <div className="flex h-full">
      {/* Email List Panel */}
      <div className={`${selectedEmail ? 'hidden md:block md:w-1/2 lg:w-[45%]' : 'w-full'} flex flex-col h-full border-r border-gray-800`}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-800 bg-[#16161D]">
          {/* Search Bar */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((t) => (
              <TabButton
                key={t.tab}
                tab={t.tab}
                label={t.label}
                icon={t.icon}
                count={tabCounts[t.tab]}
                isActive={activeTab === t.tab}
                onClick={() => setActiveTab(t.tab)}
              />
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-gray-500">
              {filteredEmails.length} email{filteredEmails.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setSortBy(sortBy === 'date' ? 'priority' : 'date')}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                  sortBy === 'priority'
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <SortAsc size={12} />
                {sortBy === 'priority' ? 'By Priority' : 'By Date'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Email List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredEmails.length > 0 ? (
              filteredEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <EmailCard
                    email={email}
                    onClick={() => selectEmail(email.id)}
                    isSelected={selectedEmailId === email.id}
                  />
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon="📭"
                title="No emails found"
                description={searchQuery ? 'Try a different search term' : 'All caught up! No emails in this category.'}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Email Detail Panel */}
      <AnimatePresence>
        {selectedEmail && (
          <motion.div
            className="w-full lg:w-[55%] h-full flex flex-col bg-[#0D0D12]"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.2 }}
          >
            <EmailDetail
              email={selectedEmail}
              onClose={() => selectEmail(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
