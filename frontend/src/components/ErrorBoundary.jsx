import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', textAlign: 'center', background: '#fff' }}>
                    <h1 style={{ color: '#1E40AF' }}>Something went wrong.</h1>
                    <p style={{ color: '#666' }}>{this.state.error?.message}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ marginTop: '10px' }}
                    >
                        Try Refreshing
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
