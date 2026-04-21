import { type ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

interface AppLayoutProps {
  children: ReactNode;
}

const STORAGE_KEY = 'rnec.sidebar.collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);

  const handleToggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  };

  return (
    <main className="flex h-svh w-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <section className="hidden lg:flex lg:shrink-0" aria-hidden="false">
        <AppSidebar collapsed={collapsed} onToggle={handleToggle} />
      </section>

      {/* Content column */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <AppHeader />

        {/* Page content */}
        <section className="flex-1 overflow-y-auto" aria-label="Page content">
          {children}
        </section>
      </section>
    </main>
  );
}
