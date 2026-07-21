import { BrowserRouter, Routes, Route } from "react-router-dom";

//  Layouts ────────────────────────────────────────────────────────────────────
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";

// ── Route guards ───────────────────────────────────────────────────────────────
import ProtectedRoute from "./ProtectedRoute";
import PlatformAdminRoute from "./PlatformAdminRoute";
import LandingRedirect from "./LandingRedirect";

// ── Public pages ───────────────────────────────────────────────────────────────
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import PasswordRecoveryPage from "../pages/PasswordRecoveryPage";
import CommunityDetailPage from "../pages/CommunityDetailPage";

// ── Authenticated pages ────────────────────────────────────────────────────────
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
        {/* ── Root URL ──────────────────────────────────────────────────────────
            LandingRedirect checks auth state:
            — Authenticated → navigate to /home
            — Unauthenticated → render LandingPage inside LandingLayout
            LandingLayout and LandingPage are rendered inside LandingRedirect
            itself, not here, because the layout depends on the auth check.
            LLD Section 10: "LandingLayout or redirect"
        ──────────────────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingRedirect />} />

        {/* ── Auth routes ───────────────────────────────────────────────────────
            Wrapped in AuthLayout (centered form layout with Watchly logo).
            No authentication required — logged-out users need these pages.
            /signup accepts optional ?community=slug query parameter.
            LLD Section 10: AuthLayout, No auth required.
        ──────────────────────────────────────────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
        </Route>

        {/* ── Public community detail ───────────────────────────────────────────
            No layout wrapper. Standalone public page.
            Serves three entry points: invite links (Path C), landing page
            community card taps (Path A), and direct URL navigation.
            Unauthenticated users see "Get Started" → /signup?community=slug.
            Authenticated non-members see "Join" button.
            Authenticated members see "Copy Link" and "Go to Feed".
            LLD Section 10: "None (standalone)", No auth required.
        ──────────────────────────────────────────────────────────────────── */}
        <Route path="/c/:slug" element={<CommunityDetailPage />} />

        {/* ── Protected routes ──────────────────────────────────────────────────
            ProtectedRoute checks AuthContext:
            — loading = true → full-page spinner (prevents flash of login)
            — user exists → render Outlet (AppLayout + child page)
            — user is null → navigate to /login with replace
            Every authenticated page lives inside this wrapper.
            LLD Section 10: AppLayout, Yes (ProtectedRoute).
        ──────────────────────────────────────────────────────────────────── */}
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

            {/* ── Admin routes ────────────────────────────────────────────────
                Authenticated via ProtectedRoute above.
                Additional isAdmin check happens inside AdminQueuePage and
                AdminReviewPage themselves — if CommunityContext.isAdmin is
                false, the page redirects to /home.
                LLD Section 10: Yes (+ isAdmin in active community).
            ────────────────────────────────────────────────────────────────── */}
            <Route path="/admin/queue" element={<AdminQueuePage />} />
            <Route path="/admin/review/:id" element={<AdminReviewPage />} />

            {/* ── Platform Admin route ────────────────────────────────────────
                Authenticated via ProtectedRoute above.
                PlatformAdminRoute adds a second check: isPlatformAdmin.
                If true → renders PlatformAdminPage directly.
                If false → redirects to /home.
                Separate from the isAdmin community role check above.
                LLD Section 10: Yes (PlatformAdminRoute).
            ────────────────────────────────────────────────────────────────── */}
            <Route path="/platform-admin" element={<PlatformAdminRoute />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
