import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";

// Lazy load pages for better performance
const Index = lazy(() => import("../pages/Index"));
const Auth = lazy(() => import("../pages/Auth"));
const OptimizedLeaderboards = lazy(() => import("../pages/OptimizedLeaderboards"));
const Admin = lazy(() => import("../pages/Admin"));
const NotFound = lazy(() => import("../pages/NotFound"));

export const AppContent = () => {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const { isAdmin } = useAdmin();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner message="Loading application..." />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/leagues" element={<Navigate to="/leaderboards" replace />} />
          <Route path="/leaderboards" element={<OptimizedLeaderboards />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {isAdmin && (
        <PerformanceDashboard 
          isVisible={showPerformanceDashboard}
          onToggle={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
        />
      )}
    </BrowserRouter>
  );
};