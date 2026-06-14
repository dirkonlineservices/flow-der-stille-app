import React from 'react';
import PremiumDashboard from '../components/PremiumDashboard';

export default function Premium() {
  // NOTE: This assumes you have some form of AuthProvider wrapping your app
  // or a way to get the session. For this example, we'll mock a session check.
  // In a real app, replace `session` with your actual auth state.
  const session = { user: { id: 'mock-user-id' } }; 

  return (
    <div className="pt-20">
      <PremiumDashboard session={session} />
    </div>
  );
}
