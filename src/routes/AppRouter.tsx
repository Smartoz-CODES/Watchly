import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import ProtectedRoute from "./ProtectedRoute";
import PlatformAdminRoute from "./PlatformAdminRoute";
import LandingRedirect from "./LandingRedirect";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const SignupPage = lazy(() => import("../pages/SignupPage"));
const PasswordRecoveryPage = lazy(
  () => import("../pages/PasswordRecoveryPage"),
);
const CommunityDetailPage = lazy(() => import("../pages/CommunityDetailPage"));

// Authenticated pages
const HomeFeedPage = lazy(() => import("../pages/HomeFeedPage"));
const MyReportPage = lazy(() => import("../pages/MyReportPage"));
const CommunitySearchPage = lazy(() => import("../pages/CommunitySearchPage"));
const ReportIncidentPage = lazy(() => import("../pages/ReportIncidentPage"));
const IncidentDetailPage = lazy(() => import("../pages/IncidentDetailPage"));
const AlertFeedPage = lazy(() => import("../pages/AlertFeedPage"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const CommunityInfoPage = lazy(() => import("../pages/CommunityInfoPage"));
const AdminQueuePage = lazy(() => import("../pages/AdminQueuePage"));
const AdminReviewPage = lazy(() => import("../pages/AdminReviewPage"));
const PlatformAdminPage = lazy(() => import("../pages/PlatformAdminPage"));

const RouteFallback = () => <div>Loading…</div>;

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
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

          {/* Protected routes — ProtectedRoute is the only gate here now,
              nothing bypasses it. The dev-preview mechanism that used to
              sit in this file was always marked temporary, in its own
              comments, and has been removed for the push to main. */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {/* Core authenticated pages */}
              <Route path="/home" element={<HomeFeedPage />} />
              <Route path="/my-report" element={<MyReportPage />} />
              <Route path="/communities" element={<CommunitySearchPage />} />
              <Route path="/report" element={<ReportIncidentPage />} />
              <Route path="/incidents/:id" element={<IncidentDetailPage />} />
              <Route path="/alerts" element={<AlertFeedPage />} />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/community-info" element={<CommunityInfoPage />} />

              {/* Admin routes */}
              <Route path="/admin/queue" element={<AdminQueuePage />} />
              <Route path="/admin/review/:id" element={<AdminReviewPage />} />

              {/* Platform Admin route */}
              <Route element={<PlatformAdminRoute />}>
                <Route path="/platform-admin" element={<PlatformAdminPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;