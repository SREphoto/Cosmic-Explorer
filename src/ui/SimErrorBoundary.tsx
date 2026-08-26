// @ts-nocheck — @types/react is not installed in this repo; React resolves as
// `any`, which breaks inherited class members (this.state / this.props) under
// tsc even though the code is correct at runtime. Keep this file untyped.
import React from 'react';

interface SimErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface SimErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Safety net for the planet-sim home screen: if it ever throws at runtime we
 * fall back to the classic main menu instead of showing a blank white screen.
 */
export class SimErrorBoundary extends React.Component<SimErrorBoundaryProps, SimErrorBoundaryState> {
  constructor(props: SimErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SimErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[PlanetSim] Home screen crashed, falling back to main menu:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
