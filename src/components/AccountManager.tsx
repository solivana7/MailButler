import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Plus,
  Trash2,
  RefreshCw,
  Check,
  AlertCircle,
  Settings,
  ChevronDown,
  Globe,
  Shield,
  X,
} from 'lucide-react';
import { useStore } from '@/store';
import { StatusDot } from './ui';
import { Account } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface AccountCardProps {
  account: Account;
  onToggle: () => void;
  onSync: () => void;
  onDelete: () => void;
}

const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onToggle,
  onSync,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      className={`bg-[#1E1E27] rounded-xl border transition-all ${
        account.isEnabled ? 'border-gray-800' : 'border-gray-800/50 opacity-60'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                account.provider === 'gmail'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              <Mail size={18} className="text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-white">{account.name}</h3>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">{account.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusDot status={account.status} />
            <div className="relative">
              <motion.button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Settings size={16} />
              </motion.button>
              {showMenu && (
                <motion.div
                  className="absolute right-0 top-full mt-2 w-48 bg-[#252530] border border-gray-700 rounded-lg shadow-xl z-10 py-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={() => {
                      onSync();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <RefreshCw size={14} /> Sync Now
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <div className="border-t border-gray-700 my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Unread</p>
            <p className={`text-lg font-semibold ${account.unreadCount > 0 ? 'text-white' : 'text-gray-500'}`}>
              {account.unreadCount}
            </p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-semibold text-gray-400">
              {account.totalEmails.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Provider Info */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Globe size={12} />
            {account.provider === 'gmail' ? 'Gmail / Google Workspace' : 'IMAP'}
          </span>
          {account.lastSync && (
            <span>
              Synced {formatDistanceToNow(new Date(account.lastSync), { addSuffix: true })}
            </span>
          )}
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
          <span className="text-sm text-gray-400">
            {account.isEnabled ? 'Active' : 'Disabled'}
          </span>
          <motion.button
            onClick={onToggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              account.isEnabled ? 'bg-emerald-500' : 'bg-gray-700'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
              animate={{ left: account.isEnabled ? 28 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export const AccountManager: React.FC = () => {
  const { accounts, toggleAccount, syncAccount } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const totalAccounts = accounts.length;
  const activeAccounts = accounts.filter((a) => a.isEnabled).length;
  const totalUnread = accounts.reduce((sum, a) => sum + a.unreadCount, 0);

  return (
    <div className="flex flex-col h-full bg-[#0D0D12]">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-gray-800 bg-[#16161D]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
              <Mail size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Email Accounts</h1>
              <p className="text-sm text-gray-500">
                {activeAccounts} of {totalAccounts} accounts active
              </p>
            </div>
          </div>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Add Account
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Accounts</p>
            <p className="text-lg font-semibold text-white">{totalAccounts}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-lg font-semibold text-emerald-400">{activeAccounts}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Unread</p>
            <p className="text-lg font-semibold text-orange-400">{totalUnread}</p>
          </div>
        </div>
      </div>

      {/* Account List */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
          <AnimatePresence>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onToggle={() => toggleAccount(account.id)}
                onSync={() => syncAccount(account.id)}
                onDelete={() => {}}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Add Account Card */}
        <motion.button
          onClick={() => setShowAddModal(true)}
          className="w-full max-w-4xl mx-auto mt-4 p-8 border-2 border-dashed border-gray-800 rounded-xl text-gray-500 hover:border-violet-500/50 hover:text-violet-400 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus size={20} />
          Add another email account
        </motion.button>
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="bg-[#1E1E27] rounded-2xl border border-gray-800 w-full max-w-md p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Add Email Account</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <motion.button
                  className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700 text-left transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3">
                    <Mail size={18} className="text-white" />
                  </div>
                  <p className="text-sm font-medium text-white">Gmail / Google</p>
                  <p className="text-xs text-gray-500">OAuth2 secure login</p>
                </motion.button>

                <motion.button
                  className="p-4 bg-gray-800/50 hover:bg-gray-800 rounded-xl border border-gray-700 text-left transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center mb-3">
                    <Globe size={18} className="text-white" />
                  </div>
                  <p className="text-sm font-medium text-white">IMAP / Other</p>
                  <p className="text-xs text-gray-500">Any email provider</p>
                </motion.button>
              </div>

              {/* Security Note */}
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-6">
                <Shield size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-emerald-300 font-medium">Secure Connection</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Your credentials are encrypted and never stored in plain text. We use industry-standard security practices.
                  </p>
                </div>
              </div>

              {/* Continue Button */}
              <motion.button
                className="w-full py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                Continue with Google
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
