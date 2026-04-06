import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Clock,
  TrendingDown,
} from 'lucide-react';

interface DowntimeFactor {
  factor_id: string;
  name: string;
  category: 'Equipment' | 'Process' | 'Material' | 'Human';
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_by_uid: string;
}

interface DowntimeIncident {
  incident_id: string;
  rid: string;
  factor_id: string;
  start_time: Date;
  end_time: Date | null;
  duration_mins: number;
  description: string;
  reported_by_uid: string;
  factor_name?: string;
  run_info?: string;
  reporter_name?: string;
}

export function DowntimeFactors() {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('downtime_manage');

  const [activeTab, setActiveTab] = useState<'factors' | 'incidents'>('factors');

  const [factors, setFactors] = useState<DowntimeFactor[]>([
    { factor_id: '1', name: 'Mechanical Failure', category: 'Equipment', severity: 'critical', created_by_uid: '1' },
    { factor_id: '2', name: 'Electrical Issue', category: 'Equipment', severity: 'high', created_by_uid: '1' },
    { factor_id: '3', name: 'Material Shortage', category: 'Material', severity: 'medium', created_by_uid: '1' },
    { factor_id: '4', name: 'Operator Training Issue', category: 'Human', severity: 'low', created_by_uid: '1' },
    { factor_id: '5', name: 'Process Adjustment Required', category: 'Process', severity: 'low', created_by_uid: '1' },
    { factor_id: '6', name: 'Hydraulic System Leak', category: 'Equipment', severity: 'critical', created_by_uid: '1' },
  ]);

  const runOptions = [
    { rid: '1', label: 'RUN-001 (Assembly Line A - Widget Pro)' },
    { rid: '2', label: 'RUN-002 (Packaging Station B - Component X)' },
  ];

  const [incidents, setIncidents] = useState<DowntimeIncident[]>([
    { incident_id: '1', rid: '1', factor_id: '1', start_time: new Date('2026-03-05T10:30:00'), end_time: new Date('2026-03-05T12:45:00'), duration_mins: 135, description: 'Belt conveyor motor failed, required emergency replacement', reported_by_uid: '1', factor_name: 'Mechanical Failure', run_info: 'RUN-001 (Assembly Line A - Widget Pro)', reporter_name: 'admin_user' },
    { incident_id: '2', rid: '2', factor_id: '3', start_time: new Date('2026-03-04T14:15:00'), end_time: new Date('2026-03-04T17:00:00'), duration_mins: 165, description: 'Waiting for raw material delivery from supplier', reported_by_uid: '1', factor_name: 'Material Shortage', run_info: 'RUN-002 (Packaging Station B - Component X)', reporter_name: 'admin_user' },
    { incident_id: '3', rid: '1', factor_id: '5', start_time: new Date('2026-03-03T08:00:00'), end_time: new Date('2026-03-03T08:45:00'), duration_mins: 45, description: 'Process parameter adjustment to improve quality', reported_by_uid: '1', factor_name: 'Process Adjustment Required', run_info: 'RUN-001 (Assembly Line A - Widget Pro)', reporter_name: 'admin_user' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFactorForm, setShowFactorForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [editingFactor, setEditingFactor] = useState<DowntimeFactor | null>(null);
  const [editingIncident, setEditingIncident] = useState<DowntimeIncident | null>(null);

  // Factor form
  const [factorForm, setFactorForm] = useState({ name: '', category: 'Equipment' as DowntimeFactor['category'], severity: 'low' as DowntimeFactor['severity'] });

  // Incident form
  const [incidentForm, setIncidentForm] = useState({ rid: '', factor_id: '', start_time: '', end_time: '', description: '' });

  const openFactorForm = (factor?: DowntimeFactor) => {
    if (factor) {
      setEditingFactor(factor);
      setFactorForm({ name: factor.name, category: factor.category, severity: factor.severity });
    } else {
      setEditingFactor(null);
      setFactorForm({ name: '', category: 'Equipment', severity: 'low' });
    }
    setShowFactorForm(true);
  };

  const openIncidentForm = (incident?: DowntimeIncident) => {
    if (incident) {
      setEditingIncident(incident);
      setIncidentForm({
        rid: incident.rid,
        factor_id: incident.factor_id,
        start_time: incident.start_time.toISOString().slice(0, 16),
        end_time: incident.end_time ? incident.end_time.toISOString().slice(0, 16) : '',
        description: incident.description,
      });
    } else {
      setEditingIncident(null);
      setIncidentForm({ rid: '', factor_id: '', start_time: new Date().toISOString().slice(0, 16), end_time: '', description: '' });
    }
    setShowIncidentForm(true);
  };

  const handleSaveFactor = () => {
    if (!factorForm.name) return;
    if (editingFactor) {
      setFactors(factors.map(f => f.factor_id === editingFactor.factor_id ? { ...f, ...factorForm } : f));
      // Update incident display names
      setIncidents(incidents.map(i => i.factor_id === editingFactor.factor_id ? { ...i, factor_name: factorForm.name } : i));
    } else {
      setFactors([...factors, { factor_id: Date.now().toString(), ...factorForm, created_by_uid: user?.uid || '1' }]);
    }
    setShowFactorForm(false);
    setEditingFactor(null);
  };

  const handleSaveIncident = () => {
    if (!incidentForm.rid || !incidentForm.factor_id || !incidentForm.start_time) return;
    const factor = factors.find(f => f.factor_id === incidentForm.factor_id);
    const run = runOptions.find(r => r.rid === incidentForm.rid);
    const startDate = new Date(incidentForm.start_time);
    const endDate = incidentForm.end_time ? new Date(incidentForm.end_time) : null;
    const durationMins = endDate ? Math.round((endDate.getTime() - startDate.getTime()) / 60000) : 0;

    if (editingIncident) {
      setIncidents(incidents.map(i => i.incident_id === editingIncident.incident_id ? {
        ...i, rid: incidentForm.rid, factor_id: incidentForm.factor_id,
        start_time: startDate, end_time: endDate, duration_mins: durationMins,
        description: incidentForm.description, factor_name: factor?.name, run_info: run?.label,
      } : i));
    } else {
      setIncidents([...incidents, {
        incident_id: Date.now().toString(), rid: incidentForm.rid, factor_id: incidentForm.factor_id,
        start_time: startDate, end_time: endDate, duration_mins: durationMins,
        description: incidentForm.description, reported_by_uid: user?.uid || '1',
        factor_name: factor?.name, run_info: run?.label, reporter_name: user?.username || 'admin_user',
      }]);
    }
    setShowIncidentForm(false);
    setEditingIncident(null);
  };

  const handleDeleteFactor = (factor_id: string) => {
    if (confirm('Are you sure you want to delete this downtime factor?')) {
      setFactors(factors.filter(f => f.factor_id !== factor_id));
    }
  };

  const handleDeleteIncident = (incident_id: string) => {
    if (confirm('Are you sure you want to delete this downtime incident?')) {
      setIncidents(incidents.filter(i => i.incident_id !== incident_id));
    }
  };

  const formatDateTime = (date: Date) => new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  const formatDuration = (minutes: number) => { const h = Math.floor(minutes / 60); const m = minutes % 60; return h > 0 ? `${h}h ${m}m` : `${m}m`; };

  const getCategoryColor = (category: DowntimeFactor['category']) => {
    switch (category) {
      case 'Equipment': return 'bg-red-100 text-red-700 border-red-200';
      case 'Process': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Material': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Human': return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getSeverityColor = (severity: DowntimeFactor['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const filteredFactors = factors.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredIncidents = incidents.filter(i =>
    i.factor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.run_info?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-foreground mb-1">Downtime Management</h2>
        <p className="text-muted-foreground">Track downtime factors and incidents affecting production</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder={`Search ${activeTab}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="border-b border-border">
          <div className="flex">
            <button onClick={() => setActiveTab('factors')} className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${activeTab === 'factors' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <AlertTriangle className="w-4 h-4" />
              Downtime Factors ({factors.length})
            </button>
            <button onClick={() => setActiveTab('incidents')} className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${activeTab === 'incidents' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
              <TrendingDown className="w-4 h-4" />
              Downtime Incidents ({incidents.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'factors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{filteredFactors.length} factor{filteredFactors.length !== 1 ? 's' : ''}</p>
                {canManage && (
                  <button onClick={() => openFactorForm()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />Add Factor
                  </button>
                )}
              </div>

              {showFactorForm && (
                <div className="bg-accent rounded-lg border border-border p-4 space-y-4">
                  <h3 className="text-sm text-foreground">{editingFactor ? 'Edit Factor' : 'Add New Factor'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm text-foreground mb-2">Factor Name</label>
                      <input type="text" value={factorForm.name} onChange={(e) => setFactorForm({ ...factorForm, name: e.target.value })} placeholder="e.g., Mechanical Failure" className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Category</label>
                      <select value={factorForm.category} onChange={(e) => setFactorForm({ ...factorForm, category: e.target.value as DowntimeFactor['category'] })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="Equipment">Equipment</option>
                        <option value="Process">Process</option>
                        <option value="Material">Material</option>
                        <option value="Human">Human</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Severity</label>
                      <select value={factorForm.severity} onChange={(e) => setFactorForm({ ...factorForm, severity: e.target.value as DowntimeFactor['severity'] })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setShowFactorForm(false); setEditingFactor(null); }} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">Cancel</button>
                    <button onClick={handleSaveFactor} disabled={!factorForm.name} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {editingFactor ? 'Update Factor' : 'Create Factor'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredFactors.map((factor) => (
                  <div key={factor.factor_id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <h4 className="text-foreground">{factor.name}</h4>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded border ${getCategoryColor(factor.category)}`}>{factor.category}</span>
                          <span className={`inline-flex px-2 py-1 text-xs rounded border ${getSeverityColor(factor.severity)}`}>{factor.severity}</span>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <button onClick={() => openFactorForm(factor)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteFactor(factor.factor_id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''}</p>
                {canManage && (
                  <button onClick={() => openIncidentForm()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />Report Incident
                  </button>
                )}
              </div>

              {showIncidentForm && (
                <div className="bg-accent rounded-lg border border-border p-4 space-y-4">
                  <h3 className="text-sm text-foreground">{editingIncident ? 'Edit Incident' : 'Report New Incident'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Production Run</label>
                      <select value={incidentForm.rid} onChange={(e) => setIncidentForm({ ...incidentForm, rid: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="">Select production run</option>
                        {runOptions.map(r => <option key={r.rid} value={r.rid}>{r.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Downtime Factor</label>
                      <select value={incidentForm.factor_id} onChange={(e) => setIncidentForm({ ...incidentForm, factor_id: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="">Select factor</option>
                        {factors.map(f => <option key={f.factor_id} value={f.factor_id}>{f.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Start Time</label>
                      <input type="datetime-local" value={incidentForm.start_time} onChange={(e) => setIncidentForm({ ...incidentForm, start_time: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">End Time (optional)</label>
                      <input type="datetime-local" value={incidentForm.end_time} onChange={(e) => setIncidentForm({ ...incidentForm, end_time: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-foreground mb-2">Description</label>
                      <textarea value={incidentForm.description} onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground resize-none" rows={3} placeholder="Describe the downtime incident..." />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setShowIncidentForm(false); setEditingIncident(null); }} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">Cancel</button>
                    <button onClick={handleSaveIncident} disabled={!incidentForm.rid || !incidentForm.factor_id || !incidentForm.start_time} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {editingIncident ? 'Update Incident' : 'Report Incident'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredIncidents.map((incident) => (
                  <div key={incident.incident_id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground font-mono">INC-{incident.incident_id}</span>
                          <span className="text-foreground">{incident.factor_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{incident.run_info}</p>
                        <p className="text-sm text-foreground">{incident.description}</p>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <button onClick={() => openIncidentForm(incident)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteIncident(incident.incident_id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started: {formatDateTime(incident.start_time)}
                      </div>
                      {incident.end_time ? (
                        <>
                          <div>Ended: {formatDateTime(incident.end_time)}</div>
                          <div className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Duration: {formatDuration(incident.duration_mins)}
                          </div>
                        </>
                      ) : (
                        <div className="text-destructive">Ongoing</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
