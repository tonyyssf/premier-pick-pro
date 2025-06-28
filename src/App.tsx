
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PicksProvider } from "@/contexts/PicksContext";
import { SecurityHeaders } from "@/components/SecurityHeaders";
import Index from "./pages/Index";
import Leagues from "./pages/Leagues";
import Leaderboards from "./pages/Leaderboards";
import HowToPlay from "./pages/HowToPlay";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Simple App component with all public routes
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <PicksProvider>
        <TooltipProvider>
          <SecurityHeaders />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/leagues" element={<Leagues />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </PicksProvider>
    </QueryClientProvider>
  );
};

export default App;
