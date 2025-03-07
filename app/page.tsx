'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProviderStatus {
  outlook: boolean;
  google: boolean;
}

export default function Home() {
  const router = useRouter();
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({ outlook: false, google: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProviders = async () => {
      try {
        const response = await fetch('/api/calendar');
        const data = await response.json();
        setProviderStatus(data.providers);
      } catch (error) {
        console.error('Error checking providers:', error);
      } finally {
        setLoading(false);
      }
    };

    checkProviders();
  }, []);

  const navigateToConfig = () => {
    router.push('/config');
  };

  const navigateToCalendar = () => {
    router.push('/calendar');
  };

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gray-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">
          Calendar Sync Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Connected Accounts</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              providerStatus.outlook ? 'bg-[#0078d4] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.386 7.54H12.75v3.173h8.636V7.54zM12.75 11.864v3.173h6.914v-3.173h-6.914zM12.75 16.187v3.173h6.914v-3.173h-6.914zM22.773 6.44L12.75 3.5v18.346l10.023-2.94V6.44zM2.614 7.54h8.636v3.173H2.614V7.54zm0 4.324h6.914v3.173H2.614v-3.173zm0 4.323h6.914v3.173H2.614v-3.173zM1.227 6.44v14.466l10.023 2.94V3.5L1.227 6.44z"/>
              </svg>
              Outlook {providerStatus.outlook ? 'Connected' : 'Not Connected'}
            </div>
            <div className={`px-4 py-2 rounded-md flex items-center gap-2 ${
              providerStatus.google ? 'bg-[#4285F4] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 12.151L12.542 12.161C12.193 13.334 11.086 14.209 9.793 14.209C8.118 14.209 6.762 12.853 6.762 11.178C6.762 9.503 8.118 8.146 9.793 8.146C11.086 8.146 12.194 9.021 12.542 10.194L12.546 10.206L15.203 8.337C14.193 6.518 12.139 5.227 9.793 5.227C6.513 5.227 3.846 7.893 3.846 11.178C3.846 14.462 6.513 17.129 9.793 17.129C12.142 17.129 14.193 15.831 15.203 14.016L12.545 12.151Z"/>
              </svg>
              Google {providerStatus.google ? 'Connected' : 'Not Connected'}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={navigateToConfig}
              className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Manage Connections
            </button>
            <button
              onClick={navigateToCalendar}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              disabled={!providerStatus.outlook && !providerStatus.google}
            >
              View Calendar
            </button>
          </div>
        </div>

        {(!providerStatus.outlook && !providerStatus.google) && (
          <div className="text-center text-gray-600">
            No calendars connected yet. Click "Manage Connections" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
