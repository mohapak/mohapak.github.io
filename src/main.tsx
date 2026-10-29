// src/main.tsx
import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const EconomicsPortfolio = React.lazy(() => import('./economics_portfolio'));

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container-x py-24">
          <p className="label">Something went wrong</p>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-fg/70">{this.state.error?.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div className="container-x py-24"><p className="label">Loading…</p></div>}>
        <EconomicsPortfolio />
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>
);
