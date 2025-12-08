import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { NavigationTabs } from "@/components/NavigationTabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ProvidersPage from "./pages/ProvidersPage";
import UploadPage from "./pages/UploadPage";
import ReportsPage from "./pages/ReportsPage";
import ActionQueuePage from "./pages/ActionQueuePage";
import SyntheticDataPage from "./pages/SyntheticDataPage";
import AuthPage from "./pages/AuthPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import SingleProviderCheckPage from "./pages/SingleProviderCheckPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <Header />
      <NavigationTabs />
      <main className="content-container">
        {children}
      </main>
    </div>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<ProtectedLayout><Index /></ProtectedLayout>} />
          <Route path="/providers" element={<ProtectedLayout><ProvidersPage /></ProtectedLayout>} />
          <Route path="/validate" element={<ProtectedLayout><SingleProviderCheckPage /></ProtectedLayout>} />
          <Route path="/upload" element={<ProtectedLayout><UploadPage /></ProtectedLayout>} />
          <Route path="/reports" element={<ProtectedLayout><ReportsPage /></ProtectedLayout>} />
          <Route path="/queue" element={<ProtectedLayout><ActionQueuePage /></ProtectedLayout>} />
          <Route path="/synthetic" element={<ProtectedLayout><SyntheticDataPage /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><ProfileSettingsPage /></ProtectedLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
