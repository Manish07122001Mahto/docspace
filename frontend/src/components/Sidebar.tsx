import { Link, NavLink, useLocation } from 'react-router-dom';
import { FileText, FolderOpen, Home, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: Home },
  { label: 'Owned', href: '/dashboard?filter=owned', icon: FolderOpen },
  { label: 'Shared', href: '/dashboard?filter=shared', icon: Users },
];

export function Sidebar() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentFilter = searchParams.get('filter');

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card lg:flex lg:flex-col">
      <Link to="/dashboard" className="flex h-16 items-center gap-3 border-b px-6">
        <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <FileText className="size-5" />
        </span>
        <span className="text-lg font-semibold">Docspace</span>
      </Link>
      <nav className="space-y-1 p-4">
        {navItems.map((item) => {
          const url = new URL(item.href, window.location.origin);
          const itemFilter = url.searchParams.get('filter');
          const isItemActive = location.pathname === '/dashboard' && itemFilter === currentFilter;

          return (
            <NavLink
              key={item.label}
              to={item.href}
              className={() =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground',
                  isItemActive && 'bg-accent text-foreground',
                )
              }
            >
              <item.icon className="size-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
