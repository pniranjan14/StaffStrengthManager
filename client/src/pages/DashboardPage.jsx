import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import SummaryCards from '../components/SummaryCards';
import EditStaffModal from '../components/EditStaffModal';
import TransferModal from '../components/TransferModal';
import PromoteModal from '../components/PromoteModal';
import AddStaffModal from '../components/AddStaffModal';
import ExcelUploadModal from '../components/ExcelUploadModal';
import { Search, Filter, RefreshCw, UserPlus, FileSpreadsheet, Edit, ArrowRightLeft, Award, Building, Table, History, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { token, isAdmin } = useAuth();

  const [summary, setSummary] = useState(null);
  const [offices, setOffices] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [matrixData, setMatrixData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedOffice, setSelectedOffice] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'matrix', 'offices', 'audit'

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Notifications & Modals
  const [toast, setToast] = useState('');
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [transferringOfficer, setTransferringOfficer] = useState(null);
  const [promotingOfficer, setPromotingOfficer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/staff/summary', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOfficesAndDesigs = async () => {
    try {
      const [resOff, resDes] = await Promise.all([
        fetch('/api/offices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/offices/designations', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      const dataOff = await resOff.json();
      const dataDes = await resDes.json();
      setOffices(dataOff);
      setDesignations(dataDes);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOfficers = async () => {
    try {
      const query = new URLSearchParams({
        page,
        limit: 20,
        search,
        office_id: selectedOffice,
        designation_id: selectedDesignation,
        department: selectedDepartment
      });
      const res = await fetch(`/api/staff/officers?${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setOfficers(data.officers || []);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMatrix = async () => {
    try {
      const query = new URLSearchParams({ office_id: selectedOffice });
      const res = await fetch(`/api/staff/strength-matrix?${query}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setMatrixData(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/staff/audit-logs', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      setAuditLogs(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchOfficesAndDesigs();
  }, [token]);

  useEffect(() => {
    if (activeTab === 'directory') fetchOfficers();
    if (activeTab === 'matrix') fetchMatrix();
    if (activeTab === 'audit' && isAdmin) fetchAuditLogs();
  }, [token, page, search, selectedOffice, selectedDesignation, selectedDepartment, activeTab]);

  const handleActionSuccess = (msg) => {
    showToast(msg);
    fetchSummary();
    fetchOfficers();
    fetchMatrix();
    if (isAdmin) fetchAuditLogs();
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      <Navbar onOpenUpload={() => setShowUploadModal(true)} />

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Toast Notification */}
        {toast && (
          <div className="animate-fade-in" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 200, background: 'rgba(16, 185, 129, 0.95)', color: '#ffffff', padding: '14px 20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 600 }}>
            <CheckCircle2 size={20} /> {toast}
          </div>
        )}

        {/* Top Summary Statistics Cards */}
        <SummaryCards summary={summary} />

        {/* Controls & Search Header */}
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
            
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search Officer Name, PEN, Office, Designation..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="glass-input"
                style={{ width: '100%', paddingLeft: '42px' }}
              />
            </div>

            {/* Office Filter */}
            <div style={{ flex: '1 1 200px' }}>
              <select value={selectedOffice} onChange={(e) => { setSelectedOffice(e.target.value); setPage(1); }} className="glass-input" style={{ width: '100%' }}>
                <option value="">-- All Kottayam Offices ({offices.length}) --</option>
                {offices.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Designation Filter */}
            <div style={{ flex: '1 1 180px' }}>
              <select value={selectedDesignation} onChange={(e) => { setSelectedDesignation(e.target.value); setPage(1); }} className="glass-input" style={{ width: '100%' }}>
                <option value="">-- All Designations ({designations.length}) --</option>
                {designations.map(d => (
                  <option key={d.id} value={d.id}>{d.full_title} ({d.code})</option>
                ))}
              </select>
            </div>

            {/* Admin Add Officer Action */}
            {isAdmin && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ padding: '10px 18px' }}>
                <UserPlus size={18} /> Add Officer
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', overflowX: 'auto' }}>
          <button onClick={() => setActiveTab('directory')} className={activeTab === 'directory' ? 'btn-primary' : 'btn-secondary'}>
            <Table size={16} /> Officers Directory & Actions
          </button>
          <button onClick={() => setActiveTab('matrix')} className={activeTab === 'matrix' ? 'btn-primary' : 'btn-secondary'}>
            <FileSpreadsheet size={16} /> Staff Strength Matrix (Office & Designation)
          </button>
          <button onClick={() => setActiveTab('offices')} className={activeTab === 'offices' ? 'btn-primary' : 'btn-secondary'}>
            <Building size={16} /> Kottayam Revenue Offices ({offices.length})
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab('audit')} className={activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}>
              <History size={16} /> Transfer & Edit Audit Trail
            </button>
          )}
        </div>

        {/* Tab 1: Directory Table */}
        {activeTab === 'directory' && (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>PEN</th>
                    <th>Officer Name</th>
                    <th>Designation / Role</th>
                    <th>Office Location</th>
                    <th>Department</th>
                    <th>Status</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Actions (Edits / Transfer)</th>}
                  </tr>
                </thead>
                <tbody>
                  {officers.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                        No officers matching the specified filter criteria.
                      </td>
                    </tr>
                  ) : (
                    officers.map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{o.pen}</td>
                        <td style={{ fontWeight: 600, color: '#f8fafc' }}>{o.name}</td>
                        <td>
                          <span className="badge badge-category">{o.desig_title}</span>
                        </td>
                        <td style={{ color: '#f59e0b', fontWeight: 500 }}>{o.office_name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{o.department}</td>
                        <td>
                          <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            {o.status}
                          </span>
                        </td>
                        {isAdmin && (
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <button onClick={() => setEditingOfficer(o)} className="btn-action btn-edit" title="Edit Name / Details">
                                <Edit size={14} /> Edit
                              </button>
                              <button onClick={() => setTransferringOfficer(o)} className="btn-action btn-transfer" title="Transfer Officer">
                                <ArrowRightLeft size={14} /> Transfer
                              </button>
                              <button onClick={() => setPromotingOfficer(o)} className="btn-action btn-promote" title="Promote Officer">
                                <Award size={14} /> Promote
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Previous
                </button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Staff Strength Matrix */}
        {activeTab === 'matrix' && (
          <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
                Kottayam Revenue Staff Strength Breakdown
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Showing {matrixData.length} designation-office records
              </span>
            </div>
            <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Designation Code</th>
                    <th>Designation Full Title</th>
                    <th>Office Name</th>
                    <th>Office Category</th>
                    <th style={{ textAlign: 'center' }}>Sanctioned (Perm)</th>
                    <th style={{ textAlign: 'center' }}>Sanctioned (Temp)</th>
                    <th style={{ textAlign: 'center' }}>Working Strength</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixData.map(m => (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{m.desig_code}</td>
                      <td>{m.desig_title}</td>
                      <td style={{ fontWeight: 600, color: '#f8fafc' }}>{m.office_name}</td>
                      <td><span className="badge badge-category">{m.office_category}</span></td>
                      <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 600 }}>{m.sanctioned_permanent}</td>
                      <td style={{ textAlign: 'center', color: '#f59e0b', fontWeight: 600 }}>{m.sanctioned_temporary}</td>
                      <td style={{ textAlign: 'center', color: '#38bdf8', fontWeight: 700, fontSize: '15px' }}>{m.working_strength}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Offices Grid */}
        {activeTab === 'offices' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {offices.map(o => (
              <div key={o.id} className="glass-panel" style={{ padding: '20px', transition: 'all 0.2s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span className="badge badge-category">{o.category}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.code}</span>
                </div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
                  {o.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', background: 'rgba(15, 23, 42, 0.5)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Permanent</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>{o.permanent_sanctioned}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Temporary</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>{o.temporary_sanctioned}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Working</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>{o.total_working}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit' && isAdmin && (
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
              Recent Administrative Activity & Audit Trail
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {auditLogs.map(log => (
                <div key={log.id} style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="badge" style={{
                        background: log.action === 'TRANSFER' ? 'rgba(245, 158, 11, 0.2)' : log.action === 'PROMOTION' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                        color: log.action === 'TRANSFER' ? '#f59e0b' : log.action === 'PROMOTION' ? '#10b981' : '#38bdf8'
                      }}>
                        {log.action}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>{log.officer_name}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{log.details}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div>By: <strong style={{ color: '#f8fafc' }}>{log.performed_by}</strong></div>
                    <div>{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Modals */}
      {editingOfficer && (
        <EditStaffModal
          officer={editingOfficer}
          token={token}
          onClose={() => setEditingOfficer(null)}
          onSuccess={handleActionSuccess}
        />
      )}

      {transferringOfficer && (
        <TransferModal
          officer={transferringOfficer}
          offices={offices}
          token={token}
          onClose={() => setTransferringOfficer(null)}
          onSuccess={handleActionSuccess}
        />
      )}

      {promotingOfficer && (
        <PromoteModal
          officer={promotingOfficer}
          designations={designations}
          offices={offices}
          token={token}
          onClose={() => setPromotingOfficer(null)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showAddModal && (
        <AddStaffModal
          offices={offices}
          designations={designations}
          token={token}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {showUploadModal && (
        <ExcelUploadModal
          token={token}
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
}
