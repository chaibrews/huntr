import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./context/AuthContext";
import BoardPage from "./features/board/BoardPage";
import CalendarPage from "./features/calendar/CalendarPage";
import AnalyticsPage from "./features/analytics/AnalyticsPage";
import ProfilePage from "./features/profile/ProfilePage";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ApplicationDetail from "./features/applications/ApplicationDetail";
import FullPageLoader from "./components/FullPageLoader";

// Wraps any route that requires login.
// If loading, show full page loader.
// If no user, redirect to /login.
// If user exists, render the page normally.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthContext();

  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Board (Dashboard) */}
        <Route
          index
          element={
            <ProtectedRoute>
              <BoardPage />
            </ProtectedRoute>
          }
        />

        {/* Application Detail View */}
        <Route
          path="/applications/:id"
          element={
            <ProtectedRoute>
              <ApplicationDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
