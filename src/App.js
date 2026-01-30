// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import './App.css';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calls from './pages/Calls';
import Agents from './pages/Agents';
import Queues from './pages/Queues';
import Contacts from './pages/Contacts';
import Campaigns from './pages/Campaigns';
import Recordings from './pages/Recordings';
import Reports from './pages/Reports';
import IVR from './pages/IVR';
import Settings from './pages/Settings';
import Layout from './components/Layout';

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
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
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