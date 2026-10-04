import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, CheckCircle2 } from 'lucide-react';

export default function ExcelUploadModal({ token, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel (.xlsx / .xls) file.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const res = await fetch('/api/admin/import-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import Excel data.');

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
            <FileSpreadsheet size={22} style={{ color: 'var(--emerald)' }} />
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700, color: '#f8fafc' }}>
              Import Staff Strength Excel Data
            </h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px' }}><X size={18} /></button>
        </div>

        {error && (
          <div style={{ background: 'rgba(244, 63, 94, 0.2)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#f43f5e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '28px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
            <Upload size={36} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
              {file ? file.name : 'Select or Drag Excel Spreadsheet'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Supports .xlsx, .xls spreadsheets (Designation & Office wise strength format)
            </div>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} id="excel-file-input" style={{ display: 'none' }} />
            <label htmlFor="excel-file-input" className="btn-secondary" style={{ cursor: 'pointer' }}>
              Browse File...
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading || !file} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <CheckCircle2 size={16} /> {loading ? 'Processing Spreadsheet...' : 'Upload & Update Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
