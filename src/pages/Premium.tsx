import React from 'react';
import PremiumDashboard from '../components/PremiumDashboard';
import { useAuth } from '../context/AuthContext';

export default function Premium() {
  const { user } = useAuth();
  const session = user ? { user } : null;

  return (
    <div className="pt-20">
      <PremiumDashboard session={session} />
    </div>
  );
}
