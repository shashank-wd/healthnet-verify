import { useState } from 'react';
import { StatCard } from '@/components/StatCard';
import { ProviderTable } from '@/components/ProviderTable';
import { ProviderDetailModal } from '@/components/ProviderDetailModal';
import { EmailGeneratorModal } from '@/components/EmailGeneratorModal';
import { ValidationProgress } from '@/components/ValidationProgress';
import { useProviders } from '@/hooks/useProviders';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Provider } from '@/types/provider';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Upload,
  Play,
  RefreshCw,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Dashboard() {
  const {
    providers,
    stats,
    isValidating,
    validationProgress,
    currentBatch,
    totalBatches,
    startValidation,
    updateProviderStatus,
    exportProviders,
  } = useProviders();

  const { addNotification } = useNotifications();

  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailProvider, setEmailProvider] = useState<Provider | null>(null);

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setDetailModalOpen(true);
  };

  const handleGenerateEmail = (provider: Provider) => {
    setEmailProvider(provider);
    setEmailModalOpen(true);
  };

  const handleApprove = (provider: Provider) => {
    updateProviderStatus(provider.id, 'validated');
    addNotification(
      'approved',
      'Provider Approved',
      `${provider.name} has been marked as validated.`,
      { id: provider.id, name: provider.name }
    );
    toast({
      title: 'Provider approved',
      description: `${provider.name} has been marked as validated.`,
    });
    setDetailModalOpen(false);
  };

  const handleRequestReview = (provider: Provider) => {
    updateProviderStatus(provider.id, 'needs_review');
    addNotification(
      'review_requested',
      'Review Requested',
      `${provider.name} has been flagged for manual review.`,
      { id: provider.id, name: provider.name }
    );
    toast({
      title: 'Review requested',
      description: `${provider.name} has been flagged for manual review.`,
    });
    setDetailModalOpen(false);
  };

  const handleStartValidation = () => {
    startValidation();
    addNotification(
      'info',
      'Validation Started',
      `Processing ${stats.total} providers against registry sources...`
    );
    toast({
      title: 'Validation started',
      description: 'Processing provider data against multiple sources...',
    });
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor and validate provider directory data
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Upload className="h-4 w-4" />
            Upload Data
          </Button>
          <Button
            variant="healthcare"
            onClick={handleStartValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Validation
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Providers"
          value={stats.total}
          subtitle="In directory"
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Validated"
          value={stats.validated}
          subtitle={`${Math.round((stats.validated / stats.total) * 100)}% complete`}
          icon={CheckCircle2}
          variant="success"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Needs Review"
          value={stats.needsReview}
          subtitle="Requires attention"
          icon={AlertTriangle}
          variant="error"
        />
        <StatCard
          title="Avg Confidence"
          value={`${stats.averageConfidence}%`}
          subtitle="Across all providers"
          icon={TrendingUp}
          variant={stats.averageConfidence >= 80 ? 'success' : stats.averageConfidence >= 60 ? 'warning' : 'error'}
        />
      </div>

      {/* Validation Progress */}
      {(isValidating || validationProgress > 0) && (
        <ValidationProgress
          isRunning={isValidating}
          progress={validationProgress}
          currentBatch={currentBatch}
          totalBatches={totalBatches}
          processedCount={Math.round((validationProgress / 100) * stats.total)}
          totalCount={stats.total}
        />
      )}

      {/* Provider Table */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-stat-card">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">Provider Directory</h2>
          <p className="text-sm text-muted-foreground">
            View and manage all providers in the validation queue
          </p>
        </div>
        <ProviderTable
          providers={providers}
          onViewDetails={handleViewDetails}
          onGenerateEmail={handleGenerateEmail}
          onExport={exportProviders}
        />
      </div>

      {/* Modals */}
      <ProviderDetailModal
        provider={selectedProvider}
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onApprove={handleApprove}
        onRequestReview={handleRequestReview}
        onGenerateEmail={handleGenerateEmail}
      />

      <EmailGeneratorModal
        provider={emailProvider}
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onEmailSent={handleEmailSent}
      />
    </div>
  );
}
