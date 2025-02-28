'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function TokenDisplay() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Authentication Tokens</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-black">Access Token</h2>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all text-black border border-gray-300">
              {accessToken || 'No access token available'}
            </pre>
            <button
              onClick={() => copyToClipboard(accessToken || '')}
              className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-black">Refresh Token</h2>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all text-black border border-gray-300">
              {refreshToken || 'No refresh token available'}
            </pre>
            <button
              onClick={() => copyToClipboard(refreshToken || '')}
              className="absolute top-2 right-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
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