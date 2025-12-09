import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProviders } from '@/hooks/useProviders';
import { useNotifications } from '@/hooks/useNotifications';
import { EmailGeneratorModal } from '@/components/EmailGeneratorModal';
import { Provider } from '@/types/provider';
import {
  AlertTriangle,
  Mail,
  CheckCircle,
  Users,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ActionQueuePage() {
  const { providers, updateProviderStatus } = useProviders();
  const { addNotification } = useNotifications();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [emailProvider, setEmailProvider] = useState<Provider | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'priority' | 'impact'>('priority');

  const reviewQueue = useMemo(() => {
    return providers
      .filter((p) => p.status === 'needs_review')
      .sort((a, b) => {
        if (sortBy === 'priority') {
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.memberImpact - a.memberImpact;
      });
  }, [providers, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === reviewQueue.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(reviewQueue.map((p) => p.id)));
    }
  };

  const handleMarkComplete = (provider: Provider) => {
    updateProviderStatus(provider.id, 'validated');
    addNotification(
      'approved',
      'Provider Validated',
      `${provider.name} has been marked as validated.`,
      { id: provider.id, name: provider.name }
    );
    toast({
      title: 'Marked as complete',
      description: `${provider.name} has been validated.`,
    });
  };

  const handleBulkEmail = () => {
    const count = selectedItems.size;
    addNotification(
      'email_sent',
      'Bulk Email Sent',
      `Verification emails sent to ${count} providers.`
    );
    toast({
      title: 'Bulk email initiated',
      description: `Verification emails will be sent to ${count} providers.`,
    });
    setSelectedItems(new Set());
  };

  const handleEmailSent = (provider: Provider) => {
    addNotification(
      'email_sent',
      'Verification Email Sent',
      `Verification request sent to ${provider.name}.`,
      { id: provider.id, name: provider.name }
    );
    setEmailModalOpen(false);
  };

  const priorityConfig = {
    high: { color: 'bg-destructive text-destructive-foreground', label: 'High' },
    medium: { color: 'bg-warning text-warning-foreground', label: 'Medium' },
    low: { color: 'bg-muted text-muted-foreground', label: 'Low' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Action Queue
          </h1>
          <p className="text-muted-foreground">
            Providers requiring manual review and verification
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v: 'priority' | 'impact') => setSortBy(v)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Sort by Priority</SelectItem>
              <SelectItem value="impact">Sort by Member Impact</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            disabled={selectedItems.size === 0}
            onClick={handleBulkEmail}
          >
            <Mail className="h-4 w-4" />
            Send Bulk Email ({selectedItems.size})
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4 flex items-center gap-4 border-destructive/20 bg-destructive/5">
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{reviewQueue.filter(p => p.priority === 'high').length}</p>
            <p className="text-sm text-muted-foreground">High Priority</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4 border-warning/20 bg-warning/5">
          <div className="p-3 rounded-full bg-warning/10">
            <AlertTriangle className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{reviewQueue.filter(p => p.priority === 'medium').length}</p>
            <p className="text-sm text-muted-foreground">Medium Priority</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-muted">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold">{reviewQueue.reduce((sum, p) => sum + p.memberImpact, 0).toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total Members Impacted</p>
          </div>
        </Card>
      </div>

      {/* Queue List */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
          <Checkbox
            checked={selectedItems.size === reviewQueue.length && reviewQueue.length > 0}
            onCheckedChange={toggleSelectAll}
          />
          <span className="text-sm text-muted-foreground">
            Select all ({reviewQueue.length} items)
          </span>
        </div>

        <div className="space-y-3">
          {reviewQueue.map((provider, index) => (
            <div
              key={provider.id}
              className={cn(
                'flex items-center gap-4 p-4 rounded-lg border border-border transition-all',
                'hover:shadow-md hover:border-primary/30',
                selectedItems.has(provider.id) && 'bg-primary/5 border-primary/30',
                'animate-fade-in'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Checkbox
                checked={selectedItems.has(provider.id)}
                onCheckedChange={() => toggleSelect(provider.id)}
              />
              
              <Badge className={priorityConfig[provider.priority].color}>
                {priorityConfig[provider.priority].label}
              </Badge>

              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{provider.name}</p>
                <p className="text-sm text-muted-foreground">
                  {provider.specialty} • NPI: {provider.npi}
                </p>
              </div>

              <div className="hidden md:block text-sm">
                <p className="text-muted-foreground">Reason</p>
                <p className="font-medium">{provider.reviewReason}</p>
              </div>

              <div className="hidden md:block text-sm text-right">
                <p className="text-muted-foreground">Member Impact</p>
                <p className="font-medium">{provider.memberImpact.toLocaleString()}</p>
              </div>

              <Select defaultValue="unassigned">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Assign to" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="sarah">Sarah Johnson</SelectItem>
                  <SelectItem value="mike">Mike Williams</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEmailProvider(provider);
                    setEmailModalOpen(true);
                  }}
                >
                  <Mail className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-success hover:text-success"
                  onClick={() => handleMarkComplete(provider)}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {reviewQueue.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-success" />
              <p className="text-lg font-medium">All caught up!</p>
              <p>No providers currently require manual review.</p>
            </div>
          )}
        </div>
      </Card>

      <EmailGeneratorModal
        provider={emailProvider}
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}
