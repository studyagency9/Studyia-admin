import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import Dashboard from "./pages/Dashboard";
import UsersPage from "./pages/UsersPage";
import CVsPage from "./pages/CVsPage";
import PartnersPage from "./pages/PartnersPage";
import CommercialsPage from "./pages/CommercialsPage";
import InvoicesPage from "./pages/InvoicesPage";
import AccountingPage from "./pages/AccountingPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import UserCredentialsPage from "./pages/UserCredentialsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/cvs" element={<CVsPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/commercials" element={<CommercialsPage />} />
              <Route path="/invoices" element={<InvoicesPage />} />
              <Route path="/accounting" element={<AccountingPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/user-credentials" element={<UserCredentialsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
