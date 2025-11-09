import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { NewSession } from './pages/NewSession';
import { History } from './pages/History';
import { Report } from './pages/Report';
import { SettingsPage } from './pages/Settings';
import { ExportPDF } from './pages/ExportPDF';

function App() {
  return (
    <Router basename="/xray-qc-pwa">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new-session" element={<NewSession />} />
        <Route path="/history" element={<History />} />
        <Route path="/report/:id" element={<Report />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/export" element={<ExportPDF />} />
      </Routes>
    </Router>
  );
}

export default App;
