
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import PeopleNotes from './pages/PeopleNotes';
import ContentExport from './pages/ContentExport';
import Gallery from './pages/Gallery';
import Missions from './pages/Missions';
import Templates from './pages/Templates';
import TemplateBuilder from './pages/TemplateBuilder';
import Pricing from './pages/Pricing';
import NotFound from './pages/NotFound';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import ActivateAccount from './pages/ActivateAccount';
import useAuthStore from './stores/authStore';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<ActivateAccount />} />
        <Route 
          path="/pricing" 
          element={
            user?.email === 'cam@dollen.com' 
              ? <Navigate to="/dashboard\" replace /> 
              : <Pricing />
          } 
        />
      </Route>
      
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
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;