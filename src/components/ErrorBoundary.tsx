import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-8">
            <div className="p-6 bg-red-500/10 rounded-full w-fit mx-auto">
              <AlertTriangle size={64} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic uppercase mb-2">SOMETHING WENT WRONG</h1>
              <p className="text-zinc-400 text-sm font-mono">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
            </div>
            <button
              onClick={this.resetError}
              className="w-full bg-brand hover:bg-brand/90 text-black font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={20} /> TRY AGAIN
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
