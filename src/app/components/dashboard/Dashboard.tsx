import { MetricCard } from './MetricCard';
import { 
  Factory, 
  Package, 
  AlertTriangle, 
  Radio,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

// ERD-aligned Dashboard showing data from actual tables
export function Dashboard() {
  // Mock data aligned with ERD tables
  // In production, this would come from API calls to the database

  // DIVU_PRODUCTION_RUNS statistics
  const productionStats = {
    activeRuns: 3,
    completedToday: 12,
    totalDuration: 96, // hours
    avgDuration: 8, // hours per run
  };

  // DIVU_STATIONS statistics
  const stationStats = {
    total: 8,
    active: 6,
    maintenance: 1,
    inactive: 1,
  };

  // DIVU_DOWNTIME_INCIDENTS statistics
  const downtimeStats = {
    incidentsToday: 4,
    totalMinutes: 127,
    avgDuration: 31.75,
    resolved: 3,
  };

  // DIVU_SENSOR_READINGS statistics
  const sensorStats = {
    activeSensors: 24,
    readingsToday: 14523,
    avgReadingRate: 604, // per hour
    alerts: 2,
  };

  // Mock production run trend data (from DIVU_PRODUCTION_RUNS)
  const productionTrend = [
    { date: '3/6', runs: 8, completed: 7 },
    { date: '3/7', runs: 10, completed: 9 },
    { date: '3/8', runs: 9, completed: 8 },
    { date: '3/9', runs: 11, completed: 10 },
    { date: '3/10', runs: 12, completed: 11 },
    { date: '3/11', runs: 10, completed: 9 },
    { date: '3/12', runs: 13, completed: 12 },
  ];

  // Mock downtime by category (from DIVU_DOWNTIME_FACTORS)
  const downtimeByCategory = [
    { category: 'Equipment', minutes: 45, incidents: 2 },
    { category: 'Material', minutes: 32, incidents: 1 },
    { category: 'Personnel', minutes: 28, incidents: 1 },
    { category: 'Quality', minutes: 22, incidents: 0 },
  ];

  // Mock recent production runs (from DIVU_PRODUCTION_RUNS)
  const recentRuns = [
    { rid: 'PR001', station: 'S001', product: 'P001', startTime: '2023-03-12 08:00', status: 'active' },
    { rid: 'PR002', station: 'S002', product: 'P002', startTime: '2023-03-12 09:00', status: 'completed' },
    { rid: 'PR003', station: 'S003', product: 'P003', startTime: '2023-03-12 10:00', status: 'completed' },
    { rid: 'PR004', station: 'S004', product: 'P004', startTime: '2023-03-12 11:00', status: 'active' },
    { rid: 'PR005', station: 'S005', product: 'P005', startTime: '2023-03-12 12:00', status: 'completed' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl text-foreground">Production Dashboard</h2>
        <p className="text-muted-foreground mt-1">Real-time overview of operations, stations, and performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Production Runs"
          value={productionStats.activeRuns.toString()}
          trend={`${productionStats.completedToday} completed today`}
          trendUp={true}
          category="Production"
          icon={<Factory className="w-5 h-5" />}
        />
        <MetricCard
          title="Station Status"
          value={`${stationStats.active}/${stationStats.total}`}
          trend={`${stationStats.maintenance} in maintenance`}
          trendUp={stationStats.active > stationStats.total / 2}
          category="Stations"
          icon={<CheckCircle className="w-5 h-5" />}
        />
        <MetricCard
          title="Downtime Incidents"
          value={downtimeStats.incidentsToday.toString()}
          trend={`${downtimeStats.totalMinutes} minutes total`}
          trendUp={false}
          category="Downtime"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <MetricCard
          title="Sensor Readings"
          value={sensorStats.readingsToday.toLocaleString()}
          trend={`${sensorStats.activeSensors} active sensors`}
          trendUp={true}
          category="Sensors"
          icon={<Radio className="w-5 h-5" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Runs Trend */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg text-foreground mb-4">Production Runs (7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={productionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line type="monotone" dataKey="runs" stroke="#3b82f6" strokeWidth={2} name="Started" id="line-runs" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" id="line-completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Downtime by Category */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg text-foreground mb-4">Downtime by Factor Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={downtimeByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="minutes" fill="#f59e0b" name="Minutes" id="bar-minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Production Runs Table */}
      <div className="bg-card rounded-lg border border-border">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg text-foreground">Recent Production Runs</h3>
          <p className="text-sm text-muted-foreground mt-1">Latest runs from DIVU_PRODUCTION_RUNS table</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Run ID</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Station</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Product</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Start Time</th>
                <th className="text-left px-6 py-3 text-sm text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentRuns.map((run) => (
                <tr key={run.rid} className="hover:bg-accent transition-colors">
                  <td className="px-6 py-4 text-sm text-foreground font-mono">{run.rid}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{run.station}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{run.product}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{run.startTime}</td>
                  <td className="px-6 py-4">
                    {run.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-green-500/10 text-green-600 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm text-muted-foreground">Avg Run Duration</h3>
          </div>
          <p className="text-2xl text-foreground">{productionStats.avgDuration}h</p>
          <p className="text-xs text-muted-foreground mt-1">Based on completed runs</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm text-muted-foreground">Avg Downtime</h3>
          </div>
          <p className="text-2xl text-foreground">{downtimeStats.avgDuration.toFixed(1)} min</p>
          <p className="text-xs text-muted-foreground mt-1">Per incident average</p>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-sm text-muted-foreground">Sensor Health</h3>
          </div>
          <p className="text-2xl text-foreground">{((sensorStats.activeSensors - sensorStats.alerts) / sensorStats.activeSensors * 100).toFixed(0)}%</p>
          <p className="text-xs text-muted-foreground mt-1">{sensorStats.alerts} sensors need attention</p>
        </div>
      </div>
    </div>
  );
}