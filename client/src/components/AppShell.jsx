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
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top app bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background/80 px-4 py-2 backdrop-blur-md">
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

      {/* Main content */}
      <main className="flex-1 px-3 pb-16 pt-3 sm:px-4 sm:pb-4">
        <Outlet />
      </main>

      {/* Bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 px-2 py-1 backdrop-blur-md sm:static sm:mt-2 sm:flex sm:justify-center">
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
  );
};

export default AppShell;


