import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';          // ❌ Antes: './components/Login'
import Register from './Register';    // ❌ Antes: './components/Register'
import Dashboard from './components/Dashboard/Dashboard';
import ProjectDetail from './components/ProjectDetail/ProjectDetail';
import Projects from './Projects';
import { MenuProvider } from './context/MenuContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <MenuProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/project/:projectId" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <ProjectDetail />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <Login onLogin={() => setIsAuthenticated(true)} />
          } />
          <Route path="/register" element={
            <Register onLogin={() => setIsAuthenticated(true)} />
          } />
          <Route path="/financiero" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/tecnico" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/juridico" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/adaptaciones" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/comercializacion" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/compraventas" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/aportacion" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/patrimonial" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/asociacion" element={
            <ProtectedRoute isAuthenticated={() => isAuthenticated}>
              <Projects />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </MenuProvider>
  );
}

export default App;