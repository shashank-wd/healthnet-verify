import { NavLink } from '@/components/NavLink';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Upload,
  FileText,
  ListTodo,
  Database,
  UserCheck
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/providers', label: 'Providers', icon: Users },
  { to: '/validate', label: 'Validate Provider', icon: UserCheck },
  { to: '/upload', label: 'Upload', icon: Upload },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/queue', label: 'Action Queue', icon: ListTodo },
  { to: '/synthetic', label: 'Test Data', icon: Database },
];

interface NavigationTabsProps {
  className?: string;
}

export function NavigationTabs({ className }: NavigationTabsProps) {
  return (
    <nav
      className={cn(
        'flex items-center gap-1 overflow-x-auto px-4 py-2 border-b border-border bg-card/50',
        className
      )}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground whitespace-nowrap"
            activeClassName="bg-primary/10 text-primary"
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
