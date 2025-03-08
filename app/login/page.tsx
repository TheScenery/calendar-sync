'use client';

import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/');
    }

    // 检查URL中是否有错误参数
    const errorParam = searchParams.get('error');
    if (errorParam === 'user_not_found') {
      setError('您的账号未被授权使用此应用。请联系管理员添加您的邮箱到允许列表。');
    }
  }, [isAuthenticated, loading, router, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">登录日历同步应用</h1>
        <p className="text-gray-600 mb-8 text-center">
          请使用 Google 账号登录以访问您的日历信息
        </p>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}
        
        <button
          onClick={login}
          className="w-full px-6 py-3 text-white bg-[#4285F4] hover:bg-[#357AE8] rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.545 12.151L12.542 12.161C12.193 13.334 11.086 14.209 9.793 14.209C8.118 14.209 6.762 12.853 6.762 11.178C6.762 9.503 8.118 8.146 9.793 8.146C11.086 8.146 12.194 9.021 12.542 10.194L12.546 10.206L15.203 8.337C14.193 6.518 12.139 5.227 9.793 5.227C6.513 5.227 3.846 7.893 3.846 11.178C3.846 14.462 6.513 17.129 9.793 17.129C12.142 17.129 14.193 15.831 15.203 14.016L12.545 12.151Z"/>
            <path d="M20.762 10.054H19.619V10.054H12.313V12.313H17.137C16.545 14.104 14.972 15.147 12.968 15.147C12.644 15.147 12.32 15.116 12 15.054V15.055H12.002C13.001 15.247 14.056 15.137 15.007 14.685C15.958 14.234 16.735 13.473 17.215 12.518L17.217 12.515L17.215 12.518C17.7 11.547 17.872 10.445 17.708 9.366C17.545 8.288 17.053 7.285 16.302 6.491C15.551 5.697 14.576 5.148 13.505 4.917C12.434 4.686 11.321 4.784 10.312 5.199C9.302 5.615 8.447 6.33 7.867 7.247C7.287 8.165 7.009 9.242 7.075 10.325C7.14 11.407 7.547 12.444 8.237 13.284C8.927 14.124 9.868 14.724 10.922 14.995L10.921 14.994L10.922 14.995C11.93 15.237 12.989 15.146 13.944 14.736C14.9 14.326 15.707 13.617 16.254 12.707H12.313V10.054H17.137H19.619H20.762V10.054Z"/>
          </svg>
          使用 Google 账号登录
        </button>
      </div>
    </div>
  );
} 