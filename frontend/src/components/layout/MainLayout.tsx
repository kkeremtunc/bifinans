import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { MarketTicker } from './MarketTicker';
import { DisclaimerModal } from '../common/DisclaimerModal';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const [showDisclaimer, setShowDisclaimer] = useState(!user?.disclaimerAccepted);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090d16]">
      {showDisclaimer && <DisclaimerModal onAccept={() => setShowDisclaimer(false)} />}
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <MarketTicker />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
