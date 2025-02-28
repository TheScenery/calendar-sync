'use client';

import { useSearchParams } from 'next/navigation';

export default function TokensPage() {
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Tokens</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Access Token</h2>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
              {accessToken}
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
          <h2 className="text-xl font-semibold">Refresh Token</h2>
          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-all">
              {refreshToken}
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