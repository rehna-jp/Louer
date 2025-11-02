import "./App.css";
import { Component, lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import useAuthStore from "./stores/auth";

// Lazy-loaded routes for code splitting
const Index = lazy(() => import("./pages/Index"));
const ListingDetails = lazy(() => import("./pages/ListingDetails"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

// React Query Client with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Error Boundary for route errors
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div role="alert" style={{ padding: 16 }}>An error occurred. Please reload.</div>;
    }
    return this.props.children;
  }
}

// Simple route guard using auth store
function ProtectedRoute({ children }) {
  const location = useLocation();
  const { user } = useAuthStore();
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return children;
}

// React Query Devtools (optional):
// Install first: npm i @tanstack/react-query-devtools
// Then uncomment:
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <ErrorBoundary>
          <Suspense fallback={<div className="p-4">Loading...</div>}>
            <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
