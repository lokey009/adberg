import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import NotFound from "./pages/NotFound";
import ImageStudio from "./pages/ImageStudio";
import VideoService from "./pages/VideoService";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import SkinLogic from "./pages/SkinLogic";
import SkinStudio from "./pages/skin-studio/page";
import TestUpload from "./pages/test-upload";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/image-studio" element={<ImageStudio />} />
            <Route path="/video-service" element={<VideoService />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/skin-studio" element={<SkinStudio />} />
            <Route path="/skin-logic" element={<SkinLogic />} />
            <Route path="/test-upload" element={<TestUpload />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <EnhancedDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard-old"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
