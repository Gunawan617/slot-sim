import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import FortuneGems from './pages/FortuneGems';
import MythicLightning from './pages/MythicLightning';
import Wallet from './pages/Wallet';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/fortune-gems"
            element={
              <PrivateRoute>
                <FortuneGems />
              </PrivateRoute>
            }
          />
          <Route
            path="/mythic-lightning"
            element={
              <PrivateRoute>
                <MythicLightning />
              </PrivateRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <PrivateRoute>
                <Wallet />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
