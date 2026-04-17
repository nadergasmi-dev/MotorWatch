import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import StartScreen from "./components/StartScreen";
import LoginScreen from "./components/LoginScreen";
import SignUpScreen from "./components/SignUpScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import VerifyResetCodeScreen from "./components/VerifyResetCodeScreen";
import MachineSetupScreen from "./components/MachineSetupScreen";
import MonitoringDashboard from "./components/MonitoringDashboard";
import History from "./components/History";
import Events from "./components/Events";
import Settings from "./components/Settings";
import OAuthCallback from "./components/OAuthCallback";
import { createClient } from "./utils/supabase/client";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set document title
  useEffect(() => {
    document.title = "MotorWatch - Industrial Motor Monitoring";
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    localStorage.removeItem("machineConfig");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#262525] flex items-center justify-center">
        <div className="text-[#FFB84E] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-[#262525]">
          <Routes>
            <Route path="/" element={<StartScreen />} />
            <Route
              path="/login"
              element={
                <LoginScreen
                  onLogin={() => setIsAuthenticated(true)}
                />
              }
            />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route path="/forgot-password" element={<ForgotPasswordScreen />} />
            <Route path="/verify-reset-code" element={<VerifyResetCodeScreen />} />
            <Route
              path="/machine-setup"
              element={
                isAuthenticated ? (
                  <MachineSetupScreen />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/monitoring"
              element={
                isAuthenticated ? (
                  <MonitoringDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <MonitoringDashboard />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/history"
              element={
                isAuthenticated ? (
                  <History />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/events"
              element={
                isAuthenticated ? (
                  <Events />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/settings"
              element={
                isAuthenticated ? (
                  <Settings onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route path="/oauth/callback" element={<OAuthCallback />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;