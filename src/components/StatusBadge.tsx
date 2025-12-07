import { Badge } from '@/components/ui/badge';
import { ProviderStatus } from '@/types/provider';
import { CheckCircle2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ProviderStatus;
  showIcon?: boolean;
  className?: string;
}

const statusConfig = {
  validated: {
    label: 'Validated',
    variant: 'validated' as const,
    icon: CheckCircle2,
  },
  updated: {
    label: 'Updated',
    variant: 'updated' as const,
    icon: RefreshCw,
  },
  needs_review: {
    label: 'Needs Review',
    variant: 'review' as const,
    icon: AlertCircle,
  },
  pending: {
    label: 'Pending',
    variant: 'pending' as const,
    icon: Clock,
  },
};

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
}
