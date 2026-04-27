import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth.tsx";
import Home from "./pages/Home.tsx";
import RoutesPage from "./pages/Routes.tsx";
import RouteDetail from "./pages/RouteDetail.tsx";
import MyTrips from "./pages/MyTrips.tsx";
import Profile from "./pages/Profile.tsx";
import Subscriptions from "./pages/Subscriptions.tsx";
import Driver from "./pages/Driver.tsx";
import Admin from "./pages/Admin.tsx";
import AdminRoutes from "./pages/AdminRoutes.tsx";
import AdminTrips from "./pages/AdminTrips.tsx";
import Install from "./pages/Install.tsx";
import PlanTrip from "./pages/PlanTrip.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/landing" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/plan" element={<ProtectedRoute><PlanTrip /></ProtectedRoute>} />
            <Route path="/routes" element={<ProtectedRoute><RoutesPage /></ProtectedRoute>} />
            <Route path="/route/:id" element={<ProtectedRoute><RouteDetail /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><MyTrips /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/driver" element={<ProtectedRoute requireRole="driver"><Driver /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requireRole="admin"><Admin /></ProtectedRoute>} />
            <Route path="/admin/routes" element={<ProtectedRoute requireRole="admin"><AdminRoutes /></ProtectedRoute>} />
            <Route path="/admin/trips" element={<ProtectedRoute requireRole="admin"><AdminTrips /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
