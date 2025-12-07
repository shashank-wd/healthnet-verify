import { useState, useCallback, useMemo } from 'react';
import { Provider, ValidationStats, ProviderStatus } from '@/types/provider';
import { mockProviders, generateMockProviders } from '@/data/mockProviders';

export function useProviders() {
  const [providers, setProviders] = useState<Provider[]>(mockProviders);
  const [isValidating, setIsValidating] = useState(false);
  const [validationProgress, setValidationProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);

  const stats: ValidationStats = useMemo(() => {
    const validated = providers.filter((p) => p.status === 'validated').length;
    const updated = providers.filter((p) => p.status === 'updated').length;
    const needsReview = providers.filter((p) => p.status === 'needs_review').length;
    const avgConfidence =
      providers.reduce((sum, p) => sum + p.confidenceScore, 0) / providers.length;

    return {
      total: providers.length,
      validated,
      updated,
      needsReview,
      averageConfidence: Math.round(avgConfidence * 10) / 10,
    };
  }, [providers]);

  const startValidation = useCallback(() => {
    setIsValidating(true);
    setValidationProgress(0);
    setCurrentBatch(0);

    const batchSize = 20;
    const totalBatches = Math.ceil(providers.length / batchSize);

    // Reset all providers to pending first
    setProviders((prev) =>
      prev.map((p) => ({ ...p, status: 'pending' as ProviderStatus }))
    );

    let currentBatchNum = 0;

    const processNextBatch = () => {
      if (currentBatchNum >= totalBatches) {
        setIsValidating(false);
        setValidationProgress(100);
        return;
      }

      currentBatchNum++;
      setCurrentBatch(currentBatchNum);

      const startIdx = (currentBatchNum - 1) * batchSize;
      const endIdx = Math.min(currentBatchNum * batchSize, providers.length);

      setProviders((prev) => {
        const updated = [...prev];
        for (let i = startIdx; i < endIdx; i++) {
          const statusRoll = Math.random();
          let newStatus: ProviderStatus;
          let newConfidence: number;

          if (statusRoll < 0.65) {
            newStatus = 'validated';
            newConfidence = Math.floor(Math.random() * 15) + 85;
          } else if (statusRoll < 0.85) {
            newStatus = 'updated';
            newConfidence = Math.floor(Math.random() * 20) + 70;
          } else {
            newStatus = 'needs_review';
            newConfidence = Math.floor(Math.random() * 30) + 40;
          }

          updated[i] = {
            ...updated[i],
            status: newStatus,
            confidenceScore: newConfidence,
            lastUpdated: new Date().toISOString(),
          };
        }
        return updated;
      });

      setValidationProgress((currentBatchNum / totalBatches) * 100);

      setTimeout(processNextBatch, 500);
    };

    setTimeout(processNextBatch, 500);
  }, [providers.length]);

  const updateProviderStatus = useCallback(
    (providerId: string, status: ProviderStatus) => {
      setProviders((prev) =>
        prev.map((p) =>
          p.id === providerId
            ? { ...p, status, lastUpdated: new Date().toISOString() }
            : p
        )
      );
    },
    []
  );

  const regenerateData = useCallback((count: number, errorRate: number) => {
    const newProviders = generateMockProviders(count);
    
    // Apply error rate to make some providers need review
    const adjustedProviders = newProviders.map((provider) => {
      if (Math.random() < errorRate / 100) {
        return {
          ...provider,
          status: 'needs_review' as ProviderStatus,
          confidenceScore: Math.floor(Math.random() * 30) + 30,
          reviewReason: 'Synthetic data quality issue',
        };
      }
      return provider;
    });

    setProviders(adjustedProviders);
  }, []);

  const exportProviders = useCallback(() => {
    const csv = [
      ['ID', 'Name', 'NPI', 'Specialty', 'Phone', 'Address', 'City', 'State', 'Zip', 'Status', 'Confidence'].join(','),
      ...providers.map((p) =>
        [
          p.id,
          `"${p.name}"`,
          p.npi,
          `"${p.specialty}"`,
          `"${p.phone}"`,
          `"${p.address.street}"`,
          p.address.city,
          p.address.state,
          p.address.zip,
          p.status,
          p.confidenceScore,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `providers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [providers]);

  return {
    providers,
    stats,
    isValidating,
    validationProgress,
    currentBatch,
    totalBatches: Math.ceil(providers.length / 20),
    startValidation,
    updateProviderStatus,
    regenerateData,
    exportProviders,
  };
}
