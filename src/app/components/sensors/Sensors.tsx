import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Radio, Plus, Edit2, Trash2, Search, Activity, AlertCircle, Database } from 'lucide-react';

interface Sensor {
  sid: string;
  strid: string;
  name: string;
  sensor_type: string;
  status: 'active' | 'inactive' | 'error';
  location?: string;
  lastReading?: number;
  unit?: string;
  threshold?: { min: number; max: number };
  lastUpdate?: Date;
}

interface SensorStream {
  strid: string;
  stid: string;
  name: string;
  protocol: 'mqtt' | 'opcua' | 'http' | 'file';
  status: 'active' | 'inactive' | 'error';
}

interface SensorReading {
  reading_id: string;
  sid: string;
  rid: string;
  value: number;
  reading_ts: Date;
  sensor_name?: string;
  run_info?: string;
}

export function Sensors() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('sensors_manage');

  const [activeTab, setActiveTab] = useState<'sensors' | 'streams' | 'readings'>('sensors');

  const sensorStreams: SensorStream[] = [
    { strid: 'STR-001', stid: 'STN-001', name: 'Production Line A Stream', protocol: 'mqtt', status: 'active' },
    { strid: 'STR-002', stid: 'STN-002', name: 'Hydraulic System Stream', protocol: 'opcua', status: 'active' },
  ];

  const [sensors, setSensors] = useState<Sensor[]>([
    { sid: '1', strid: 'STR-001', name: 'Temperature Sensor A1', sensor_type: 'temperature', status: 'active', location: 'Production Line A - Zone 1', lastReading: 72.5, unit: '°F', threshold: { min: 60, max: 85 }, lastUpdate: new Date('2026-03-20T13:45:00') },
    { sid: '2', strid: 'STR-002', name: 'Pressure Monitor B2', sensor_type: 'pressure', status: 'active', location: 'Hydraulic System B', lastReading: 145.2, unit: 'PSI', threshold: { min: 100, max: 175 }, lastUpdate: new Date('2026-03-20T13:44:00') },
    { sid: '3', strid: 'STR-001', name: 'Vibration Sensor C1', sensor_type: 'vibration', status: 'active', location: 'Motor Assembly C', lastReading: 3.8, unit: 'mm/s', threshold: { min: 0, max: 7.1 }, lastUpdate: new Date('2026-03-20T13:45:00') },
    { sid: '4', strid: 'STR-001', name: 'Flow Meter D3', sensor_type: 'flow', status: 'inactive', location: 'Cooling System D', lastReading: 0, unit: 'GPM', threshold: { min: 15, max: 50 }, lastUpdate: new Date('2026-03-19T08:20:00') },
  ]);

  const [sensorReadings, setSensorReadings] = useState<SensorReading[]>([
    { reading_id: 'RDG-001', sid: '1', rid: 'RUN-001', value: 72.5, reading_ts: new Date('2026-03-20T13:45:00'), sensor_name: 'Temperature Sensor A1', run_info: 'Production Run 001' },
    { reading_id: 'RDG-002', sid: '2', rid: 'RUN-002', value: 145.2, reading_ts: new Date('2026-03-20T13:44:00'), sensor_name: 'Pressure Monitor B2', run_info: 'Production Run 002' },
    { reading_id: 'RDG-003', sid: '3', rid: 'RUN-003', value: 3.8, reading_ts: new Date('2026-03-20T13:45:00'), sensor_name: 'Vibration Sensor C1', run_info: 'Production Run 003' },
    { reading_id: 'RDG-004', sid: '1', rid: 'RUN-001', value: 73.1, reading_ts: new Date('2026-03-20T14:00:00'), sensor_name: 'Temperature Sensor A1', run_info: 'Production Run 001' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);
  const [showReadingForm, setShowReadingForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', sensor_type: '', strid: '', location: '', status: 'active' as Sensor['status'], unit: '', minThreshold: '', maxThreshold: '' });
  const [readingForm, setReadingForm] = useState({ sid: '', rid: '', value: '', reading_ts: '' });

  const handleAdd = () => {
    setFormData({ name: '', sensor_type: '', strid: '', location: '', status: 'active', unit: '', minThreshold: '', maxThreshold: '' });
    setEditingSensor(null);
    setShowForm(true);
  };

  const handleEdit = (sensor: Sensor) => {
    setFormData({
      name: sensor.name, sensor_type: sensor.sensor_type, strid: sensor.strid,
      location: sensor.location || '', status: sensor.status, unit: sensor.unit || '',
      minThreshold: sensor.threshold?.min.toString() || '', maxThreshold: sensor.threshold?.max.toString() || '',
    });
    setEditingSensor(sensor);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.sensor_type || !formData.strid) return;
    const threshold = { min: parseFloat(formData.minThreshold) || 0, max: parseFloat(formData.maxThreshold) || 100 };
    if (editingSensor) {
      setSensors(sensors.map(s => s.sid === editingSensor.sid ? { ...s, name: formData.name, sensor_type: formData.sensor_type, strid: formData.strid, location: formData.location, status: formData.status, unit: formData.unit, threshold } : s));
    } else {
      setSensors([...sensors, { sid: Date.now().toString(), strid: formData.strid, name: formData.name, sensor_type: formData.sensor_type, status: formData.status, location: formData.location, unit: formData.unit, threshold, lastReading: 0, lastUpdate: new Date() }]);
    }
    setShowForm(false);
    setEditingSensor(null);
  };

  const handleDelete = (sid: string) => {
    if (confirm('Are you sure you want to delete this sensor?')) {
      setSensors(sensors.filter(s => s.sid !== sid));
      setSensorReadings(sensorReadings.filter(r => r.sid !== sid));
    }
  };

  const handleAddReading = () => {
    setReadingForm({ sid: '', rid: '', value: '', reading_ts: new Date().toISOString().slice(0, 16) });
    setShowReadingForm(true);
  };

  const handleSaveReading = () => {
    if (!readingForm.sid || !readingForm.rid || !readingForm.value || !readingForm.reading_ts) return;
    const sensor = sensors.find(s => s.sid === readingForm.sid);
    const newReading: SensorReading = {
      reading_id: `RDG-${Date.now()}`,
      sid: readingForm.sid,
      rid: readingForm.rid,
      value: parseFloat(readingForm.value),
      reading_ts: new Date(readingForm.reading_ts),
      sensor_name: sensor?.name,
      run_info: `Production Run ${readingForm.rid.replace('RUN-', '')}`,
    };
    setSensorReadings([newReading, ...sensorReadings]);
    // Update sensor's last reading
    if (sensor) {
      setSensors(sensors.map(s => s.sid === readingForm.sid ? { ...s, lastReading: parseFloat(readingForm.value), lastUpdate: new Date(readingForm.reading_ts) } : s));
    }
    setShowReadingForm(false);
  };

  const handleDeleteReading = (reading_id: string) => {
    if (confirm('Delete this reading?')) {
      setSensorReadings(sensorReadings.filter(r => r.reading_id !== reading_id));
    }
  };

  const getStatusColor = (status: Sensor['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'error': return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const isOutOfRange = (sensor: Sensor) => {
    if (sensor.lastReading === undefined || !sensor.threshold) return false;
    return sensor.lastReading < sensor.threshold.min || sensor.lastReading > sensor.threshold.max;
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const filteredSensors = sensors.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sensor_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredReadings = sensorReadings.filter(r =>
    r.sensor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.run_info?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-foreground mb-1">Sensors & Streams</h2>
          <p className="text-muted-foreground">Monitor and manage IoT sensors, streams, and readings</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search sensors, readings..." className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground" />
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border">
        <button onClick={() => setActiveTab('sensors')} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'sensors' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <Radio className="w-4 h-4" /> Sensors ({sensors.length})
        </button>
        <button onClick={() => setActiveTab('streams')} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'streams' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <Activity className="w-4 h-4" /> Streams ({sensorStreams.length})
        </button>
        <button onClick={() => setActiveTab('readings')} className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${activeTab === 'readings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          <Database className="w-4 h-4" /> Readings ({sensorReadings.length})
        </button>
      </div>

      {/* Sensor Form */}
      {showForm && (
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <h3 className="text-lg text-foreground mb-4">{editingSensor ? 'Edit Sensor' : 'Add New Sensor'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-foreground mb-2">Sensor Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" placeholder="e.g., Temperature Sensor A1" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Sensor Type</label>
              <input type="text" value={formData.sensor_type} onChange={(e) => setFormData({ ...formData, sensor_type: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" placeholder="e.g., temperature, pressure" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Sensor Stream</label>
              <select value={formData.strid} onChange={(e) => setFormData({ ...formData, strid: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card">
                <option value="">Select a stream...</option>
                {sensorStreams.map(s => <option key={s.strid} value={s.strid}>{s.name} ({s.protocol})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Unit</label>
              <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" placeholder="e.g., °F, PSI" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-foreground mb-2">Location</label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" placeholder="e.g., Production Line A - Zone 1" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Min Threshold</label>
              <input type="number" value={formData.minThreshold} onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Max Threshold</label>
              <input type="number" value={formData.maxThreshold} onChange={(e) => setFormData({ ...formData, maxThreshold: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as Sensor['status'] })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="error">Error</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setShowForm(false); setEditingSensor(null); }} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={!formData.name || !formData.sensor_type || !formData.strid} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {editingSensor ? 'Save Changes' : 'Add Sensor'}
            </button>
          </div>
        </div>
      )}

      {/* Reading Form */}
      {showReadingForm && (
        <div className="bg-card rounded-lg border border-border shadow-sm p-6">
          <h3 className="text-lg text-foreground mb-4">Add Sensor Reading</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-foreground mb-2">Sensor</label>
              <select value={readingForm.sid} onChange={(e) => setReadingForm({ ...readingForm, sid: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card">
                <option value="">Select sensor...</option>
                {sensors.filter(s => s.status === 'active').map(s => <option key={s.sid} value={s.sid}>{s.name} ({s.unit})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Production Run ID</label>
              <input type="text" value={readingForm.rid} onChange={(e) => setReadingForm({ ...readingForm, rid: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" placeholder="e.g., RUN-001" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Value</label>
              <input type="number" step="0.01" value={readingForm.value} onChange={(e) => setReadingForm({ ...readingForm, value: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" placeholder="Reading value" />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-2">Timestamp</label>
              <input type="datetime-local" value={readingForm.reading_ts} onChange={(e) => setReadingForm({ ...readingForm, reading_ts: e.target.value })} className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground bg-card" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowReadingForm(false)} className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors">Cancel</button>
            <button onClick={handleSaveReading} disabled={!readingForm.sid || !readingForm.rid || !readingForm.value} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Add Reading
            </button>
          </div>
        </div>
      )}

      {/* Sensors Tab */}
      {activeTab === 'sensors' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {canManage && (
              <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Sensor
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredSensors.map((sensor) => (
              <div key={sensor.sid} className="bg-card rounded-lg border border-border shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${sensor.status === 'active' ? 'bg-green-100' : sensor.status === 'error' ? 'bg-red-100' : 'bg-slate-100'}`}>
                      <Radio className={`w-5 h-5 ${sensor.status === 'active' ? 'text-green-600' : sensor.status === 'error' ? 'text-red-600' : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-foreground">{sensor.name}</h3>
                        {sensor.status === 'active' && isOutOfRange(sensor) && <AlertCircle className="w-4 h-4 text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-muted-foreground capitalize">{sensor.sensor_type}</span>
                        <span className={`px-2 py-0.5 text-xs rounded border capitalize ${getStatusColor(sensor.status)}`}>{sensor.status}</span>
                      </div>
                      {sensor.location && <p className="text-sm text-muted-foreground mb-2">{sensor.location}</p>}
                      <p className="text-xs text-blue-600">Stream: {sensorStreams.find(s => s.strid === sensor.strid)?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(sensor)} className="p-2 text-muted-foreground hover:text-primary hover:bg-accent rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(sensor.sid)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {sensor.lastReading !== undefined && sensor.unit && sensor.threshold && (
                  <div className="bg-muted rounded-lg p-3 mb-3">
                    <div className="flex items-baseline gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground mt-1" />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl text-foreground">{sensor.lastReading}</span>
                          <span className="text-sm text-muted-foreground">{sensor.unit}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Range: {sensor.threshold.min} - {sensor.threshold.max} {sensor.unit}</div>
                      </div>
                    </div>
                  </div>
                )}
                {sensor.lastUpdate && <div className="text-xs text-muted-foreground">Last update: {formatTimestamp(sensor.lastUpdate)}</div>}
              </div>
            ))}
          </div>
          {filteredSensors.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Radio className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No sensors found</p>
            </div>
          )}
        </div>
      )}

      {/* Streams Tab */}
      {activeTab === 'streams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sensorStreams.map((stream) => (
            <div key={stream.strid} className="bg-card rounded-lg border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-foreground">{stream.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: <span className="font-mono">{stream.strid}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Protocol:</span> <span className="text-foreground uppercase">{stream.protocol}</span></div>
                <div><span className="text-muted-foreground">Station:</span> <span className="text-foreground font-mono">{stream.stid}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 text-xs rounded border capitalize ${stream.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>{stream.status}</span></div>
                <div><span className="text-muted-foreground">Sensors:</span> <span className="text-foreground">{sensors.filter(s => s.strid === stream.strid).length}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Readings Tab */}
      {activeTab === 'readings' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            {canManage && (
              <button onClick={handleAddReading} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> Add Reading
              </button>
            )}
          </div>
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm text-muted-foreground">ID</th>
                    <th className="text-left px-4 py-3 text-sm text-muted-foreground">Sensor</th>
                    <th className="text-left px-4 py-3 text-sm text-muted-foreground">Run</th>
                    <th className="text-left px-4 py-3 text-sm text-muted-foreground">Value</th>
                    <th className="text-left px-4 py-3 text-sm text-muted-foreground">Timestamp</th>
                    {canManage && <th className="text-right px-4 py-3 text-sm text-muted-foreground">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredReadings.map((reading) => {
                    const sensor = sensors.find(s => s.sid === reading.sid);
                    return (
                      <tr key={reading.reading_id} className="hover:bg-accent transition-colors">
                        <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{reading.reading_id}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{reading.sensor_name}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{reading.run_info}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{reading.value} {sensor?.unit || ''}</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatTimestamp(reading.reading_ts)}</td>
                        {canManage && (
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleDeleteReading(reading.reading_id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {filteredReadings.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-12 text-center">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground">No readings found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
