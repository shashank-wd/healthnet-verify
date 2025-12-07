import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationProgressProps {
  isRunning: boolean;
  progress: number;
  currentBatch: number;
  totalBatches: number;
  processedCount: number;
  totalCount: number;
  className?: string;
}

export function ValidationProgress({
  isRunning,
  progress,
  currentBatch,
  totalBatches,
  processedCount,
  totalCount,
  className,
}: ValidationProgressProps) {
  const isComplete = progress >= 100;

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-6 shadow-stat-card',
        'animate-fade-in',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-foreground">
              {isComplete ? 'Validation Complete' : 'Validating Providers'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isComplete
                ? `Successfully processed ${totalCount} providers`
                : `Processing batch ${currentBatch} of ${totalBatches}`}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-foreground">{Math.round(progress)}%</p>
          <p className="text-sm text-muted-foreground">
            {processedCount} / {totalCount}
          </p>
        </div>
      </div>

      <Progress value={progress} className="h-3" />

      {isRunning && !isComplete && (
        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="flex space-x-1">
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>Validating provider data against multiple sources...</span>
        </div>
      )}
    </div>
  );
}
