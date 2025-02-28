# Calendar Sync Application

This application allows users to sync their Outlook calendar with Google calendar.

## Setup

1. Clone the repository
```bash
git clone <repository-url>
cd calendar-sync
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
Create a `.env.local` file in the root directory with the following variables:
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your_client_id
NEXT_PUBLIC_REDIRECT_URI=http://localhost:3000/api/auth/callback/outlook
AZURE_CLIENT_SECRET=your_client_secret
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

## Production Deployment

1. Update Azure AD Application settings:
   - Add your production domain to the list of allowed redirect URIs
   - Configure appropriate security settings

2. Set environment variables in your production environment:
```env
NEXT_PUBLIC_AZURE_CLIENT_ID=your_client_id
NEXT_PUBLIC_REDIRECT_URI=https://your-domain.com/api/auth/callback/outlook
AZURE_CLIENT_SECRET=your_client_secret
NODE_ENV=production
```

## Security Notes

- Never commit `.env.local` or any files containing sensitive information
- Always use HTTPS in production
- Keep your client secret secure
- Regularly rotate credentials

## Features

- OAuth2 authentication with Microsoft Azure AD
- Secure token handling
- Modern UI with Tailwind CSS
- TypeScript support

## License

MIT
