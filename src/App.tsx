import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import PasswordResetPage from "@/pages/PasswordResetPage";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UserDashboard from "@/pages/UserDashboard";
import ContentLibrary from "@/pages/ContentLibrary";
import ReelDetail from "@/pages/ReelDetail";
import UploadReel from "@/pages/UploadReel";
import EditReel from "@/pages/EditReel";
import CourseBuilder from "@/pages/CourseBuilder";
import QuizPage from "@/pages/QuizPage";
import CheckoutPage from "@/pages/CheckoutPage";
import TransactionHistory from "@/pages/TransactionHistory";
import AdminDashboard from "@/pages/AdminDashboard";
import UserManagement from "@/pages/UserManagement";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import HelpPage from "@/pages/HelpPage";
import NotFoundPage from "@/pages/NotFoundPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/reset-password" element={<PasswordResetPage />} />
          
          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<UserDashboard />} />
            <Route path="library" element={<ContentLibrary />} />
            <Route path="reel/:id" element={<ReelDetail />} />
            <Route path="upload" element={<UploadReel />} />
            <Route path="reel/:id/edit" element={<EditReel />} />
            <Route path="courses" element={<CourseBuilder />} />
            <Route path="quiz/:id" element={<QuizPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="transactions" element={<TransactionHistory />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
          </Route>
          
          {/* Admin routes */}
          <Route path="/admin" element={<DashboardLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
