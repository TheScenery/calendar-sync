'use client';

export default function Home() {
  const AZURE_CLIENT_ID = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI;
  
  const loginUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${AZURE_CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&response_mode=query&scope=offline_access%20user.read%20calendars.read%20calendars.read.shared`;

  const handleLogin = () => {
    console.log('Login URL:', loginUrl);
    window.location.href = loginUrl;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-xl font-semibold">
        Sync your Outlook calendar and Google calendar
      </h1>
      <button
        onClick={handleLogin}
        className="px-6 py-2 text-white bg-[#0078d4] hover:bg-[#106ebe] rounded-md flex items-center gap-2 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.386 7.54H12.75v3.173h8.636V7.54zM12.75 11.864v3.173h6.914v-3.173h-6.914zM12.75 16.187v3.173h6.914v-3.173h-6.914zM22.773 6.44L12.75 3.5v18.346l10.023-2.94V6.44zM2.614 7.54h8.636v3.173H2.614V7.54zm0 4.324h6.914v3.173H2.614v-3.173zm0 4.323h6.914v3.173H2.614v-3.173zM1.227 6.44v14.466l10.023 2.94V3.5L1.227 6.44z"/>
        </svg>
        Sign in with Outlook
      </button>
    </div>
  );
}
