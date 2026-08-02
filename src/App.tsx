import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar, Dashboard, EmailList, TaskPanel, DigestView, AccountManager, Privacy, Terms } from '@/components';
import { useStore } from '@/store';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const MainContent: React.FC = () => {
  const { activeSection, initialize, setActiveSection } = useStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    // After Gmail OAuth redirect, land on Accounts section
    if (window.location.pathname === '/accounts') {
      setActiveSection('accounts');
    }
  }, [setActiveSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'tabs':
      case 'reminders':
        return <EmailList />;
      case 'tasks':
        return <TaskPanel />;
      case 'digest':
        return <DigestView />;
      case 'accounts':
        return <AccountManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0D0D12] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
};

function App() {
  if (window.location.pathname === '/privacy') {
    return <Privacy />;
  }

  if (window.location.pathname === '/terms') {
    return <Terms />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MainContent />
    </QueryClientProvider>
  );
}

export default App;
