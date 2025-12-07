import { useState } from 'react';
import { ProviderTable } from '@/components/ProviderTable';
import { ProviderDetailModal } from '@/components/ProviderDetailModal';
import { EmailGeneratorModal } from '@/components/EmailGeneratorModal';
import { useProviders } from '@/hooks/useProviders';
import { Provider } from '@/types/provider';
import { toast } from '@/hooks/use-toast';

export default function ProvidersPage() {
  const { providers, updateProviderStatus, exportProviders } = useProviders();
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
    toast({
      title: 'Provider approved',
      description: `${provider.name} has been marked as validated.`,
    });
    setDetailModalOpen(false);
  };

  const handleRequestReview = (provider: Provider) => {
    updateProviderStatus(provider.id, 'needs_review');
    toast({
      title: 'Review requested',
      description: `${provider.name} has been flagged for manual review.`,
    });
    setDetailModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Provider Directory
        </h1>
        <p className="text-muted-foreground">
          Browse and manage all providers in the system
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 shadow-stat-card">
        <ProviderTable
          providers={providers}
          onViewDetails={handleViewDetails}
          onGenerateEmail={handleGenerateEmail}
          onExport={exportProviders}
        />
      </div>

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
      />
    </div>
  );
}
