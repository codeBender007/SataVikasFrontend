import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import Sidebar from './Sidebar';
import UploadModal from '../upload/UploadModal';
import ToolHandoverUploadModal from '../upload/ToolHandoverUploadModal';
import RecentEntriesModal from '../dashboard/RecentEntriesModal';
import { Menu, Sun, Moon, Bell } from 'lucide-react';

export default function AppLayout() {
  const { isDark, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [showUpload, setShowUpload] = useState(false);
  const [showToolHandoverUpload, setShowToolHandoverUpload] = useState(false);
  const [showRecentEntries, setShowRecentEntries] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  return (
    <div className="app-shell bg-slate-50 dark:bg-slate-950 flex flex-col min-h-screen transition-colors duration-300">
      {/* ── TOP HEADER ───────────────────────────────────── */}
      <header
        className={`fixed top-0 right-0 left-0 z-30 bg-white/80 dark:bg-slate-950/75 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 ${
          isCollapsed ? 'lg:left-[80px]' : 'lg:left-[296px]'
        }`}
      >
        <div className="flex items-center justify-between px-4 lg:px-8 h-[74px]">
          {/* Left: hamburger + brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-[100px] items-center rounded-xl bg-white px-1 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-100 dark:ring-slate-700">
                <img src={`${import.meta.env.BASE_URL}sata-vikas-logo.svg`} alt="Sata Vikas" className="h-7 w-full object-contain" />
              </div>
            </div>
            <div className="hidden lg:block pl-1">
              <h1 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 leading-tight">Production &amp; TPM Tracker</h1>
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-[0.12em] mt-1">Sata Vikas India Pvt Ltd</p>
            </div>
          </div>

          {/* Right: notifications and theme toggle */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:grid relative h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300" title="Notifications">
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-800" />
            </button>
            {/* Theme Switcher Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all duration-300 cursor-pointer shadow-inner flex items-center gap-1.5"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <>
                  <Sun size={18} className="text-amber-400 animate-spin-slow" />
                  <span className="hidden md:inline text-xs font-semibold text-amber-300">Light</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-indigo-600" />
                  <span className="hidden md:inline text-xs font-semibold text-slate-700">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── BODY: SIDEBAR + MAIN ──────────────────────────── */}
      <div className="flex flex-1 pt-[74px]">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          onUpload={() => setShowUpload(true)}
          onToolHandoverUpload={() => setShowToolHandoverUpload(true)}
          onRecentEntries={() => setShowRecentEntries(true)}
        />
        <main
          className={`flex-1 overflow-y-auto p-4 lg:p-7 bg-slate-50/35 dark:bg-slate-950/25 min-h-[calc(100vh-74px)] transition-all duration-300 ${
            isCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[296px]'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {showRecentEntries && (
        <RecentEntriesModal
          onClose={() => setShowRecentEntries(false)}
        />
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSubmitted={() => {
            setShowUpload(false);
            window.dispatchEvent(new Event('production-log-submitted'));
          }}
        />
      )}
      {showToolHandoverUpload && (
        <ToolHandoverUploadModal
          onClose={() => setShowToolHandoverUpload(false)}
          onSubmitted={() => {
            setShowToolHandoverUpload(false);
            window.dispatchEvent(new Event('production-log-submitted'));
          }}
        />
      )}
    </div>
  );
}
