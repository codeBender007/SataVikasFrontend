import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  X,
  Upload,
  ClipboardPenLine,
  Clock,
  ChevronRight,
  LogOut,
  Shield,
  User,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';


export default function Sidebar({
  open,
  onClose,
  isCollapsed,
  onToggleCollapse,
  onUpload,
  onToolHandoverUpload,
  onRecentEntries
}) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full bg-white dark:bg-slate-950 flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 shadow-xl backdrop-blur-2xl
                    transform transition-all duration-300 ease-in-out overflow-x-hidden
                    lg:translate-x-0 lg:shadow-none
                    ${open ? 'translate-x-0' : '-translate-x-full'}
                    ${isCollapsed ? 'lg:w-[80px]' : 'lg:w-[296px]'}`}
      >
        {/* Logo Section */}
        <div
          className={`flex items-center border-b border-slate-100 dark:border-slate-800/80 shrink-0 transition-all duration-300 ${
            isCollapsed
              ? 'lg:px-3 lg:py-4 justify-between lg:justify-center flex-col gap-3 p-4'
              : 'px-5 py-5 justify-between p-4'
          }`}
        >
          {isCollapsed ? (
            /* Collapsed Logo view (desktop) / full view on mobile */
            <>
              {/* Mobile: Full logo + close button */}
              <div className="flex items-center justify-between w-full lg:hidden">
                <div className="flex h-12 items-center">
                  <img src={`${import.meta.env.BASE_URL}sata-vikas-logo-transparent.png`} alt="Sata Vikas" className="h-12 w-auto object-contain" />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Desktop Collapsed: Emblem + Toggle Button */}
              <div className="hidden lg:flex flex-col items-center gap-3 w-full">
                <div className="group relative flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 shadow-sm p-1.5 hover:scale-105 transition-transform">
                  <img src={`${import.meta.env.BASE_URL}sata-vikas-logo-transparent.png`} alt="Sata Vikas" className="h-8 w-8 object-contain" />
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Sata Vikas India
                  </span>
                </div>

                {/* Desktop Collapse Toggle Button */}
                <button
                  onClick={onToggleCollapse}
                  className="p-2 rounded-xl bg-slate-100/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm group relative"
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                >
                  <PanelLeftOpen size={18} className="transition-transform group-hover:translate-x-0.5" />
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Expand sidebar
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* Expanded Logo view */
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-14 items-center justify-start rounded-xl p-1 transition-transform">
                  <img
                    src={`${import.meta.env.BASE_URL}sata-vikas-logo-transparent.png`}
                    alt="Sata Vikas"
                    className="h-12 max-w-[200px] w-auto object-contain drop-shadow-sm"
                  />
                </div>
              </div>

              {/* Action buttons on header right */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Desktop Collapse Toggle Button */}
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:flex p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm group relative"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose size={18} className="transition-transform group-hover:-translate-x-0.5" />
                  <span className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Collapse sidebar
                  </span>
                </button>

                {/* Mobile Close Button */}
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-6 space-y-7">
          {/* MAIN */}
          <div>
            {!isCollapsed ? (
              <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-opacity">
                Main Navigation
              </p>
            ) : (
              <div className="h-[1px] bg-slate-200/70 dark:bg-slate-800/70 my-2 mx-2 hidden lg:block" />
            )}

            <nav className="space-y-1.5">
              <NavLink
                to="/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative
                  ${
                    isCollapsed
                      ? 'lg:justify-center lg:px-0 lg:py-3 px-3 py-2.5'
                      : 'px-3 py-2.5'
                  }
                  ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <LayoutDashboard size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="truncate">Dashboard Overview</span>}
                {isCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Dashboard Overview
                  </span>
                )}
              </NavLink>

              {isAdmin && (
                <NavLink
                  to="/users"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer group relative
                    ${
                      isCollapsed
                        ? 'lg:justify-center lg:px-0 lg:py-3 px-3 py-2.5'
                        : 'px-3 py-2.5'
                    }
                    ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-semibold shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
                  }
                >
                  <Users size={20} className="shrink-0 transition-transform group-hover:scale-110" />
                  {!isCollapsed && <span className="truncate">User Management</span>}
                  {isCollapsed && (
                    <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                      User Management
                    </span>
                  )}
                </NavLink>
              )}
            </nav>
          </div>

          {/* QUICK ACTIONS */}
          <div>
            {!isCollapsed ? (
              <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-opacity">
                Quick Actions
              </p>
            ) : (
              <div className="h-[1px] bg-slate-200/70 dark:bg-slate-800/70 my-2 mx-2 hidden lg:block" />
            )}

            <div className={isCollapsed ? 'lg:flex lg:flex-col lg:items-center lg:gap-2.5 space-y-3 lg:space-y-0' : 'space-y-3'}>
              {/* Action 1 */}
              <button
                type="button"
                onClick={() => {
                  onUpload?.();
                  onClose?.();
                }}
                className={`text-left rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-500/5 transition-all group cursor-pointer relative ${
                  isCollapsed
                    ? 'lg:w-12 lg:h-12 lg:p-0 lg:flex lg:items-center lg:justify-center w-full p-3.5 flex items-start gap-3'
                    : 'w-full flex items-start gap-3 p-3.5'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                  <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">Hourly Production Monitoring </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1 truncate">(Page - A)</p>
                  </div>
                )}
                {isCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Upload Form Photo
                  </span>
                )}
              </button>

              {/* Action 2 */}
              <button
                type="button"
                onClick={() => {
                  onToolHandoverUpload?.();
                  onClose?.();
                }}
                className={`text-left rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200/70 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-md hover:shadow-teal-500/5 transition-all group cursor-pointer relative ${
                  isCollapsed
                    ? 'lg:w-12 lg:h-12 lg:p-0 lg:flex lg:items-center lg:justify-center w-full p-3.5 flex items-start gap-3'
                    : 'w-full flex items-start gap-3 p-3.5'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500 dark:bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
                  <ClipboardPenLine size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">First Operation Part </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1 truncate">(FOP) Record (Page - B)</p>
                  </div>
                )}
                {isCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Tool &amp; Handover Form
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* SHORTCUTS */}
          <div>
            {!isCollapsed ? (
              <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 transition-opacity">
                Shortcuts
              </p>
            ) : (
              <div className="h-[1px] bg-slate-200/70 dark:bg-slate-800/70 my-2 mx-2 hidden lg:block" />
            )}

            <div className={isCollapsed ? 'lg:flex lg:justify-center' : ''}>
              <button
                type="button"
                onClick={() => {
                  onRecentEntries?.();
                  onClose?.();
                }}
                className={`rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors group cursor-pointer relative ${
                  isCollapsed
                    ? 'lg:w-11 lg:h-11 lg:p-0 lg:flex lg:items-center lg:justify-center w-full flex items-center justify-between p-2.5'
                    : 'w-full flex items-center justify-between p-2.5'
                }`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? 'lg:justify-center' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Clock size={18} />
                  </div>
                  {!isCollapsed && (
                    <div>
                      <h4 className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                        Recent Entries
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">View last submitted forms</p>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <ChevronRight size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                )}
                {isCollapsed && (
                  <span className="hidden lg:block absolute left-full ml-3 px-2.5 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                    Recent Entries
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* FIXED / STICKY BOTTOM USER & SIGN OUT SECTION */}
        <div className={`shrink-0 border-t border-slate-200/70 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/60 transition-all ${
          isCollapsed ? 'p-2.5 lg:p-2' : 'p-4 space-y-3'
        }`}>
          {isCollapsed ? (
            /* Collapsed Bottom User Section */
            <div className="hidden lg:flex lg:flex-col lg:items-center lg:gap-2">
              <div className="group relative flex items-center justify-center">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-sm font-semibold text-xs cursor-pointer hover:scale-105 transition-transform">
                  {isAdmin ? <Shield size={18} /> : <User size={18} />}
                </div>
                <span className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                  {user?.fullName || 'User'} ({isAdmin ? 'Admin' : 'Employee'})
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose?.();
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer group relative"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-rose-600 text-white text-xs font-medium rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 shadow-lg">
                  Sign Out
                </span>
              </button>
            </div>
          ) : null}

          {/* Full / Mobile User Section */}
          <div className={isCollapsed ? 'block lg:hidden space-y-3' : 'space-y-3'}>
            {/* User Info Header */}
            <div className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shrink-0 shadow-sm font-semibold text-xs">
                  {isAdmin ? <Shield size={15} /> : <User size={15} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user?.fullName || 'User'}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 capitalize truncate">
                    {user?.role || 'Employee'}
                  </p>
                </div>
              </div>
              <span
                className={
                  isAdmin
                    ? 'badge-admin text-[10px] px-2 py-0.5 shrink-0'
                    : 'badge-employee text-[10px] px-2 py-0.5 shrink-0'
                }
              >
                {isAdmin ? 'Admin' : 'Employee'}
              </span>
            </div>

            {/* Sign Out Option */}
            <div className="pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer text-left group"
              >
                <LogOut
                  size={16}
                  className="text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
                />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
