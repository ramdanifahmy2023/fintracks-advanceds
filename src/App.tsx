
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Basic pages without complex dependencies
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import Layout from './components/Layout';

// Remove ALL problematic imports temporarily
// NO Toaster, NO ThemeProvider, NO complex providers

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <Layout>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/upload"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Upload Data</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/manual-input"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Input Manual</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/analytics"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Analytics</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Products</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/stores"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Stores</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">User Management</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
          <Route
            path="/settings"
            element={
              <Layout>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">Settings</h1>
                  <p className="text-gray-600 mt-2">Coming soon...</p>
                </div>
              </Layout>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
