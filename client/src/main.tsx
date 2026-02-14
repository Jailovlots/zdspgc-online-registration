import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global error handler for uncaught exceptions
window.onerror = function (message, source, lineno, colno, error) {
    const errorMsg = `
    Global Error: ${message}
    Source: ${source}:${lineno}:${colno}
    Stack: ${error?.stack || 'No stack trace'}
  `;
    console.error(errorMsg);
    // Only override body if root is empty (app failed to mount)
    if (!document.getElementById("root")?.hasChildNodes()) {
        document.body.innerHTML = `<div style="padding: 20px; color: #ef4444; font-family: monospace; white-space: pre-wrap; background: #fee2e2; border: 2px solid #ef4444; margin: 20px; border-radius: 8px;">
        <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Application Crashed (Global Handler)</h1>
        <div style="background: rgba(255,255,255,0.5); padding: 1rem; border-radius: 4px;">${errorMsg}</div>
        <p style="margin-top: 1rem; font-size: 0.875rem;">Check the browser console for more details.</p>
      </div>`;
    }
};

// Global handler for potential promise rejections
window.onunhandledrejection = function (event) {
    const errorMsg = `Unhandled Promise Rejection: ${event.reason}`;
    console.error(errorMsg);
    // We might not want to blow up the screen for every unhandled rejection if the app is still working,
    // but for a white screen debug, it's useful.
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", color: "#ef4444", background: "#fee2e2", fontFamily: "monospace", margin: "20px", borderRadius: "8px", border: "2px solid #ef4444" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>Something went wrong.</h1>
                    <pre style={{ background: "rgba(255,255,255,0.5)", padding: "1rem", borderRadius: "4px", overflow: "auto" }}>{this.state.error?.message}</pre>
                    <pre style={{ marginTop: "1rem", fontSize: "0.875rem", overflow: "auto" }}>{this.state.error?.stack}</pre>
                </div>
            );
        }

        return this.props.children;
    }
}

try {
    const rootElement = document.getElementById("root");
    if (!rootElement) throw new Error("Root element not found");

    createRoot(rootElement).render(
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    );
} catch (e: any) {
    console.error("Mount Error:", e);
    document.body.innerHTML = `<div style="padding: 20px; color: #ef4444; font-family: monospace; white-space: pre-wrap; background: #fee2e2; border: 2px solid #ef4444; margin: 20px; border-radius: 8px;">
      <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Application Crashed (Mount Error)</h1>
      <div style="background: rgba(255,255,255,0.5); padding: 1rem; border-radius: 4px;">${e.message}\n${e.stack}</div>
    </div>`;
}
