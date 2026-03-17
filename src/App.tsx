import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import PeopleNotes from './pages/PeopleNotes';
import Gallery from './pages/Gallery';
import Missions from './pages/Missions';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ActivateAccount from './pages/ActivateAccount';
import SharedJourney from './pages/SharedJourney';
import useAuthStore from './stores/authStore';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy-load heavy pages to prevent startup crashes
const ContentExport = lazy(() => import('./pages/ContentExport'));
const Templates = lazy(() => import('./pages/Templates'));
const TemplateBuilder = lazy(() => import('./pages/TemplateBuilder'));
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Routes>
        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Welcome />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/pricing" element={<Pricing />} />
        </Route>

        {/* Shared journey (public, no auth needed) */}
        <Route path="/share/:code" element={<SharedJourney />} />
        
        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/tasks" 
            element={isAuthenticated ? <TaskList /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/missions" 
            element={isAuthenticated ? <Missions /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/people" 
            element={isAuthenticated ? <PeopleNotes /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/export" 
            element={isAuthenticated ? <ContentExport /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/gallery" 
            element={isAuthenticated ? <Gallery /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/templates" 
            element={isAuthenticated ? <Templates /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/templates/:type" 
            element={isAuthenticated ? <TemplateBuilder /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <Admin />
              </ProtectedRoute>
            } 
          />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;