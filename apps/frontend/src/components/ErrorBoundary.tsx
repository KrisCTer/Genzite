import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Result, Button } from 'antd';

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
        <Result
          status="500"
          title="Something went wrong."
          subTitle={this.state.error?.message || "Sorry, an unexpected error has occurred."}
          extra={<Button type="primary" onClick={() => window.location.href = '/admin'}>Back to Home</Button>}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
