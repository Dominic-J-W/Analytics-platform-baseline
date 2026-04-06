import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Factory, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Play, 
  Square, 
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface Station {
  stid: string;
  name: string;
  station_code: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_by_uid: string;
}

interface ProductionRun {
  rid: string;
  stid: string;
  pid: string;
  shift_lead_uid: string;
  start_time: Date;
  end_time: Date | null;
  status: 'active' | 'completed' | 'aborted';
  station_name?: string;
  product_name?: string;
  shift_lead_name?: string;
}

export function Operations() {
  const { hasPermission, user } = useAuth();
  const canManage = hasPermission('operations_manage');

  const [activeTab, setActiveTab] = useState<'stations' | 'runs'>('stations');
  const [searchTerm, setSearchTerm] = useState('');

  const [stations, setStations] = useState<Station[]>([
    { stid: '1', name: 'Assembly Line A', station_code: 'STN-001', status: 'active', created_by_uid: '1' },
    { stid: '2', name: 'Packaging Station B', station_code: 'STN-002', status: 'active', created_by_uid: '1' },
    { stid: '3', name: 'Quality Control C', station_code: 'STN-003', status: 'maintenance', created_by_uid: '1' },
    { stid: '4', name: 'Warehouse D', station_code: 'STN-004', status: 'inactive', created_by_uid: '1' },
  ]);

  const products = [
    { pid: '1', name: 'Widget Pro' },
    { pid: '2', name: 'Component X' },
    { pid: '3', name: 'Gadget Max' },
  ];

  const [productionRuns, setProductionRuns] = useState<ProductionRun[]>([
    { rid: '1', stid: '1', pid: '1', shift_lead_uid: '1', start_time: new Date('2026-03-05T06:00:00'), end_time: null, status: 'active', station_name: 'Assembly Line A', product_name: 'Widget Pro', shift_lead_name: 'admin_user' },
    { rid: '2', stid: '2', pid: '2', shift_lead_uid: '1', start_time: new Date('2026-03-05T06:00:00'), end_time: new Date('2026-03-05T14:00:00'), status: 'completed', station_name: 'Packaging Station B', product_name: 'Component X', shift_lead_name: 'admin_user' },
    { rid: '3', stid: '1', pid: '3', shift_lead_uid: '1', start_time: new Date('2026-03-04T14:00:00'), end_time: new Date('2026-03-04T20:00:00'), status: 'aborted', station_name: 'Assembly Line A', product_name: 'Gadget Max', shift_lead_name: 'admin_user' },
  ]);

  const [showStationForm, setShowStationForm] = useState(false);
  const [showRunForm, setShowRunForm] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [editingRun, setEditingRun] = useState<ProductionRun | null>(null);

  // Station form state
  const [stationForm, setStationForm] = useState({ name: '', station_code: '', status: 'active' as Station['status'] });

  // Run form state
  const [runForm, setRunForm] = useState({ stid: '', pid: '', start_time: '', end_time: '', status: 'active' as ProductionRun['status'] });

  const openStationForm = (station?: Station) => {
    if (station) {
      setEditingStation(station);
      setStationForm({ name: station.name, station_code: station.station_code, status: station.status });
    } else {
      setEditingStation(null);
      setStationForm({ name: '', station_code: '', status: 'active' });
    }
    setShowStationForm(true);
  };

  const openRunForm = (run?: ProductionRun) => {
    if (run) {
      setEditingRun(run);
      setRunForm({
        stid: run.stid,
        pid: run.pid,
        start_time: run.start_time.toISOString().slice(0, 16),
        end_time: run.end_time ? run.end_time.toISOString().slice(0, 16) : '',
        status: run.status,
      });
    } else {
      setEditingRun(null);
      setRunForm({ stid: '', pid: '', start_time: new Date().toISOString().slice(0, 16), end_time: '', status: 'active' });
    }
    setShowRunForm(true);
  };

  const handleSaveStation = () => {
    if (!stationForm.name || !stationForm.station_code) return;
    if (editingStation) {
      setStations(stations.map(s => s.stid === editingStation.stid ? { ...s, ...stationForm } : s));
    } else {
      const newStation: Station = {
        stid: Date.now().toString(),
        name: stationForm.name,
        station_code: stationForm.station_code,
        status: stationForm.status,
        created_by_uid: user?.uid || '1',
      };
      setStations([...stations, newStation]);
    }
    setShowStationForm(false);
    setEditingStation(null);
  };

  const handleSaveRun = () => {
    if (!runForm.stid || !runForm.pid || !runForm.start_time) return;
    const station = stations.find(s => s.stid === runForm.stid);
    const product = products.find(p => p.pid === runForm.pid);

    if (editingRun) {
      setProductionRuns(productionRuns.map(r => r.rid === editingRun.rid ? {
        ...r,
        stid: runForm.stid,
        pid: runForm.pid,
        start_time: new Date(runForm.start_time),
        end_time: runForm.end_time ? new Date(runForm.end_time) : null,
        status: runForm.status,
        station_name: station?.name,
        product_name: product?.name,
      } : r));
    } else {
      const newRun: ProductionRun = {
        rid: Date.now().toString(),
        stid: runForm.stid,
        pid: runForm.pid,
        shift_lead_uid: user?.uid || '1',
        start_time: new Date(runForm.start_time),
        end_time: runForm.end_time ? new Date(runForm.end_time) : null,
        status: runForm.status,
        station_name: station?.name,
        product_name: product?.name,
        shift_lead_name: user?.username || 'admin_user',
      };
      setProductionRuns([...productionRuns, newRun]);
    }
    setShowRunForm(false);
    setEditingRun(null);
  };

  const handleDeleteStation = (stid: string) => {
    if (confirm('Are you sure you want to delete this station?')) {
      setStations(stations.filter(s => s.stid !== stid));
    }
  };

  const handleDeleteRun = (rid: string) => {
    if (confirm('Are you sure you want to delete this production run?')) {
      setProductionRuns(productionRuns.filter(r => r.rid !== rid));
    }
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'aborted': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'inactive': return <XCircle className="w-4 h-4" />;
      case 'maintenance': return <AlertCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'aborted': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const filteredStations = stations.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.station_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRuns = productionRuns.filter(r =>
    r.station_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.rid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-foreground mb-1">Operations Management</h2>
        <p className="text-muted-foreground">Manage production stations and manufacturing runs</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stations, runs, or codes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab('stations')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${activeTab === 'stations' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Factory className="w-4 h-4" />
              Stations ({stations.length})
            </button>
            <button
              onClick={() => setActiveTab('runs')}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${activeTab === 'runs' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              <Play className="w-4 h-4" />
              Production Runs ({productionRuns.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Stations Tab */}
          {activeTab === 'stations' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredStations.length} station{filteredStations.length !== 1 ? 's' : ''}
                </p>
                {canManage && (
                  <button onClick={() => openStationForm()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Station
                  </button>
                )}
              </div>

              {showStationForm && (
                <div className="bg-accent rounded-lg border border-border p-4 space-y-4">
                  <h3 className="text-sm text-foreground">{editingStation ? 'Edit Station' : 'Add New Station'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Station Name</label>
                      <input type="text" value={stationForm.name} onChange={(e) => setStationForm({ ...stationForm, name: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" placeholder="e.g., Assembly Line A" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Station Code</label>
                      <input type="text" value={stationForm.station_code} onChange={(e) => setStationForm({ ...stationForm, station_code: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" placeholder="e.g., STN-001" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-foreground mb-2">Status</label>
                      <select value={stationForm.status} onChange={(e) => setStationForm({ ...stationForm, status: e.target.value as Station['status'] })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setShowStationForm(false); setEditingStation(null); }} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">Cancel</button>
                    <button onClick={handleSaveStation} disabled={!stationForm.name || !stationForm.station_code} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {editingStation ? 'Update Station' : 'Create Station'}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStations.map((station) => (
                  <div key={station.stid} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Factory className="w-5 h-5 text-primary" />
                          <h4 className="text-foreground">{station.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">Code: <span className="font-mono">{station.station_code}</span></p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${getStatusColor(station.status)}`}>
                          {getStatusIcon(station.status)}
                          {station.status}
                        </span>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <button onClick={() => openStationForm(station)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteStation(station.stid)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredStations.length === 0 && (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                  <Factory className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No stations found</p>
                </div>
              )}
            </div>
          )}

          {/* Production Runs Tab */}
          {activeTab === 'runs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredRuns.length} production run{filteredRuns.length !== 1 ? 's' : ''}
                </p>
                {canManage && (
                  <button onClick={() => openRunForm()} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    Start New Run
                  </button>
                )}
              </div>

              {showRunForm && (
                <div className="bg-accent rounded-lg border border-border p-4 space-y-4">
                  <h3 className="text-sm text-foreground">{editingRun ? 'Edit Production Run' : 'Start New Production Run'}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-foreground mb-2">Station</label>
                      <select value={runForm.stid} onChange={(e) => setRunForm({ ...runForm, stid: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="">Select station</option>
                        {stations.filter(s => s.status === 'active').map(s => (
                          <option key={s.stid} value={s.stid}>{s.name} ({s.station_code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Product</label>
                      <select value={runForm.pid} onChange={(e) => setRunForm({ ...runForm, pid: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.pid} value={p.pid}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">Start Time</label>
                      <input type="datetime-local" value={runForm.start_time} onChange={(e) => setRunForm({ ...runForm, start_time: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                    </div>
                    <div>
                      <label className="block text-sm text-foreground mb-2">End Time (optional)</label>
                      <input type="datetime-local" value={runForm.end_time} onChange={(e) => setRunForm({ ...runForm, end_time: e.target.value })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm text-foreground mb-2">Status</label>
                      <select value={runForm.status} onChange={(e) => setRunForm({ ...runForm, status: e.target.value as ProductionRun['status'] })} className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground">
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="aborted">Aborted</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => { setShowRunForm(false); setEditingRun(null); }} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">Cancel</button>
                    <button onClick={handleSaveRun} disabled={!runForm.stid || !runForm.pid || !runForm.start_time} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {editingRun ? 'Update Run' : 'Start Run'}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {filteredRuns.map((run) => (
                  <div key={run.rid} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${getStatusColor(run.status)}`}>
                            {getStatusIcon(run.status)}
                            {run.status}
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">RUN-{run.rid}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div><span className="text-muted-foreground">Station:</span> <span className="text-foreground">{run.station_name}</span></div>
                          <div><span className="text-muted-foreground">Product:</span> <span className="text-foreground">{run.product_name}</span></div>
                          <div><span className="text-muted-foreground">Shift Lead:</span> <span className="text-foreground">{run.shift_lead_name}</span></div>
                          <div>
                            <span className="text-muted-foreground">Duration:</span>{' '}
                            <span className="text-foreground">
                              {run.end_time ? `${Math.round((run.end_time.getTime() - run.start_time.getTime()) / (1000 * 60 * 60))}h` : 'Ongoing'}
                            </span>
                          </div>
                        </div>
                      </div>
                      {canManage && (
                        <div className="flex gap-1">
                          <button onClick={() => openRunForm(run)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteRun(run.rid)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Started: {formatDateTime(run.start_time)}
                      </div>
                      {run.end_time && (
                        <div className="flex items-center gap-1">
                          <Square className="w-3 h-3" />
                          Ended: {formatDateTime(run.end_time)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredRuns.length === 0 && (
                <div className="bg-card rounded-lg border border-border p-12 text-center">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No production runs found</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
