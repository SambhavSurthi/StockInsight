import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, Sparkles, ListChecks, LineChart, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/portfolio', label: 'Portfolio', icon: FolderKanban },
  { to: '/future-analysis', label: 'Future', icon: Sparkles },
  { to: '/categories', label: 'Categories', icon: ListChecks },
  { to: '/my-companies', label: 'List', icon: ListChecks },
  { to: '/compare', label: 'Compare', icon: LineChart },
];

const AppShell = () => {

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/10 lg:flex fixed inset-y-0 left-0 z-50">
        <div className="flex h-14 items-center border-b px-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              SI
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">StockInsight</span>
              <span className="text-[11px] text-muted-foreground">Personal stock tracker</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t p-4">
          <div className="flex items-center justify-between">
             <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`
              }
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </NavLink>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex w-full min-w-0 flex-1 flex-col transition-all duration-300 lg:pl-64">
        {/* Top app bar - Mobile only (mostly) or adjusted for desktop */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
              SI
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">StockInsight</span>
              <span className="text-[11px] text-muted-foreground">Personal stock tracker</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `inline-flex items-center justify-center rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm transition hover:bg-accent hover:text-accent-foreground ${
                  isActive ? 'bg-accent text-accent-foreground' : ''
                }`
              }
            >
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="ml-1.5 hidden sm:inline">Profile</span>
            </NavLink>
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop Top Bar (Optional - mostly for title or breadcrumbs if we wanted, currently reusing mobile header logic or just simpler padding) */}
        {/* For now, simplified: On desktop, we have sidebar, so we just need Main Content area. */}

        {/* Main content */}
        <main className="flex-1 px-3 pb-20 pt-3 sm:px-4 sm:pb-4 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        {/* Bottom nav for mobile - Hidden on LG */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-2 py-1 backdrop-blur-md sm:mt-2 sm:flex sm:justify-center lg:hidden">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-1 sm:justify-center sm:gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={({ isActive }) =>
                    [
                      'flex flex-1 flex-col items-center justify-center rounded-full px-2 py-1 text-[10px] font-medium transition sm:flex-none sm:flex-row sm:gap-1 sm:px-3 sm:text-xs',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    ].join(' ')
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span className="mt-0.5 sm:mt-0">{tab.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AppShell;


