import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';

export default function AddStaffModal({ offices, designations, token, onClose, onSuccess }) {
  const [pen, setPen] = useState('');
  const [name, setName] = useState('');
  const [officeId, setOfficeId] = useState('');
  const [designationId, setDesignationId] = useState('');
  const [department, setDepartment] = useState('Land Revenue');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pen || !name || !officeId || !designationId) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/staff/officers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pen,
          name,
          office_id: parseInt(officeId),
          designation_id: parseInt(designationId),
          department
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add officer.');

      onSuccess(data.message);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '28px', background: '#1e293b', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Add New Revenue Officer
            </h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Permanent Employee Number (PEN)
            </label>
            <input type="text" value={pen} onChange={(e) => setPen(e.target.value)} required placeholder="e.g. PEN802194" className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Officer Full Name
            </label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Sreejith K. Nair" className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Designation / Role
            </label>
            <select value={designationId} onChange={(e) => setDesignationId(e.target.value)} required className="glass-input" style={{ width: '100%' }}>
              <option value="">-- Select Designation --</option>
              {designations.map(d => (
                <option key={d.id} value={d.id}>{d.full_title} ({d.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Assigned Kottayam Revenue Office
            </label>
            <select value={officeId} onChange={(e) => setOfficeId(e.target.value)} required className="glass-input" style={{ width: '100%' }}>
              <option value="">-- Select Office --</option>
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.name} ({o.category})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
              Department / Branch
            </label>
            <select value={department} onChange={(e) => setDepartment(e.target.value)} className="glass-input" style={{ width: '100%' }}>
              <option value="Land Revenue">Land Revenue</option>
              <option value="General Administration">General Administration</option>
              <option value="Election">Election</option>
              <option value="Disaster Management">Disaster Management</option>
              <option value="Revenue Recovery">Revenue Recovery</option>
              <option value="Land Acquisition">Land Acquisition</option>
              <option value="Survey & Land Records">Survey & Land Records</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              <Save size={16} /> {loading ? 'Saving...' : 'Add Officer Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
