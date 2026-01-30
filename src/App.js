// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import './App.css';

// Layout and Pages
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Placeholder pages for other routes
const Calls = () => <div className="page">Calls Page</div>;
const Agents = () => <div className="page">Agents Page</div>;
const Queues = () => <div className="page">Queues Page</div>;
const Contacts = () => <div className="page">Contacts Page</div>;
const Campaigns = () => <div className="page">Campaigns Page</div>;
const Recordings = () => <div className="page">Recordings Page</div>;
const Reports = () => <div className="page">Reports Page</div>;
const IVR = () => <div className="page">IVR Page</div>;
const Settings = () => <div className="page">Settings Page</div>;

// Private Route Component
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  return token ? children : <Navigate to="/login" />;
};

// Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />

            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/calls" element={
                <PrivateRoute>
                  <Layout>
                    <Calls />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/agents" element={
                <PrivateRoute>
                  <Layout>
                    <Agents />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/queues" element={
                <PrivateRoute>
                  <Layout>
                    <Queues />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/contacts" element={
                <PrivateRoute>
                  <Layout>
                    <Contacts />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/campaigns" element={
                <PrivateRoute>
                  <Layout>
                    <Campaigns />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/recordings" element={
                <PrivateRoute>
                  <Layout>
                    <Recordings />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/reports" element={
                <PrivateRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/ivr" element={
                <PrivateRoute>
                  <Layout>
                    <IVR />
                  </Layout>
                </PrivateRoute>
              } />

              <Route path="/settings" element={
                <PrivateRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </PrivateRoute>
              } />
            </Routes>
          </div>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;