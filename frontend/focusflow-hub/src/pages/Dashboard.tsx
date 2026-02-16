import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useApp } from '@/contexts/AppContext';
import { apiRequest } from '@/lib/api';

import { ADHDDashboard } from '@/components/dashboard/ADHDDashboard';
import { AutismDashboard } from '@/components/dashboard/AutismDashboard';
import { DyslexiaDashboard } from '@/components/dashboard/DyslexiaDashboard';

export default function Dashboard() {
  const { isAuthenticated } = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const data = await apiRequest('/profile/me');
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!profile || !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  switch (profile.support_mode) {
    case 'adhd':
      return <ADHDDashboard />;
    case 'autism':
      return <AutismDashboard />;
    case 'dyslexia':
      return <DyslexiaDashboard />;
    default:
      return <Navigate to="/onboarding" replace />;
  }
}
