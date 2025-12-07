import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProviders } from '@/hooks/useProviders';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Download,
  FileText,
  Share2,
  Clock,
  CheckCircle,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import { StatCard } from '@/components/StatCard';

export default function ReportsPage() {
  const { providers, stats } = useProviders();

  const statusData = useMemo(
    () => [
      { name: 'Validated', value: stats.validated, color: 'hsl(142, 76%, 36%)' },
      { name: 'Updated', value: stats.updated, color: 'hsl(38, 92%, 50%)' },
      { name: 'Needs Review', value: stats.needsReview, color: 'hsl(0, 84%, 60%)' },
    ],
    [stats]
  );

  const confidenceDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20%', count: 0 },
      { range: '21-40%', count: 0 },
      { range: '41-60%', count: 0 },
      { range: '61-80%', count: 0 },
      { range: '81-100%', count: 0 },
    ];

    providers.forEach((p) => {
      if (p.confidenceScore <= 20) ranges[0].count++;
      else if (p.confidenceScore <= 40) ranges[1].count++;
      else if (p.confidenceScore <= 60) ranges[2].count++;
      else if (p.confidenceScore <= 80) ranges[3].count++;
      else ranges[4].count++;
    });

    return ranges;
  }, [providers]);

  const specialtyBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    providers.forEach((p) => {
      breakdown[p.specialty] = (breakdown[p.specialty] || 0) + 1;
    });
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [providers]);

  const estimatedSavings = Math.round(stats.validated * 15.5 + stats.updated * 8.25);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Validation Reports
          </h1>
          <p className="text-muted-foreground">
            Analytics and insights from the validation process
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
          <Button>
            <Share2 className="h-4 w-4" />
            Share Report
          </Button>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-healthcare-teal/5 border-primary/20">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Executive Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Processing Time"
            value="4.2 min"
            subtitle="For 200 providers"
            icon={Clock}
            variant="primary"
          />
          <StatCard
            title="Success Rate"
            value={`${Math.round(((stats.validated + stats.updated) / stats.total) * 100)}%`}
            subtitle="Validated or updated"
            icon={CheckCircle}
            variant="success"
          />
          <StatCard
            title="Avg Confidence"
            value={`${stats.averageConfidence}%`}
            subtitle="Across all fields"
            icon={TrendingUp}
            variant="primary"
          />
          <StatCard
            title="Cost Savings"
            value={`$${estimatedSavings.toLocaleString()}`}
            subtitle="Estimated manual hours saved"
            icon={DollarSign}
            variant="success"
          />
        </div>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution Pie Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Status Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Confidence Score Distribution */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Confidence Score Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Specialty Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Top Specialties</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--healthcare-teal))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Common Error Types */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Common Discrepancy Types</h3>
          <div className="space-y-4">
            {[
              { type: 'Phone Number Mismatch', count: 42, severity: 'medium' },
              { type: 'Address Change', count: 38, severity: 'high' },
              { type: 'Name Variation', count: 24, severity: 'low' },
              { type: 'Missing Specialty', count: 18, severity: 'medium' },
              { type: 'License Status', count: 12, severity: 'high' },
              { type: 'Credential Expired', count: 8, severity: 'high' },
            ].map((error, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      error.severity === 'high'
                        ? 'error'
                        : error.severity === 'medium'
                        ? 'warning'
                        : 'secondary'
                    }
                  >
                    {error.severity}
                  </Badge>
                  <span className="font-medium">{error.type}</span>
                </div>
                <span className="text-muted-foreground">{error.count} occurrences</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
