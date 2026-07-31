// import { lazy } from "react";
// import { Navigate } from "react-router-dom";
// import { useAuth } from "../hooks/use-auth";

// const LandingPage = lazy(() => import("../pages/LandingPage"));
// const LandingLayout = lazy(() => import("../layouts/LandingLayout"));

// // LandingRedirect

// export default function LandingRedirect() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return null;
//   }

//   if (user) {
//     return <Navigate to="/home" replace />;
//   }

//   return (
//     <LandingLayout>
//       <LandingPage />
//     </LandingLayout>
//   );
// }
import { lazy } from "react";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const LandingLayout = lazy(() => import("../layouts/LandingLayout"));

export default function LandingRedirect() {
  return (
    <LandingLayout>
      <LandingPage />
    </LandingLayout>
  );
}
