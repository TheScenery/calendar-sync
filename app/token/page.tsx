'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function TokenDisplay() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const provider = searchParams.get('provider') || 'outlook';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const navigateToCalendar = () => {
    router.push('/calendar');
  };

  const providerName = provider === 'google' ? 'Google' : 'Outlook';
  const providerColor = provider === 'google' ? 'bg-[#4285F4]' : 'bg-[#0078d4]';

  return (
    <div className="min-h-screen p-8 bg-gray-50 text-black">
      <h1 className="text-3xl font-bold mb-8 text-center text-black">
        {providerName} Authentication Tokens
      </h1>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black">Access Token</h2>
          <div className="relative bg-white shadow-md rounded-lg p-6">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all text-black border border-gray-300">
              {accessToken || 'No access token available'}
            </pre>
            <button
              onClick={() => copyToClipboard(accessToken || '')}
              className={`absolute top-2 right-2 px-3 py-1 ${providerColor} text-white rounded hover:opacity-90 text-sm`}
            >
              Copy
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-black">Refresh Token</h2>
          <div className="relative bg-white shadow-md rounded-lg p-6">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all text-black border border-gray-300">
              {refreshToken || 'No refresh token available'}
            </pre>
            <button
              onClick={() => copyToClipboard(refreshToken || '')}
              className={`absolute top-2 right-2 px-3 py-1 ${providerColor} text-white rounded hover:opacity-90 text-sm`}
            >
              Copy
            </button>
          </div>
        </div>
      </div>

      <button onClick={navigateToCalendar} className={`mt-8 px-6 py-3 ${providerColor} text-white rounded-lg shadow-md hover:opacity-90`}>Go to Calendar</button>
    </div>
  );
}

// Loading component
function TokenLoadingState() {
  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Loading Tokens...</h1>
      <div className="space-y-6">
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
        <div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
}

export default function TokenPage() {
  return (
    <Suspense fallback={<TokenLoadingState />}>
      <TokenDisplay />
    </Suspense>
  );
} 