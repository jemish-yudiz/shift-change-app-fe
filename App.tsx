
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './services/api';
import { User } from './types';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ShiftActive from './pages/ShiftActive';
import History from './pages/History';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const currentUser = await api.getMe();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await api.login(email, password);
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Login failed');
      throw err; // Re-throw to be caught in Login.tsx
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) return null;

  return (
    <Router>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Layout user={user} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} />} />
            <Route path="/shift" element={<ShiftActive />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App;
