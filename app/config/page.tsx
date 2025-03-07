'use client';

import ProtectedRoute from '../components/ProtectedRoute';

export default function ConfigPage() {
  const AZURE_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || REDIRECT_URI;
  
  const outlookLoginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${AZURE_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=offline_access%20user.read%20calendars.read%20calendars.read.shared`;
  
  const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly%20https://www.googleapis.com/auth/userinfo.email&access_type=offline&prompt=consent`;

  const handleOutlookLogin = () => {
    console.log('Outlook Login URL:', outlookLoginUrl);
    window.location.href = outlookLoginUrl;
  };
  
  const handleGoogleLogin = () => {
    console.log('Google Login URL:', googleLoginUrl);
    window.location.href = googleLoginUrl;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 bg-gray-50">
        <h1 className="text-3xl font-bold mb-8 text-center text-black">
          Calendar Configuration
        </h1>
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Connect Your Calendars</h2>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleOutlookLogin}
              className="px-6 py-3 text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.386 7.54H12.75v3.173h8.636V7.54zM12.75 11.864v3.173h6.914v-3.173h-6.914zM12.75 16.187v3.173h6.914v-3.173h-6.914zM22.773 6.44L12.75 3.5v18.346l10.023-2.94V6.44zM2.614 7.54h8.636v3.173H2.614V7.54zm0 4.324h6.914v3.173H2.614v-3.173zm0 4.323h6.914v3.173H2.614v-3.173zM1.227 6.44v14.466l10.023 2.94V3.5L1.227 6.44z"/>
              </svg>
              Connect Outlook Calendar
            </button>
            
            <button
              onClick={handleGoogleLogin}
              className="px-6 py-3 text-white bg-[#4285F4] hover:bg-[#357AE8] rounded-md flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 12.151L12.542 12.161C12.193 13.334 11.086 14.209 9.793 14.209C8.118 14.209 6.762 12.853 6.762 11.178C6.762 9.503 8.118 8.146 9.793 8.146C11.086 8.146 12.194 9.021 12.542 10.194L12.546 10.206L15.203 8.337C14.193 6.518 12.139 5.227 9.793 5.227C6.513 5.227 3.846 7.893 3.846 11.178C3.846 14.462 6.513 17.129 9.793 17.129C12.142 17.129 14.193 15.831 15.203 14.016L12.545 12.151Z"/>
                <path d="M20.762 10.054H19.619V10.054H12.313V12.313H17.137C16.545 14.104 14.972 15.147 12.968 15.147C12.644 15.147 12.32 15.116 12 15.054V15.055H12.002C13.001 15.247 14.056 15.137 15.007 14.685C15.958 14.234 16.735 13.473 17.215 12.518L17.217 12.515L17.215 12.518C17.7 11.547 17.872 10.445 17.708 9.366C17.545 8.288 17.053 7.285 16.302 6.491C15.551 5.697 14.576 5.148 13.505 4.917C12.434 4.686 11.321 4.784 10.312 5.199C9.302 5.615 8.447 6.33 7.867 7.247C7.287 8.165 7.009 9.242 7.075 10.325C7.14 11.407 7.547 12.444 8.237 13.284C8.927 14.124 9.868 14.724 10.922 14.995L10.921 14.994L10.922 14.995C11.93 15.237 12.989 15.146 13.944 14.736C14.9 14.326 15.707 13.617 16.254 12.707H12.313V10.054H17.137H19.619H20.762V10.054Z"/>
              </svg>
              Connect Google Calendar
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 