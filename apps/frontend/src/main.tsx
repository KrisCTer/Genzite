import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Amplify } from 'aws-amplify';

const queryClient = new QueryClient();

// Configure AWS Amplify dynamically using Cognito shared env vars
const cognitoUserPoolId = import.meta.env.VITE_COGNITO_AUTHORITY?.split('/').pop() || '';
const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '';

if (cognitoUserPoolId && cognitoClientId && !cognitoUserPoolId.includes('xxxxxx')) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: cognitoUserPoolId,
        userPoolClientId: cognitoClientId,
      }
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)

