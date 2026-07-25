import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import PlatformAdminRoute from "./PlatformAdminRoute";
import LandingRedirect from "./LandingRedirect";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import PasswordRecoveryPage from "../pages/PasswordRecoveryPage";
import CommunityDetailPage from "../pages/CommunityDetailPage";
// ── Authenticated pages
import HomeFeedPage from "../pages/HomeFeedPage";
import CommunitySearchPage from "../pages/CommunitySearchPage";
import CommunityRequestPage from "../pages/CommunityRequestPage";
import ReportIncidentPage from "../pages/ReportIncidentPage";
import IncidentDetailPage from "../pages/IncidentDetailPage";
import AlertFeedPage from "../pages/AlertFeedPage";
import ProfilePage from "../pages/ProfilePage";
import AdminQueuePage from "../pages/AdminQueuePage";
import AdminReviewPage from "../pages/AdminReviewPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root URL */}
        <Route path="/" element={<LandingRedirect />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
        </Route>

        {/* Public community detail */}
        <Route path="/c/:slug" element={<CommunityDetailPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Core authenticated pages */}
            <Route path="/home" element={<HomeFeedPage />} />
            <Route path="/communities" element={<CommunitySearchPage />} />
            <Route
              path="/communities/request"
              element={<CommunityRequestPage />}
            />
            <Route path="/report" element={<ReportIncidentPage />} />
            <Route path="/incidents/:id" element={<IncidentDetailPage />} />
            <Route path="/alerts" element={<AlertFeedPage />} />

            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin routes */}
            <Route path="/admin/queue" element={<AdminQueuePage />} />
            <Route path="/admin/review/:id" element={<AdminReviewPage />} />

            {/* Platform Admin route */}
            <Route path="/platform-admin" element={<PlatformAdminRoute />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
