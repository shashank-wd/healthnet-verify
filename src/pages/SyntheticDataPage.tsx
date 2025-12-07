import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useProviders } from '@/hooks/useProviders';
import {
  Database,
  Download,
  RefreshCw,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { generateMockProviders } from '@/data/mockProviders';
import { Provider } from '@/types/provider';

export default function SyntheticDataPage() {
  const { regenerateData, exportProviders } = useProviders();
  const [providerCount, setProviderCount] = useState(200);
  const [errorRate, setErrorRate] = useState(15);
  const [includePDFs, setIncludePDFs] = useState(false);
  const [qualityIssues, setQualityIssues] = useState({
    outdatedPhone: true,
    wrongAddress: true,
    missingSpecialty: false,
    credentialMismatch: false,
  });
  const [previewData, setPreviewData] = useState<Provider[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const preview = generateMockProviders(10);
      setPreviewData(preview);
      setIsGenerating(false);
      toast({
        title: 'Preview generated',
        description: 'Preview showing 10 sample providers. Apply to load full dataset.',
      });
    }, 1000);
  };

  const handleApply = () => {
    regenerateData(providerCount, errorRate);
    toast({
      title: 'Data applied',
      description: `Generated ${providerCount} providers with ${errorRate}% error rate.`,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Synthetic Data Generator
          </h1>
          <p className="text-muted-foreground">
            Generate test data for validation system testing
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Configuration
          </h2>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Number of Providers</Label>
                <Badge variant="secondary">{providerCount}</Badge>
              </div>
              <Slider
                value={[providerCount]}
                onValueChange={([value]) => setProviderCount(value)}
                min={10}
                max={500}
                step={10}
              />
              <p className="text-sm text-muted-foreground">
                Generate between 10 and 500 provider records
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Error Rate</Label>
                <Badge variant={errorRate > 50 ? 'error' : errorRate > 25 ? 'warning' : 'secondary'}>
                  {errorRate}%
                </Badge>
              </div>
              <Slider
                value={[errorRate]}
                onValueChange={([value]) => setErrorRate(value)}
                min={0}
                max={80}
                step={5}
              />
              <p className="text-sm text-muted-foreground">
                Percentage of records with validation issues
              </p>
            </div>

            <div className="space-y-4">
              <Label>Include PDF Documents</Label>
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={includePDFs}
                  onCheckedChange={(checked) => setIncludePDFs(!!checked)}
                />
                <span className="text-sm">
                  Generate sample credential PDFs for providers
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Data Quality Issues to Inject</Label>
              <div className="grid gap-3">
                {[
                  { key: 'outdatedPhone', label: 'Outdated Phone Numbers' },
                  { key: 'wrongAddress', label: 'Incorrect Addresses' },
                  { key: 'missingSpecialty', label: 'Missing Specialty' },
                  { key: 'credentialMismatch', label: 'Credential Mismatch' },
                ].map((issue) => (
                  <div key={issue.key} className="flex items-center gap-3">
                    <Checkbox
                      checked={qualityIssues[issue.key as keyof typeof qualityIssues]}
                      onCheckedChange={(checked) =>
                        setQualityIssues((prev) => ({
                          ...prev,
                          [issue.key]: !!checked,
                        }))
                      }
                    />
                    <span className="text-sm">{issue.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Preview
            </Button>
            <Button onClick={handleApply}>
              <CheckCircle className="h-4 w-4" />
              Apply to System
            </Button>
            <Button variant="outline" onClick={exportProviders}>
              <Download className="h-4 w-4" />
              Export Dataset
            </Button>
          </div>
        </Card>

        {/* Preview */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Data Preview</h2>
          
          {previewData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Database className="h-12 w-12 mb-4 opacity-50" />
              <p>Click "Preview" to generate sample data</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {previewData.map((provider, index) => (
                <div
                  key={provider.id}
                  className="p-4 rounded-lg border border-border bg-muted/30 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.specialty}
                      </p>
                    </div>
                    <Badge
                      variant={
                        provider.status === 'validated'
                          ? 'success'
                          : provider.status === 'updated'
                          ? 'warning'
                          : 'error'
                      }
                    >
                      {provider.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">NPI: </span>
                      <span className="font-mono">{provider.npi}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone: </span>
                      <span>{provider.phone}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Address: </span>
                      <span>
                        {provider.address.city}, {provider.address.state}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Confidence: </span>
                      <span
                        className={
                          provider.confidenceScore >= 80
                            ? 'text-success'
                            : provider.confidenceScore >= 60
                            ? 'text-warning'
                            : 'text-destructive'
                        }
                      >
                        {provider.confidenceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
