import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TodoApp } from "./components/TodoApp";
import { WorkDashboard } from "./components/WorkDashboard";
import { BackupManager } from "./components/BackupManager";
import { Navigation } from "./components/Navigation";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppSettingsProvider } from "./contexts/AppSettingsContext";

function App() {
  return (
    <ThemeProvider>
      <AppSettingsProvider>
        <BrowserRouter basename="/MyDashboard">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <Routes>
              <Route path="/" element={<TodoApp />} />
              <Route path="/dashboard" element={<WorkDashboard />} />
              <Route path="/backups" element={<BackupManager />} />
            </Routes>
          </div>
        </BrowserRouter>
      </AppSettingsProvider>
    </ThemeProvider>
  );
}

export default App;
