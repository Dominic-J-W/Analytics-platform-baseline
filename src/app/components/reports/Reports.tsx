import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Download,
  Calendar,
  Plus,
  Trash2,
  Eye,
  TrendingUp,
  AlertTriangle,
  Activity,
} from 'lucide-react';

// Aligned with DIVU_REPORTS table in ERD v7.1
interface Report {
  report_id: string; // Primary key (semantic PK)
  type: 'performance' | 'operational' | 'downtime'; // Report type
  title: string; // Report title (NOT NULL)
  date_range_start: Date; // Start of date range (NOT NULL)
  date_range_end: Date; // End of date range (NOT NULL, CHECK >= start)
  generated_by_uid: string; // Foreign key to DIVU_USERS
  generated_at: Date; // Generation timestamp (DEFAULT SYSTIMESTAMP)
  // Additional UI fields for display
  generated_by_name?: string;
}

export function Reports() {
  const { hasPermission, user } = useAuth();
  const canGenerate = hasPermission('reports_generate');

  const [reports, setReports] = useState<Report[]>([
    {
      report_id: '1',
      type: 'performance',
      title: 'February Production Performance Report',
      date_range_start: new Date('2026-02-01'),
      date_range_end: new Date('2026-02-28'),
      generated_by_uid: '1',
      generated_at: new Date('2026-03-01T10:00:00'),
      generated_by_name: 'admin_user',
    },
    {
      report_id: '2',
      type: 'downtime',
      title: 'Weekly Downtime Analysis - Week 9',
      date_range_start: new Date('2026-02-24'),
      date_range_end: new Date('2026-03-02'),
      generated_by_uid: '1',
      generated_at: new Date('2026-03-03T14:30:00'),
      generated_by_name: 'admin_user',
    },
    {
      report_id: '3',
      type: 'operational',
      title: 'Q1 2026 Operations Summary',
      date_range_start: new Date('2026-01-01'),
      date_range_end: new Date('2026-03-31'),
      generated_by_uid: '1',
      generated_at: new Date('2026-03-04T09:15:00'),
      generated_by_name: 'admin_user',
    },
    {
      report_id: '4',
      type: 'performance',
      title: 'Station A - March Performance',
      date_range_start: new Date('2026-03-01'),
      date_range_end: new Date('2026-03-05'),
      generated_by_uid: '1',
      generated_at: new Date('2026-03-05T08:00:00'),
      generated_by_name: 'admin_user',
    },
  ]);

  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [selectedType, setSelectedType] = useState<'performance' | 'operational' | 'downtime'>('performance');
  const [filterType, setFilterType] = useState<'all' | 'performance' | 'operational' | 'downtime'>('all');
  const [reportTitle, setReportTitle] = useState('');
  const [reportStartDate, setReportStartDate] = useState('2026-03-01');
  const [reportEndDate, setReportEndDate] = useState('2026-03-24');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'operational':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'downtime':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="w-4 h-4" />;
      case 'operational':
        return <Activity className="w-4 h-4" />;
      case 'downtime':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(r => r.type === filterType);

  const handleDeleteReport = (report_id: string) => {
    if (confirm('Are you sure you want to delete this report?')) {
      setReports(reports.filter((r) => r.report_id !== report_id));
    }
  };

  const handleGenerateReport = () => {
    const title = reportTitle || `New ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Report`;
    const newReport: Report = {
      report_id: Date.now().toString(),
      type: selectedType,
      title,
      date_range_start: new Date(reportStartDate),
      date_range_end: new Date(reportEndDate),
      generated_by_uid: user?.uid || '1',
      generated_at: new Date(),
      generated_by_name: user?.username || 'admin_user',
    };
    setReports([newReport, ...reports]);
    setShowGenerateForm(false);
    setReportTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-foreground mb-1">Reports</h2>
        <p className="text-muted-foreground">
          Generate and manage performance, operational, and downtime reports
        </p>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground border border-border hover:bg-accent'
            }`}
          >
            All Reports
          </button>
          <button
            onClick={() => setFilterType('performance')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'performance'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground border border-border hover:bg-accent'
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setFilterType('operational')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'operational'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground border border-border hover:bg-accent'
            }`}
          >
            Operational
          </button>
          <button
            onClick={() => setFilterType('downtime')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filterType === 'downtime'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-foreground border border-border hover:bg-accent'
            }`}
          >
            Downtime
          </button>
        </div>

        {canGenerate && (
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        )}
      </div>

      {/* Generate Report Form */}
      {showGenerateForm && (
        <div className="bg-card rounded-lg border border-border shadow-sm p-6 space-y-4">
          <h3 className="text-lg text-foreground font-medium">Generate New Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-foreground mb-2">Report Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="performance">Performance Report</option>
                <option value="operational">Operational Report</option>
                <option value="downtime">Downtime Report</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">Report Title</label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder="Enter report title"
                className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">Start Date</label>
              <input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm text-foreground mb-2">End Date</label>
              <input
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-border">
            <button
              onClick={() => setShowGenerateForm(false)}
              className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateReport}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No reports found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {canGenerate ? 'Generate your first report to get started' : 'No reports available'}
            </p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.report_id}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${getTypeColor(
                        report.type
                      )}`}
                    >
                      {getTypeIcon(report.type)}
                      {report.type}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      RPT-{report.report_id}
                    </span>
                  </div>

                  <h4 className="text-foreground font-medium mb-2">{report.title}</h4>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(report.date_range_start)} - {formatDate(report.date_range_end)}
                    </div>
                    <div>
                      Generated by {report.generated_by_name}
                    </div>
                    <div>
                      {formatDateTime(report.generated_at)}
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                    title="View Report"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {canGenerate && (
                    <button
                      onClick={() => handleDeleteReport(report.report_id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}