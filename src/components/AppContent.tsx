import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

// Lazy load pages for better performance
const Index = lazy(() => import("../pages/Index"));
const Auth = lazy(() => import("../pages/Auth"));
const OptimizedLeaderboards = lazy(() => import("../pages/OptimizedLeaderboards"));
const ComingSoon = lazy(() => import("../components/ComingSoon"));
const Admin = lazy(() => import("../pages/Admin"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const AppContent = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/leagues" element={<Navigate to="/leaderboards" replace />} />
          <Route path="/leaderboards" element={<OptimizedLeaderboards />} />
          <Route path="/insights" element={<ComingSoon />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};