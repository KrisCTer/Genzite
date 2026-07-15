import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="canvas-builder" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#09090b',
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            height: '100vh',
            width: '100vw'
          }}
        >
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: 16,
            padding: '64px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 480,
            textAlign: 'center'
          }}>
            <h1 style={{
              fontSize: 96,
              fontWeight: 800,
              color: 'rgba(255, 255, 255, 0.08)',
              margin: 0,
              lineHeight: 1
            }}>
              404
            </h1>
            <p style={{
              fontSize: 20,
              fontWeight: 500,
              color: '#fff',
              marginTop: 24,
              marginBottom: 8
            }}>
              Oops, something went wrong!
            </p>
            <p style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: 32 }}>
              {this.state.error?.message || "An unexpected error occurred while rendering this page."}
            </p>
            <button 
              onClick={() => window.location.href = '/project'}
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.2s'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
