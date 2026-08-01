import { Suspense, lazy } from "react";
import type { ComponentType } from "react";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
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
const AdminPage = lazy(() => import("../pages/AdminPage"));

const RouteFallback = () => <div>Loading...</div>;

const DEV_PAGE_MAP: Record<string, ComponentType> = {
  homefeedpage: HomeFeedPage,
  myreportpage: MyReportPage,
  communitysearchpage: CommunitySearchPage,
  reportincidentpage: ReportIncidentPage,
  incidentdetailpage: IncidentDetailPage,
  alertfeedpage: AlertFeedPage,
  profilepage: ProfilePage,
  settingspage: SettingsPage,
  communityinfopage: CommunityInfoPage,
  adminqueuepage: AdminQueuePage,
  adminreviewpage: AdminReviewPage,
  platformadminpage: PlatformAdminPage,
};

const DevPreviewRoute = () => {
  const { pageName } = useParams();
  const Component = pageName ? DEV_PAGE_MAP[pageName.toLowerCase()] : undefined;

  if (!Component) {
    return (
      <div style={{ padding: "2rem", fontFamily: "monospace" }}>
        <p>No page found for "{pageName}".</p>
        <p>Available: {Object.keys(DEV_PAGE_MAP).join(", ")}</p>
      </div>
    );
  }

  return <Component />;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<LandingRedirect />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
          </Route>

          <Route path="/c/:slug" element={<CommunityDetailPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/dev/preview/login" element={<LoginPage />} />
            <Route path="/dev/preview/signup" element={<SignupPage />} />
            <Route
              path="/dev/preview/forgot-password"
              element={<PasswordRecoveryPage />}
            />
          </Route>
          <Route
            path="/dev/preview/community-detail"
            element={<CommunityDetailPage />}
          />
          <Route element={<AppLayout />}>
            <Route
              path="/dev/preview/:pageName"
              element={<DevPreviewRoute />}
            />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<HomeFeedPage />} />
              <Route path="/my-report" element={<MyReportPage />} />
              <Route path="/communities" element={<CommunitySearchPage />} />
              <Route path="/report" element={<ReportIncidentPage />} />
              <Route path="/incidents/:id" element={<IncidentDetailPage />} />
              <Route path="/alerts" element={<AlertFeedPage />} />

              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/community-info" element={<CommunityInfoPage />} />

              <Route path="/admin/queue" element={<AdminQueuePage />} />
              <Route path="/admin/review/:id" element={<AdminReviewPage />} />

              <Route element={<PlatformAdminRoute />}>
                <Route path="/platform-admin" element={<AdminPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
