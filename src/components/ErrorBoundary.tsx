import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('khushi_custom_site_content_v1');
      const activeTenant = localStorage.getItem('platform_active_client_id') || 'khushi';
      localStorage.removeItem(`tenant_content_${activeTenant}`);
    } catch {}
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f7ecee] text-[#25181c] flex items-center justify-center p-6 font-['Plus_Jakarta_Sans']">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#b89758]/30 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#6c2e3e]/10 flex items-center justify-center text-[#6c2e3e]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl text-[#6c2e3e] font-medium mb-2">
              Website Refresh Needed
            </h2>
            <p className="text-xs text-[#5a454b] mb-6 leading-relaxed">
              We encountered a minor display sync issue. Click below to refresh with the latest atelier styles.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-rose-800 bg-rose-50 p-2.5 rounded-xl text-left overflow-auto max-h-28 mb-6 border border-rose-200">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6c2e3e] to-[#b89758] text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              Reload Website
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
