"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-md mx-auto mt-16 border border-destructive/30 rounded-xl bg-card shadow-sm">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {this.state.error?.message}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
