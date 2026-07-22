import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic error boundary with a Bengali fallback UI.
 * Wrap risky subtrees (root, lesson view, checkout) to prevent the whole
 * SPA from white-screening on a single render error.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">কিছু একটা ভুল হয়েছে</h2>
            <p className="text-sm text-muted-foreground mb-6">
              পেজটি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন অথবা কিছুক্ষণ পরে আবার চেষ্টা করুন।
            </p>
            {this.state.error?.message && (
              <pre className="text-[11px] text-left bg-muted/40 rounded-md p-2 mb-4 overflow-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <Button onClick={this.handleReload} className="w-full">
              পেজ রিফ্রেশ করুন
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
