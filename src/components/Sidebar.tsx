import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  Clock,
  FileText,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useStore } from '@/store';
import { StatusDot } from './ui';
import { SidebarSection } from '@/types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  section: SidebarSection;
  badge?: number;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  section,
  badge,
  isActive,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
        isActive
          ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border border-transparent'
      }`}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <span className={`${isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <motion.span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            section === 'tasks'
              ? 'bg-orange-500/20 text-orange-400'
              : isActive
              ? 'bg-violet-500/30'
              : 'bg-gray-700 text-gray-400'
          }`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {badge > 99 ? '99+' : badge}
        </motion.span>
      )}
    </motion.button>
  );
};

export const Sidebar: React.FC = () => {
  const {
    accounts,
    emails,
    tasks,
    activeSection,
    setActiveSection,
    sidebarOpen,
    toggleSidebar,
  } = useStore();

  const enabledAccounts = accounts.filter((a) => a.isEnabled);
  const totalUnread = enabledAccounts.reduce((sum, a) => sum + a.unreadCount, 0);
  const urgentCount = emails.filter((e) => e.category === 'urgent' && !e.isRead).length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const reminderCount = emails.filter((e) => e.reminder?.isActive).length;

  const mainNavItems = [
    { section: 'dashboard' as SidebarSection, icon: <LayoutDashboard size={18} />, label: 'Dashboard', badge: undefined },
    { section: 'tabs' as SidebarSection, icon: <Inbox size={18} />, label: 'All Emails', badge: totalUnread },
    { section: 'tasks' as SidebarSection, icon: <CheckSquare size={18} />, label: 'Tasks', badge: pendingTasks },
    { section: 'reminders' as SidebarSection, icon: <Clock size={18} />, label: 'Reminders', badge: reminderCount },
    { section: 'digest' as SidebarSection, icon: <FileText size={18} />, label: 'Weekly Digest', badge: undefined },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg border border-gray-700"
        whileTap={{ scale: 0.95 }}
      >
        <Menu size={20} className="text-gray-300" />
      </motion.button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/60 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative z-40 h-full w-64 bg-[#16161D] border-r border-gray-800 flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img
                src="/logo-horizontal-sm.png"
                alt="SoliMail"
                className="h-8 w-auto object-contain"
              />
            </motion.div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hidden lg:block"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {mainNavItems.map((item) => (
              <NavItem
                key={item.section}
                {...item}
                isActive={activeSection === item.section}
                onClick={() => {
                  setActiveSection(item.section);
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              />
            ))}

            {/* Divider */}
            <div className="my-4 border-t border-gray-800" />

            {/* Accounts Section */}
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Accounts ({enabledAccounts.length})
                </span>
                <button
                  onClick={() => {
                    setActiveSection('accounts');
                    if (window.innerWidth < 1024) toggleSidebar();
                  }}
                  className="p-1 rounded hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  <Settings size={14} />
                </button>
              </div>
              <div className="space-y-1">
                {enabledAccounts.slice(0, 5).map((account) => (
                  <motion.div
                    key={account.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    whileHover={{ x: 2 }}
                  >
                    <StatusDot status={account.status} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-300 truncate">{account.name}</p>
                      <p className="text-xs text-gray-500 truncate">{account.email}</p>
                    </div>
                    {account.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-gray-700 text-xs text-gray-400">
                        {account.unreadCount}
                      </span>
                    )}
                  </motion.div>
                ))}
                {enabledAccounts.length > 5 && (
                  <button
                    onClick={() => {
                      setActiveSection('accounts');
                      if (window.innerWidth < 1024) toggleSidebar();
                    }}
                    className="w-full text-xs text-violet-400 hover:text-violet-300 py-1"
                  >
                    +{enabledAccounts.length - 5} more accounts
                  </button>
                )}
              </div>
            </div>
          </nav>

          {/* AI Stats Footer */}
          <div className="px-3 py-4 border-t border-gray-800">
            <div className="bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-lg p-3 border border-violet-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-violet-400" />
                <span className="text-xs font-medium text-violet-300">AI Active</span>
              </div>
              <p className="text-xs text-gray-400">
                Analyzed <span className="text-gray-200 font-medium">234</span> emails this week
              </p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
