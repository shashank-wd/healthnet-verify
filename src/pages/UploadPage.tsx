import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  File,
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: 'csv' | 'pdf' | 'other';
  status: 'pending' | 'processing' | 'complete' | 'error';
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const getFileType = (fileName: string): 'csv' | 'pdf' | 'other' => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return 'csv';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  };

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles: UploadedFile[] = Array.from(fileList).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: getFileType(file.name),
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const processFiles = () => {
    setFiles((prev) =>
      prev.map((f) => ({ ...f, status: 'processing' as const }))
    );

    // Simulate processing
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) => ({
          ...f,
          status: Math.random() > 0.1 ? 'complete' : 'error',
        }))
      );
      toast({
        title: 'Files processed',
        description: 'Provider data has been extracted and is ready for validation.',
      });
    }, 2000);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'csv':
        return <FileSpreadsheet className="h-8 w-8 text-success" />;
      case 'pdf':
        return <FileText className="h-8 w-8 text-destructive" />;
      default:
        return <File className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          Upload Data
        </h1>
        <p className="text-muted-foreground">
          Import provider data from CSV files or credential documents (PDF)
        </p>
      </div>

      {/* Drop Zone */}
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-300',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border hover:border-primary/50'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div
            className={cn(
              'mb-4 rounded-full p-4 transition-colors',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Upload
              className={cn(
                'h-10 w-10 transition-colors',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            Drag and drop your files here
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Supports CSV files (provider lists) and PDF files (credential documents)
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Badge variant="secondary">CSV</Badge>
            <Badge variant="secondary">PDF</Badge>
            <span>Max 10 files, 20MB each</span>
          </div>
          <label>
            <input
              type="file"
              className="hidden"
              multiple
              accept=".csv,.pdf"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Browse Files</span>
            </Button>
          </label>
        </div>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Uploaded Files ({files.length})</h3>
            <Button onClick={processFiles} disabled={files.some(f => f.status === 'processing')}>
              <ArrowRight className="h-4 w-4" />
              Process Files
            </Button>
          </div>
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30"
              >
                <FileIcon type={file.type} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {file.status === 'pending' && (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                  {file.status === 'processing' && (
                    <Badge variant="default" className="animate-pulse">
                      Processing...
                    </Badge>
                  )}
                  {file.status === 'complete' && (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Complete
                    </Badge>
                  )}
                  {file.status === 'error' && (
                    <Badge variant="error" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Error
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Data Mapping Preview */}
      {files.some((f) => f.type === 'csv' && f.status === 'complete') && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Column Mapping Preview</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { source: 'provider_name', target: 'Name' },
              { source: 'npi_number', target: 'NPI' },
              { source: 'specialty_code', target: 'Specialty' },
              { source: 'contact_phone', target: 'Phone' },
              { source: 'street_address', target: 'Address' },
              { source: 'city', target: 'City' },
              { source: 'state', target: 'State' },
              { source: 'zip_code', target: 'Zip' },
            ].map((mapping) => (
              <div
                key={mapping.source}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <span className="text-sm font-mono text-muted-foreground">
                  {mapping.source}
                </span>
                <ArrowRight className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{mapping.target}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
