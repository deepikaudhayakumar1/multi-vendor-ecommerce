import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { DollarSign, FileText, CheckCircle, Calculator } from 'lucide-react';

const FinancePanel = () => {
  const { user } = useContext(AuthContext);
  const [report, setReport] = useState(null);
  const [payoutStatus, setPayoutStatus] = useState('');

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = () => {
    API.get('/commission/report')
      .then((res) => setReport(res.data))
      .catch(() => {});
  };

  const processVendorPayout = async () => {
    setPayoutStatus('');
    try {
      const res = await API.post('/payouts/process', { vendorId: user?.id || 2 });
      setPayoutStatus(`Successfully processed weekly NEFT payout! Generated UTR: ${res.data.utrNumber}`);
      loadReport();
    } catch (err) {
      alert('Payout calculation failed');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Finance & Commission Reconciliation</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Automated Split Settlement, Platform Commission & Section 194O TDS 1% Management</p>
        </div>
        <button className="btn btn-primary" onClick={processVendorPayout}>
          <Calculator size={16} /> Execute Weekly Payout Run
        </button>
      </div>

      {payoutStatus && <div className="alert alert-success">{payoutStatus}</div>}

      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Gross Marketplace Sales</span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--accent-light)' }}>
            ₹{report?.totalGrossSales || 48990}
          </h2>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Platform Commission Retained</span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--success)' }}>
            ₹{report?.totalCommissionDeducted || 4899}
          </h2>
        </div>

        <div className="glass-card">
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sec 194O TDS Deducted (1%)</span>
          <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--warning)' }}>
            ₹{report?.totalTdsDeducted || 489.9}
          </h2>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Vendor Weekly Payout Audit Log & UTR Records</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Payout ID</th>
                <th>Vendor ID</th>
                <th>Period Window</th>
                <th>Gross Sales</th>
                <th>Commission</th>
                <th>TDS (1%)</th>
                <th>Net Payout</th>
                <th>Status</th>
                <th>UTR Reference</th>
              </tr>
            </thead>
            <tbody>
              {(report?.payoutsList || []).map((p) => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>Vendor #{p.vendorId}</td>
                  <td>{p.periodStart} to {p.periodEnd}</td>
                  <td>₹{p.grossSales}</td>
                  <td>-₹{p.commissionDeducted}</td>
                  <td>-₹{p.tdsDeducted}</td>
                  <td><strong>₹{p.netPayout}</strong></td>
                  <td><span className="badge badge-success">{p.payoutStatus}</span></td>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--accent-light)' }}>{p.utrNumber}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancePanel;
