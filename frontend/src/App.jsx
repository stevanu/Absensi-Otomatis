import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import AppLayout from './layout/AppLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AIAssistant from './pages/AIAssistant.jsx';
import Devices from './pages/Devices.jsx';
import Attendance from './pages/Attendance.jsx';
import Timesheet from './pages/Timesheet.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import EntityPage from './pages/EntityPage.jsx';
import ENTITIES from './lib/entities.js';

function EntityRoute() {
  const { entity } = useParams();
  if (!ENTITIES[entity]) return <Navigate to="/" replace />;
  return <EntityPage entityKey={entity} />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/devices" element={<Devices />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/timesheet" element={<Timesheet />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/e/:entity" element={<EntityRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
