import { Provider } from '@/types/provider';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import {
  CheckCircle,
  AlertTriangle,
  Mail,
  History,
  Database,
  MapPin,
  Shield,
  FileText,
  Phone,
  User,
  Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderDetailModalProps {
  provider: Provider | null;
  open: boolean;
  onClose: () => void;
  onApprove: (provider: Provider) => void;
  onRequestReview: (provider: Provider) => void;
  onGenerateEmail: (provider: Provider) => void;
}

export function ProviderDetailModal({
  provider,
  open,
  onClose,
  onApprove,
  onRequestReview,
  onGenerateEmail,
}: ProviderDetailModalProps) {
  if (!provider) return null;

  const hasChanges = provider.discrepancies.length > 0;

  const dataSourceIcons: Record<string, typeof Database> = {
    'NPI Registry': Database,
    'Google Maps': MapPin,
    'State Medical Board': Shield,
    'CMS NPPES': FileText,
    'Hospital Affiliations': Shield,
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold">{provider.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                NPI: {provider.npi} • {provider.specialty}
              </p>
            </div>
            <StatusBadge status={provider.status} />
          </div>
        </DialogHeader>

        <div className="grid gap-6 mt-4">
          {/* Comparison View */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Original Data */}
            <div className="rounded-lg border border-border p-4 bg-muted/30">
              <h4 className="font-semibold text-sm text-muted-foreground mb-4 flex items-center gap-2">
                <History className="h-4 w-4" />
                Original Data
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm">{provider.originalData.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm">{provider.originalData.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm">
                      {provider.originalData.address.street}<br />
                      {provider.originalData.address.city}, {provider.originalData.address.state} {provider.originalData.address.zip}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Specialty</p>
                    <p className="text-sm">{provider.originalData.specialty}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validated Data */}
            <div className="rounded-lg border border-border p-4 bg-card">
              <h4 className="font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Validated Data
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className={cn(
                      'text-sm',
                      provider.originalData.name !== provider.validatedData.name && 'bg-warning/20 px-1 rounded'
                    )}>
                      {provider.validatedData.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className={cn(
                      'text-sm',
                      provider.originalData.phone !== provider.validatedData.phone && 'bg-warning/20 px-1 rounded'
                    )}>
                      {provider.validatedData.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className={cn(
                      'text-sm',
                      provider.originalData.address.street !== provider.validatedData.address.street && 'bg-warning/20 px-1 rounded'
                    )}>
                      {provider.validatedData.address.street}<br />
                      {provider.validatedData.address.city}, {provider.validatedData.address.state} {provider.validatedData.address.zip}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Specialty</p>
                    <p className="text-sm">{provider.validatedData.specialty}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Breakdown */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-sm mb-4">Confidence Breakdown</h4>
            <div className="grid gap-3">
              {Object.entries(provider.confidenceBreakdown)
                .filter(([key]) => key !== 'overall')
                .map(([key, value]) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground capitalize w-20">{key}</span>
                    <div className="flex-1">
                      <ConfidenceBar value={value} size="sm" />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Discrepancies */}
          {provider.discrepancies.length > 0 && (
            <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-warning">
                <AlertTriangle className="h-4 w-4" />
                Discrepancies Found ({provider.discrepancies.length})
              </h4>
              <div className="space-y-2">
                {provider.discrepancies.map((disc, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between text-sm p-2 rounded bg-background"
                  >
                    <div>
                      <span className="font-medium">{disc.field}</span>
                      <p className="text-muted-foreground">
                        "{disc.originalValue}" → "{disc.newValue}"
                      </p>
                    </div>
                    <Badge
                      variant={
                        disc.severity === 'high'
                          ? 'error'
                          : disc.severity === 'medium'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {disc.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-sm mb-3">Data Sources Used</h4>
            <div className="flex flex-wrap gap-2">
              {provider.dataSources.map((source, index) => {
                const Icon = dataSourceIcons[source.name] || Database;
                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                      source.verified
                        ? 'bg-success/10 text-success'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <Icon className="h-3 w-3" />
                    {source.name}
                    {source.verified && <CheckCircle className="h-3 w-3" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Professional Details */}
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-semibold text-sm mb-3">Professional Details</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">License Number</p>
                <p className="font-mono">{provider.licenseNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Certifications</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {provider.certifications.map((cert, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-border">
            <Button
              variant="success"
              onClick={() => onApprove(provider)}
              disabled={provider.status === 'validated'}
            >
              <CheckCircle className="h-4 w-4" />
              Approve Updates
            </Button>
            <Button
              variant="warning"
              onClick={() => onRequestReview(provider)}
            >
              <AlertTriangle className="h-4 w-4" />
              Request Manual Review
            </Button>
            <Button variant="outline" onClick={() => onGenerateEmail(provider)}>
              <Mail className="h-4 w-4" />
              Generate Verification Email
            </Button>
            <Button variant="ghost">
              <History className="h-4 w-4" />
              View Full History
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
