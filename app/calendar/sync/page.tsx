'use client';

import React, { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useRouter } from 'next/navigation';

interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
}

interface SyncResponse {
  success: boolean;
  results: {
    outlookToGoogle: SyncResult | null;
    googleToOutlook: SyncResult | null;
  };
}

const CalendarSyncPage: React.FC = () => {
  const router = useRouter();
  const [direction, setDirection] = useState<'outlook-to-google' | 'google-to-outlook' | 'both'>('both');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync calendars');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const navigateToCalendar = () => {
    router.push('/calendar');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">Calendar Sync</h1>

        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Sync Settings</h2>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Sync Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              className="w-full p-2 border border-gray-300 rounded-md"
              disabled={loading}
            >
              <option value="both">Both Ways (Outlook ↔ Google)</option>
              <option value="outlook-to-google">Outlook to Google (Outlook → Google)</option>
              <option value="google-to-outlook">Google to Outlook (Google → Outlook)</option>
            </select>
          </div>

          <div className="flex justify-between">
            <button
              onClick={navigateToCalendar}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              disabled={loading}
            >
              Back to Calendar
            </button>
            <button
              onClick={handleSync}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {result && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-black">Sync Results</h2>

            {result.results.outlookToGoogle && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Outlook → Google</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-1">
                    <span className="font-medium">Success:</span> {result.results.outlookToGoogle.success} events
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Failed:</span> {result.results.outlookToGoogle.failed} events
                  </p>
                  {result.results.outlookToGoogle.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Errors:</p>
                      <ul className="list-disc pl-5 text-sm text-red-600">
                        {result.results.outlookToGoogle.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {result.results.outlookToGoogle.errors.length > 5 && (
                          <li>...and {result.results.outlookToGoogle.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {result.results.googleToOutlook && (
              <div>
                <h3 className="text-lg font-medium mb-2">Google → Outlook</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="mb-1">
                    <span className="font-medium">Success:</span> {result.results.googleToOutlook.success} events
                  </p>
                  <p className="mb-1">
                    <span className="font-medium">Failed:</span> {result.results.googleToOutlook.failed} events
                  </p>
                  {result.results.googleToOutlook.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium mb-1">Errors:</p>
                      <ul className="list-disc pl-5 text-sm text-red-600">
                        {result.results.googleToOutlook.errors.slice(0, 5).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                        {result.results.googleToOutlook.errors.length > 5 && (
                          <li>...and {result.results.googleToOutlook.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default CalendarSyncPage; 