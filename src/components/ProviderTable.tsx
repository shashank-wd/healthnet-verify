import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { ConfidenceBar } from '@/components/ConfidenceBar';
import { Provider, FilterOptions, ProviderStatus } from '@/types/provider';
import {
  Search,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  FileText,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ProviderTableProps {
  providers: Provider[];
  onViewDetails: (provider: Provider) => void;
  onGenerateEmail: (provider: Provider) => void;
  onExport: () => void;
  className?: string;
}

const ITEMS_PER_PAGE = 20;

export function ProviderTable({
  providers,
  onViewDetails,
  onGenerateEmail,
  onExport,
  className,
}: ProviderTableProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    searchQuery: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Filter providers
  const filteredProviders = providers.filter((provider) => {
    const matchesStatus =
      filters.status === 'all' || provider.status === filters.status;
    const matchesSearch =
      filters.searchQuery === '' ||
      provider.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
      provider.npi.includes(filters.searchQuery) ||
      provider.specialty.toLowerCase().includes(filters.searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort providers
  const sortedProviders = [...filteredProviders].sort((a, b) => {
    let comparison = 0;
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'confidence':
        comparison = a.confidenceScore - b.confidenceScore;
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'lastUpdated':
        comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
    }
    return filters.sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate
  const totalPages = Math.ceil(sortedProviders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProviders = sortedProviders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSort = (column: FilterOptions['sortBy']) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder: prev.sortBy === column && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, NPI, or specialty..."
              value={filters.searchQuery}
              onChange={(e) => {
                setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
                setCurrentPage(1);
              }}
              className="pl-10"
            />
          </div>
          <Select
            value={filters.status}
            onValueChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                status: value as ProviderStatus | 'all',
              }));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="validated">Validated</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="needs_review">Needs Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedProviders.length)} of{' '}
        {sortedProviders.length} providers
      </p>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Provider Name
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>NPI Number</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted transition-colors w-[160px]"
                onClick={() => handleSort('confidence')}
              >
                <div className="flex items-center gap-1">
                  Confidence
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProviders.map((provider, index) => (
              <TableRow
                key={provider.id}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <TableCell className="font-medium">{provider.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {provider.npi}
                </TableCell>
                <TableCell>{provider.specialty}</TableCell>
                <TableCell className="text-sm">{provider.phone}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {provider.address.city}, {provider.address.state}
                </TableCell>
                <TableCell>
                  <StatusBadge status={provider.status} />
                </TableCell>
                <TableCell>
                  <ConfidenceBar value={provider.confidenceScore} size="sm" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewDetails(provider)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onGenerateEmail(provider)}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
