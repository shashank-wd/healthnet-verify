import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NavigationTabs } from "@/components/NavigationTabs";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import ProvidersPage from "./pages/ProvidersPage";
import UploadPage from "./pages/UploadPage";
import ReportsPage from "./pages/ReportsPage";
import ActionQueuePage from "./pages/ActionQueuePage";
import SyntheticDataPage from "./pages/SyntheticDataPage";
import AuthPage from "./pages/AuthPage";
import SettingsPage from "./pages/SettingsPage";
import SingleProviderCheckPage from "./pages/SingleProviderCheckPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <NavigationTabs />
      <main className="content-container flex-1">
        {children}
      </main>
      <Footer />
    </div>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
            <Route path="/settings" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
