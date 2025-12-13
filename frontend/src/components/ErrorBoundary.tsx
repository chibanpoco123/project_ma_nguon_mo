import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Đã xảy ra lỗi</h2>
          <p>{this.state.error?.message || 'Có lỗi không xác định xảy ra'}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Thử lại
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;