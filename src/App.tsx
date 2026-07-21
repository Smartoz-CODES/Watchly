import { ToastProvider } from "./context/ToastProvider";
import { AuthProvider } from "./context/AuthProvider";
import { CommunityProvider } from "./context/CommunityProvider";
import AppRouter from "./routes/AppRouter";
import Toast from "./components/Toast/Toast";

// ─── Provider order matters ────────────────────────────────────────────────────
//
// ToastContext.Provider — outermost. Wraps everything including AuthProvider
// so that auth methods (signIn, signUp, deleteAccount) can call
// useToast().showToast() when errors occur. If ToastProvider were inside
// AuthProvider, the auth context would mount before Toast is available
// and the first showToast call would throw "useToast must be used inside
// ToastProvider."
//
// AuthContext.Provider — second. Wraps CommunityProvider and AppRouter
// because CommunityProvider needs to know the current user (to fetch their
// community memberships) and every page needs access to the auth session.
//
// CommunityContext.Provider — third. Wraps AppRouter only. The active
// community scopes the feed, reporting, and admin views. It sits inside
// AuthProvider because it depends on the authenticated user to make its
// Supabase queries.
//
// AppRouter — innermost. All routes render inside all three providers,
// so every page component can consume any context without restriction.
//
// Toast — rendered inside ToastContext.Provider but alongside AppRouter
// (not inside it) so it sits outside all layout wrappers and appears
// on every page regardless of which route is active. It reads from
// ToastContext and renders the notification at the app root level.
//
// LLD Section 4 (Component Hierarchy):
// App
//   ToastContext.Provider
//     AuthContext.Provider
//       CommunityContext.Provider
//         AppRouter
//       Toast   ← alongside AppRouter, inside all three providers

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CommunityProvider>
          <AppRouter />
          <Toast />
        </CommunityProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
