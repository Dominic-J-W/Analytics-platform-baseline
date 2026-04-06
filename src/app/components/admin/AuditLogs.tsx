import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FileText, Search, Filter, Calendar, User, Database, Eye } from 'lucide-react';

// Aligned with DIVU_AUDIT_LOGS table in ERD
interface AuditLog {
  audit_id: string; // Primary key
  uid: string; // Foreign key to DIVU_USERS (NOT NULL)
  admin_id: string | null; // Foreign key to DIVU_ADMIN (nullable)
  action: string; // Action performed (NOT NULL, max 50 chars)
  table_affected: string; // Table affected (NOT NULL, max 50 chars)
  old_values: string; // CLOB - old values as JSON
  new_values: string; // CLOB - new values as JSON
  logged_at: Date; // Timestamp (DEFAULT SYSTIMESTAMP, NOT NULL)
  // Additional UI fields for display
  username?: string;
  admin_username?: string;
}

export function AuditLogs() {
  const { hasPermission } = useAuth();
  const canViewAudit = hasPermission('audit_view');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Mock audit logs data - aligned with DIVU_AUDIT_LOGS
  const [auditLogs] = useState<AuditLog[]>([
    {
      audit_id: '1',
      uid: '1',
      admin_id: '1',
      action: 'CREATE',
      table_affected: 'DIVU_PRODUCTS',
      old_values: '{}',
      new_values: JSON.stringify({
        pid: '5',
        name: 'New Product Alpha',
        sku: 'NPA-2026-001',
        target_uph: 50.0,
        status: 'active',
      }),
      logged_at: new Date('2026-03-12T10:30:00'),
      username: 'admin_user',
      admin_username: 'admin_user',
    },
    {
      audit_id: '2',
      uid: '1',
      admin_id: '1',
      action: 'UPDATE',
      table_affected: 'DIVU_STATIONS',
      old_values: JSON.stringify({
        stid: '3',
        status: 'active',
      }),
      new_values: JSON.stringify({
        stid: '3',
        status: 'maintenance',
      }),
      logged_at: new Date('2026-03-12T09:15:00'),
      username: 'admin_user',
      admin_username: 'admin_user',
    },
    {
      audit_id: '3',
      uid: '2',
      admin_id: null,
      action: 'CREATE',
      table_affected: 'DIVU_DOWNTIME_INCIDENTS',
      old_values: '{}',
      new_values: JSON.stringify({
        incident_id: '4',
        rid: '1',
        factor_id: '2',
        start_time: '2026-03-11T14:00:00',
        description: 'Electrical system malfunction',
      }),
      logged_at: new Date('2026-03-11T14:05:00'),
      username: 'plant_manager_1',
      admin_username: null,
    },
    {
      audit_id: '4',
      uid: '1',
      admin_id: '1',
      action: 'DELETE',
      table_affected: 'DIVU_USERS',
      old_values: JSON.stringify({
        uid: '10',
        username: 'temp_user',
        email: 'temp@example.com',
        status: 'disabled',
      }),
      new_values: '{}',
      logged_at: new Date('2026-03-10T16:45:00'),
      username: 'admin_user',
      admin_username: 'admin_user',
    },
    {
      audit_id: '5',
      uid: '1',
      admin_id: '1',
      action: 'UPDATE',
      table_affected: 'DIVU_PRODUCTION_RUNS',
      old_values: JSON.stringify({
        rid: '2',
        status: 'active',
        end_time: null,
      }),
      new_values: JSON.stringify({
        rid: '2',
        status: 'completed',
        end_time: '2026-03-10T14:00:00',
      }),
      logged_at: new Date('2026-03-10T14:02:00'),
      username: 'admin_user',
      admin_username: 'admin_user',
    },
    {
      audit_id: '6',
      uid: '2',
      admin_id: null,
      action: 'CREATE',
      table_affected: 'DIVU_SENSOR_READINGS',
      old_values: '{}',
      new_values: JSON.stringify({
        reading_id: '15423',
        sid: '1',
        rid: '1',
        value: 72.8,
        reading_ts: '2026-03-09T12:00:00',
      }),
      logged_at: new Date('2026-03-09T12:00:01'),
      username: 'plant_manager_1',
      admin_username: null,
    },
    {
      audit_id: '7',
      uid: '1',
      admin_id: '1',
      action: 'UPDATE',
      table_affected: 'DIVU_ADMIN',
      old_values: JSON.stringify({
        admin_id: '2',
        uid: '2',
        is_super_admin: false,
      }),
      new_values: JSON.stringify({
        admin_id: '2',
        uid: '2',
        is_super_admin: true,
      }),
      logged_at: new Date('2026-03-08T11:20:00'),
      username: 'admin_user',
      admin_username: 'admin_user',
    },
  ]);

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  };

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const uniqueTables = Array.from(new Set(auditLogs.map((log) => log.table_affected))).sort();
  const uniqueActions = Array.from(new Set(auditLogs.map((log) => log.action))).sort();

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.table_affected.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.audit_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesTable = filterTable === 'all' || log.table_affected === filterTable;

    return matchesSearch && matchesAction && matchesTable;
  });

  if (!canViewAudit) {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to view audit logs. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-foreground mb-1">Audit Logs</h2>
        <p className="text-muted-foreground">
          View all system actions and changes tracked in DIVU_AUDIT_LOGS table
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg border border-border shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={filterTable}
              onChange={(e) => setFilterTable(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none"
            >
              <option value="all">All Tables</option>
              {uniqueTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {auditLogs.length} log entries
        </div>
      </div>

      {/* Audit Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-card rounded-lg border border-border p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">No audit logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.audit_id}
              className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs rounded border font-medium ${getActionColor(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      LOG-{log.audit_id}
                    </span>
                    <span className="text-xs text-muted-foreground">→</span>
                    <span className="text-xs text-foreground font-mono bg-accent px-2 py-0.5 rounded">
                      {log.table_affected}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">User:</span>
                      <span className="text-foreground">{log.username}</span>
                      {log.admin_username && (
                        <span className="text-xs text-purple-600">(Admin)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Time:</span>
                      <span className="text-foreground">{formatDateTime(log.logged_at)}</span>
                    </div>
                  </div>

                  {/* Change Preview */}
                  {(log.old_values !== '{}' || log.new_values !== '{}') && (
                    <div className="mt-3 p-3 bg-accent rounded-lg border border-border text-xs">
                      {log.action === 'CREATE' && (
                        <div>
                          <span className="text-green-600 font-medium">Created:</span>
                          <pre className="mt-1 text-foreground overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.new_values), null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.action === 'UPDATE' && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-red-600 font-medium">Before:</span>
                            <pre className="mt-1 text-foreground overflow-x-auto">
                              {JSON.stringify(JSON.parse(log.old_values), null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-green-600 font-medium">After:</span>
                            <pre className="mt-1 text-foreground overflow-x-auto">
                              {JSON.stringify(JSON.parse(log.new_values), null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                      {log.action === 'DELETE' && (
                        <div>
                          <span className="text-red-600 font-medium">Deleted:</span>
                          <pre className="mt-1 text-foreground overflow-x-auto">
                            {JSON.stringify(JSON.parse(log.old_values), null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedLog(log)}
                  className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg border border-border max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center justify-between">
                <h3 className="text-lg text-foreground font-medium">Audit Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Audit ID</label>
                  <p className="text-foreground font-mono">{selectedLog.audit_id}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Action</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded border ${getActionColor(
                      selectedLog.action
                    )}`}
                  >
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Table Affected</label>
                  <p className="text-foreground font-mono">{selectedLog.table_affected}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Timestamp</label>
                  <p className="text-foreground">{formatDateTime(selectedLog.logged_at)}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">User ID</label>
                  <p className="text-foreground font-mono">{selectedLog.uid}</p>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Username</label>
                  <p className="text-foreground">{selectedLog.username}</p>
                </div>
                {selectedLog.admin_id && (
                  <>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">Admin ID</label>
                      <p className="text-foreground font-mono">{selectedLog.admin_id}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-1">
                        Admin Username
                      </label>
                      <p className="text-foreground">{selectedLog.admin_username}</p>
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Old Values (CLOB)</label>
                <pre className="p-4 bg-accent border border-border rounded-lg text-xs text-foreground overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedLog.old_values), null, 2)}
                </pre>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">New Values (CLOB)</label>
                <pre className="p-4 bg-accent border border-border rounded-lg text-xs text-foreground overflow-x-auto">
                  {JSON.stringify(JSON.parse(selectedLog.new_values), null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-6 border-t border-border">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
